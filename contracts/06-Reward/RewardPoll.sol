//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "diamond-2/contracts/libraries/LibDiamond.sol";

// Implements
import "../util/BasePoll.sol"; // TMP1, TMP 6
import "../TMP/TMP6/LibBasePollStorage.sol";
import "../TMP/TMP8/IRewardPoll.sol";
import "../TMP/TMP8/LibRewardPollStorage.sol";

contract RewardPoll is BasePoll, IRewardPoll {
    uint256 constant ENABLE_REWARD = 2**250;
    uint256 constant DISABLE_REWARD = 2**251;

    function voteValidate(bool _agree, address _voter) internal override {
        require(_isMember(_voter), "NO_MEMBER");
    }

    /**
     * @dev callback called after poll finalization
     */
    function onPollFinish(uint256 _id) internal override {

            LibRewardPollStorage.RewardPollStorage storage rwPollData
         = LibRewardPollStorage.rewardPollStorageId(_id);

        LibRewardPollStorage.Reward storage reward = LibRewardPollStorage
            .rewardStorage()
            .rewards[rwPollData.rewardIndex];

        bool approved = _rewardPollApprovalState();
        if (approved) {
            if (rwPollData.withdrawAmount == ENABLE_REWARD) {
                reward.state = LibRewardPollStorage.RewardState.Enabled;
                emit RewardPollEnabled(_id);
            } else if (rwPollData.withdrawAmount == DISABLE_REWARD) {
                reward.state = LibRewardPollStorage.RewardState.Disabled;
                emit RewardPollDisabled(_id);
            } else {
                // initial state
                if (
                    reward.withdrawAmount == 0 && reward.withdrawDuration == 0
                ) {
                    reward.state = LibRewardPollStorage.RewardState.Enabled;
                    emit RewardPollEnabled(_id);
                }
                reward.withdrawAmount = rwPollData.withdrawAmount;
                reward.withdrawDuration = rwPollData.withdrawDuration;
                emit RewardPollUpdated(
                    _id,
                    reward.withdrawAmount,
                    reward.withdrawDuration
                );
            }
        }
        emit RewardPollFinalized(_id, approved);
        delete reward.pollId;
        delete rwPollData.withdrawAmount;
        delete rwPollData.withdrawDuration;
    }

    function getWithdrawAmount(uint256 _id)
        external
        override
        view
        returns (uint256)
    {
        return LibRewardPollStorage.rewardPollStorageId(_id).withdrawAmount;
    }

    function getWithdrawDuration(uint256 _id)
        external
        override
        view
        returns (uint256)
    {
        return LibRewardPollStorage.rewardPollStorageId(_id).withdrawDuration;
    }

    function getRewardIndex(uint256 _id)
        external
        override
        view
        returns (uint256)
    {
        return LibRewardPollStorage.rewardPollStorageId(_id).rewardIndex;
    }

    function _rewardPollVote(bool _agree) external override {
        vote(_agree);
        emit RewardPollVoted(baseData().id, _msgSender(), _agree);
    }

    function _rewardPollRevokeVote() external override {
        revokeVote();
        emit RewardPollRevokedVote(baseData().id, _msgSender());
    }

    function _rewardPollFinalize() external override {
        finalize();
    }

    function _rewardPollApprovalState()
        public
        virtual
        override
        view
        returns (bool)
    {
        LibBasePollStorage.BasePollStorage storage bData = baseData();
        return bData.yesCounter > bData.noCounter;
    }
}
