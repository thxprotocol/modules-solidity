//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../05-Withdraw/WithdrawPoll.sol";

contract WithdrawByPoll is WithdrawPoll {
    function _withdrawPollApprovalState()
        public
        override
        view
        isWithdraw
        returns (bool)
    {
        return true;
    }
}
