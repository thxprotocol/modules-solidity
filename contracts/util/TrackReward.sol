pragma solidity ^0.7.4;

import '@openzeppelin/contracts/access/Ownable.sol';

contract TrackReward is Ownable {
    mapping(address => uint256) public rewards;
    constructor(){}

    /*
     * @dev Store new reward in the local reward variable
     * @param reward to store
     */
    function setReward(uint256 _reward) public {
        reward = _reward;
    }

    /*
     * @return reward of the owner
     */
    function getReward() public onlyOwner {
        return rewards[msg.sender];
    }
}
