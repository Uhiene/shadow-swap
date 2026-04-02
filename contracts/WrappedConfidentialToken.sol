// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/token/ERC7984.sol";
import {ERC20ToERC7984Wrapper} from "@iexec-nox/nox-confidential-contracts/contracts/token/extensions/ERC20ToERC7984Wrapper.sol";

/**
 * @title WrappedConfidentialToken
 * @notice Wraps any ERC-20 token into a confidential ERC-7984 token using iExec Nox.
 *         Trade amounts are encrypted on-chain — MEV bots cannot see order sizes.
 */
contract WrappedConfidentialToken is ERC20ToERC7984Wrapper {
    constructor(IERC20 underlying_)
        ERC20ToERC7984Wrapper(underlying_)
        ERC7984("Wrapped Confidential Token", "wcTOKEN", "")
    {}
}
