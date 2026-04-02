// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @notice Shadow USD (sUSD) — testnet token for ShadowSwap demos.
 *         Anyone can mint freely. Do not use on mainnet.
 */
contract MockERC20 is ERC20 {
    constructor() ERC20("Shadow USD", "sUSD") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
