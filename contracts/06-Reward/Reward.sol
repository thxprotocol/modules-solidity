//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

// Implements
import "../TMP/TMP8/IReward.sol";
import "../TMP/TMP8/LibRewardPollStorage.sol";

// Depends on
import "../util/Access.sol"; // TMP 1
import "../TMP/TMP2/LibMemberAccessStorage.sol";
import "../TMP/TMP7/LibWithdrawPollStorage.sol";
import "../TMP/TMP7/IWithdrawEvents.sol";
import "../util/BasePoll.sol"; // TMP1, TMP 6
import "../TMP/TMP6/LibBasePollStorage.sol";

contract Reward is Access, IReward, IWithdrawEvents {
    uint256 constant ENABLE_REWARD = 2**250;
    uint256 constant DISABLE_REWARD = 2**251;

    function setRewardPollDuration(uint256 _duration)
        external
        override
        onlyManager
    {
        LibRewardPollStorage.rewardStorage().rewardPollDuration = _duration;
    }

    function getRewardPollDuration() external override view returns (uint256) {
        return LibRewardPollStorage.rewardStorage().rewardPollDuration;
    }

    function addReward(uint256 _withdrawAmount, uint256 _withdrawDuration)
        external
        override
        onlyOwner
    {
        require(_withdrawAmount != 0, "NOT_VALID");
        require(_withdrawAmount != ENABLE_REWARD, "NOT_VALID");
        require(_withdrawAmount != DISABLE_REWARD, "NOT_VALID");
        LibRewardPollStorage.Reward memory reward;

        reward.id = LibRewardPollStorage.rewardStorage().rewards.length + 1;
        reward.state = LibRewardPollStorage.RewardState.Disabled;
        reward.pollId = _createRewardPoll(
            reward.id,
            _withdrawAmount,
            _withdrawDuration
        );
        LibRewardPollStorage.rewardStorage().rewards.push(reward);
    }

    function updateReward(
        uint256 _id,
        uint256 _withdrawAmount,
        uint256 _withdrawDuration
    ) external override onlyOwner {
        // todo verify amount
        require(_isMember(_msgSender()), "NOT_MEMBER");
        LibRewardPollStorage.Reward storage reward = LibRewardPollStorage
            .rewardStorage()
            .rewards[_id - 1];

        // storage will be deleted (e.g. set to default) after poll is finalized
        require(reward.pollId == 0, "IS_NOT_FINALIZED");
        // setting both params to initial state is not allowed
        // this is a reserverd state for new rewards
        require(
            !(_withdrawAmount == 0 && _withdrawDuration == 0),
            "NOT_ALLOWED"
        );

        require(
            !(_withdrawAmount == ENABLE_REWARD &&
                reward.state == LibRewardPollStorage.RewardState.Enabled),
            "ALREADY_ENABLED"
        );

        require(
            !(_withdrawAmount == DISABLE_REWARD &&
                reward.state == LibRewardPollStorage.RewardState.Disabled),
            "ALREADY_DISABLED"
        );

        require(
            !(reward.withdrawAmount == _withdrawAmount &&
                reward.withdrawDuration == _withdrawDuration),
            "IS_EQUAL"
        );

        reward.pollId = _createRewardPoll(
            _id,
            _withdrawAmount,
            _withdrawDuration
        );
    }

    function claimRewardFor(uint256 _id, address _beneficiary) public override {
        // TODO, decide if this needs to be only owner (like legacy pool)
        require(_isMember(_msgSender()), "NOT_MEMBER");
        require(_isMember(_beneficiary), "NOT_MEMBER");

        LibRewardPollStorage.Reward memory current = LibRewardPollStorage
            .rewardStorage()
            .rewards[_id - 1];

        require(
            current.state == LibRewardPollStorage.RewardState.Enabled,
            "IS_NOT_ENABLED"
        );
        _createWithdrawPoll(
            current.withdrawAmount,
            current.withdrawDuration,
            _beneficiary
        );
    }

    function claimReward(uint256 _id) external override {
        claimRewardFor(_id, _msgSender());
    }

    /**
     * @dev Starts a withdraw poll.
     * @param _amount Size of the withdrawal
     * @param _duration The duration the withdraw poll
     * @param _beneficiary Beneficiary of the reward
     */
    function _createWithdrawPoll(
        uint256 _amount,
        uint256 _duration,
        address _beneficiary
    ) internal returns (uint256) {
        LibBasePollStorage.BaseStorage storage bst = LibBasePollStorage
            .baseStorage();
        bst.pollCounter = bst.pollCounter + 1;


            LibBasePollStorage.BasePollStorage storage baseStorage
         = LibBasePollStorage.basePollStorageId(bst.pollCounter);

        baseStorage.id = bst.pollCounter;
        baseStorage.startTime = block.timestamp;
        baseStorage.endTime = block.timestamp + _duration;


            LibWithdrawPollStorage.WithdrawPollStorage storage wpStorage
         = LibWithdrawPollStorage.withdrawPollStorageId(bst.pollCounter);

        wpStorage.amount = _amount;
        wpStorage.beneficiary = LibMemberAccessStorage
            .memberStorage()
            .addressToMember[_beneficiary];

        emit WithdrawPollCreated(bst.pollCounter, wpStorage.beneficiary);
        return baseStorage.id;
    }

    function _createRewardPoll(
        uint256 _id,
        uint256 _withdrawAmount,
        uint256 _withdrawDuration
    ) internal returns (uint256) {
        LibBasePollStorage.BaseStorage storage bst = LibBasePollStorage
            .baseStorage();
        bst.pollCounter = bst.pollCounter + 1;


            LibBasePollStorage.BasePollStorage storage baseStorage
         = LibBasePollStorage.basePollStorageId(bst.pollCounter);


            LibRewardPollStorage.RewardStorage storage rewardStorage
         = LibRewardPollStorage.rewardStorage();


            LibRewardPollStorage.RewardPollStorage storage rpStorage
         = LibRewardPollStorage.rewardPollStorageId(bst.pollCounter);

        baseStorage.id = bst.pollCounter;
        baseStorage.startTime = block.timestamp;
        baseStorage.endTime =
            block.timestamp +
            rewardStorage.rewardPollDuration;

        rpStorage.rewardIndex = _id - 1;
        rpStorage.withdrawAmount = _withdrawAmount;
        rpStorage.withdrawDuration = _withdrawDuration;

        emit RewardPollCreated(
            bst.pollCounter,
            _msgSender(),
            _id,
            _withdrawAmount
        );
        return baseStorage.id;
    }
}
