// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Withdrawals (Bypass poll)
* @author Evert Kors <evert@thx.network>
* @dev Inherits default withdraw poll proxy
/******************************************************************************/

import '../Withdraw/WithdrawPollProxyFacet.sol';

contract WithdrawByPollProxyFacet is WithdrawPollProxyFacet {}
