// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Nox, euint256, externalEuint256, ebool} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {IERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/interfaces/IERC7984.sol";

/**
 * @title ShadowSwapOTC
 * @notice Confidential OTC desk — trade large amounts without revealing order sizes.
 *         Sell amounts are encrypted using iExec Nox. MEV bots see nothing.
 */
contract ShadowSwapOTC {
    // ============ Types ============

    struct Offer {
        address seller;
        address sellToken;    // confidential ERC-7984 token being sold
        address buyToken;     // confidential ERC-7984 token being bought
        uint256 pricePerUnit; // public: rate of exchange (buyToken units per sellToken unit, 1e18 scaled)
        euint256 amount;      // encrypted: remaining sell amount
        euint256 filled;      // encrypted: how much has been taken so far
        uint256 expiry;       // unix timestamp
        bool active;
    }

    // ============ State ============

    uint256 private _offerCount;
    mapping(uint256 => Offer) private _offers;
    mapping(address => uint256) public tradeCount;

    // ============ Events ============

    event OfferCreated(
        uint256 indexed offerId,
        address indexed seller,
        address sellToken,
        address buyToken,
        uint256 pricePerUnit,
        uint256 expiry
    );

    event OfferTaken(uint256 indexed offerId, address indexed buyer);
    event OfferCancelled(uint256 indexed offerId, address indexed seller);

    // ============ Errors ============

    error OfferNotFound(uint256 offerId);
    error OfferNotActive(uint256 offerId);
    error OfferExpired(uint256 offerId);
    error NotSeller(uint256 offerId, address caller);
    error InvalidExpiry();
    error InvalidToken();

    // ============ External Functions ============

    /**
     * @notice Create a new OTC sell offer with an encrypted amount.
     * @dev Caller must have set this contract as an operator on sellToken before calling.
     * @param sellToken   Confidential ERC-7984 token the seller is offering.
     * @param buyToken    Confidential ERC-7984 token the seller wants in return.
     * @param pricePerUnit Exchange rate (public): buyToken units per sellToken unit (1e18 scaled).
     * @param encAmount   Encrypted sell amount (from Nox JS SDK encryptInput).
     * @param proof       Input proof for the encrypted amount.
     * @param expiry      Unix timestamp when the offer expires.
     */
    function createOffer(
        address sellToken,
        address buyToken,
        uint256 pricePerUnit,
        externalEuint256 encAmount,
        bytes calldata proof,
        uint256 expiry
    ) external returns (uint256 offerId) {
        if (sellToken == address(0) || buyToken == address(0)) revert InvalidToken();
        if (expiry <= block.timestamp) revert InvalidExpiry();

        // Decrypt the external encrypted amount into an on-chain handle
        euint256 amount = Nox.fromExternal(encAmount, proof);
        Nox.allowThis(amount);
        Nox.allow(amount, msg.sender);
        Nox.allow(amount, sellToken); // csUSD contract needs ACL to use this handle internally

        // Pull confidential sell tokens from seller into this contract
        IERC7984(sellToken).confidentialTransferFrom(msg.sender, address(this), amount);

        // Initialize encrypted filled counter to zero
        euint256 filled = Nox.toEuint256(0);
        Nox.allowThis(filled);
        Nox.allow(filled, msg.sender);

        offerId = _offerCount++;

        _offers[offerId] = Offer({
            seller: msg.sender,
            sellToken: sellToken,
            buyToken: buyToken,
            pricePerUnit: pricePerUnit,
            amount: amount,
            filled: filled,
            expiry: expiry,
            active: true
        });

        emit OfferCreated(offerId, msg.sender, sellToken, buyToken, pricePerUnit, expiry);
    }

    /**
     * @notice Take (fill) an offer by providing an encrypted buy amount.
     * @dev The buyer passes `encBuyAmount` already normalised to sellToken units
     *      (i.e. desiredSellAmount * pricePerUnit / 1e18). The contract deducts
     *      that amount from the offer and sends the equivalent sell tokens to the buyer.
     *      If the offer has less than requested, the actual transferred amount is 0
     *      (Nox silent-zero semantics — no revert).
     * @dev Caller must have set this contract as an operator on buyToken before calling.
     */
    function takeOffer(
        uint256 offerId,
        externalEuint256 encBuyAmount,
        bytes calldata proof
    ) external {
        Offer storage offer = _getActiveOffer(offerId);

        // Decode buyer's encrypted amount into an on-chain handle
        euint256 buyAmount = Nox.fromExternal(encBuyAmount, proof);
        Nox.allowThis(buyAmount);
        Nox.allow(buyAmount, msg.sender);

        // Attempt to deduct sellAmount from remaining offer.amount.
        // safeSub returns (success, result): result = amount - buyAmount if success, else 0.
        (ebool enoughAmount, euint256 remaining) = Nox.safeSub(offer.amount, buyAmount);
        Nox.allowThis(remaining);
        Nox.allow(remaining, offer.seller);

        // Compute actual sell amount: if enough → buyAmount, else → 0
        euint256 zero = Nox.toEuint256(0);
        Nox.allowThis(zero);

        euint256 actualSell = Nox.select(enoughAmount, buyAmount, zero);
        Nox.allowThis(actualSell);
        Nox.allow(actualSell, msg.sender);
        Nox.allow(actualSell, offer.sellToken); // csUSD needs ACL to use this handle

        euint256 actualBuy = Nox.select(enoughAmount, buyAmount, zero);
        Nox.allowThis(actualBuy);
        Nox.allow(actualBuy, offer.seller);
        Nox.allow(actualBuy, offer.buyToken); // buyToken needs ACL to use this handle

        // Update offer: deduct from amount, add to filled
        offer.amount = remaining;

        (, euint256 newFilled) = Nox.safeAdd(offer.filled, actualSell);
        offer.filled = newFilled;
        Nox.allowThis(newFilled);
        Nox.allow(newFilled, offer.seller);
        Nox.allow(newFilled, msg.sender);

        // Transfer buyToken from buyer → seller
        IERC7984(offer.buyToken).confidentialTransferFrom(msg.sender, offer.seller, actualBuy);

        // Transfer sellToken from this contract → buyer
        IERC7984(offer.sellToken).confidentialTransfer(msg.sender, actualSell);

        // Reputation: increment trade count for both parties
        tradeCount[offer.seller]++;
        tradeCount[msg.sender]++;

        emit OfferTaken(offerId, msg.sender);
    }

    /**
     * @notice Cancel an active offer. Only the seller can cancel.
     *         Remaining encrypted sell tokens are returned to the seller.
     */
    function cancelOffer(uint256 offerId) external {
        Offer storage offer = _getActiveOffer(offerId);
        if (offer.seller != msg.sender) revert NotSeller(offerId, msg.sender);

        offer.active = false;

        // Return remaining encrypted sell tokens to seller
        euint256 remaining = offer.amount;
        Nox.allow(remaining, msg.sender);
        IERC7984(offer.sellToken).confidentialTransfer(msg.sender, remaining);

        emit OfferCancelled(offerId, msg.sender);
    }

    // ============ View Functions ============

    function getOfferCount() external view returns (uint256) {
        return _offerCount;
    }

    /**
     * @notice Returns the public fields of an offer.
     *         Encrypted fields (amount, filled) are intentionally omitted.
     */
    function getOffer(uint256 offerId)
        external
        view
        returns (
            address seller,
            address sellToken,
            address buyToken,
            uint256 pricePerUnit,
            uint256 expiry,
            bool active
        )
    {
        if (offerId >= _offerCount) revert OfferNotFound(offerId);
        Offer storage o = _offers[offerId];
        return (o.seller, o.sellToken, o.buyToken, o.pricePerUnit, o.expiry, o.active);
    }

    // ============ Internal Helpers ============

    function _getActiveOffer(uint256 offerId) internal view returns (Offer storage offer) {
        if (offerId >= _offerCount) revert OfferNotFound(offerId);
        offer = _offers[offerId];
        if (!offer.active) revert OfferNotActive(offerId);
        if (block.timestamp > offer.expiry) revert OfferExpired(offerId);
    }
}
