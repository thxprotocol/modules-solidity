pragma solidity ^0.8.0;
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract RewardPayout is Ownable, ERC20 {
    mapping(address => uint256) public rewards;
    constructor(){}

    /*
     * @dev Transfers reward - estimatedGasCost to the user if the transaction fees are lower then the reward.
     */
    function transferreward()  payable public onlyOwner {

    }



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

    /*
     * @dev Function to receive tokens on this contract.
     */
    fallback() external payable {}
}
