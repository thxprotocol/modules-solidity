// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract FeeCollector is Ownable {
    struct Reward {
        IERC20 token;
        uint256 amount;
    }

    struct RawParticipant {
        address recipient;
        Reward[] tokens;
    }

    mapping(address => Reward[]) public rewards;

    event WithdrawReward(address from, address to, uint amount);

    modifier onlyHasRewards {
        require(rewards[msg.sender].length > 0, 'No rewards have been assigned to address');
        _;
    }

    function setRewards(address _target, Reward[] memory _tokens) public onlyOwner {
        delete rewards[_target];
        for (uint i=0; i < _tokens.length; i++) {
            rewards[_target].push(Reward(_tokens[i].token, _tokens[i].amount));
        }
    }

    function setRewardsBulk(RawParticipant[] memory _raw) public onlyOwner {
        for (uint i=0; i < _raw.length; i++) {
            setRewards(_raw[i].recipient, _raw[i].tokens);
        }
    }

    function getRewards() public view onlyHasRewards returns (Reward[] memory) {
        return rewards[msg.sender];
    }

    function withdraw(IERC20 _token) external onlyHasRewards {
        Reward[] memory temp = rewards[msg.sender];

        for (uint i=0; i < temp.length; i++) {
            if (temp[i].token == _token) {
                withdrawToken(i);
                delete temp[i];
            }
        }

        delete rewards[msg.sender];

        for (uint i=0; i < temp.length; i++) {
            if (temp[i].amount != 0) {
                rewards[msg.sender].push(Reward(temp[i].token, temp[i].amount));
            }
        }
    }

    function withdrawBulk() external onlyHasRewards {
        for (uint i=0; i < rewards[msg.sender].length; i++) {
            withdrawToken(i);
        }
        delete rewards[msg.sender];
    }

    function withdrawToken(uint index) private {
        Reward memory reward = rewards[msg.sender][index];

        uint256 contractBalance = reward.token.balanceOf(address(this));
        require(contractBalance >= reward.amount, 'Contract balance too low');
        
        reward.token.transfer(msg.sender, reward.amount);

        emit WithdrawReward(address(this), msg.sender, reward.amount);
    }
}