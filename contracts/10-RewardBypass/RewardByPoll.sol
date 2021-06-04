//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import '../06-Reward/RewardPoll.sol';

contract RewardByPoll is RewardPoll {
    function _rewardPollApprovalState() public view virtual override isReward returns (bool) {
        return true;
    }
}
