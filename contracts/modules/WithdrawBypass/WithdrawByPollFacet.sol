// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Withdrawals (Bypass poll)
* @author Evert Kors <evert@thx.network>
* @dev Inherits default withdraw poll, but will always approve it.
/******************************************************************************/

import '../Withdraw/WithdrawPollFacet.sol';

contract WithdrawByPollFacet is WithdrawPollFacet {
    function _withdrawPollApprovalState() public view override isWithdraw returns (bool) {
        return true;
    }
}
