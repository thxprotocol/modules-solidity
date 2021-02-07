// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IReward {
    event RewardPollCreated(
        uint256 id,
        address indexed member,
        uint256 withdrawID,
        uint256 proposal
    );

    function setRewardPollDuration(uint256 _duration) external;

    function getRewardPollDuration() external view returns (uint256);

    function addReward(uint256 _withdrawAmount, uint256 _withdrawDuration)
        external;

    function updateReward(
        uint256 _id,
        uint256 _withdrawAmount,
        uint256 _withdrawDuration
    ) external;

    function claimRewardFor(uint256 _id, address _beneficiary) external;

    function claimReward(uint256 _id) external;
}
