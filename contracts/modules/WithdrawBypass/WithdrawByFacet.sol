// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Withdrawals (Bypass poll)
* @author Evert Kors <evert@thx.network>
* @dev Inherits default withdraw implementation
/******************************************************************************/

import '../Withdraw/WithdrawFacet.sol';

contract WithdrawByFacet is WithdrawFacet {}
