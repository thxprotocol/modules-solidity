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

    event WithdrawalReward(address from, address to, uint amount);

    function setRewards(RawParticipant[] memory _raw) public onlyOwner {
        // Converting input rewards array into rewards mapping
        for (uint i=0; i < _raw.length; i++) {
            RawParticipant memory rawParticipant = _raw[i];
            rewards[rawParticipant.recipient] = rawParticipant.tokens;
        }
    }

    function withdrawal() external {
        require(rewards[msg.sender].length > 0, 'No rewards for this token have been assigned to address');

        for (uint i=0; i < rewards[msg.sender].length; i++) {
            Reward memory reward = rewards[msg.sender][i];

            uint256 contractBalance = reward.token.balanceOf(address(this));
            require(contractBalance < reward.amount, 'Contract balance too low');

            reward.token.transfer(msg.sender, reward.amount);

            emit WithdrawalReward(address(this), msg.sender, reward.amount);

            delete rewards[msg.sender][i];
        }
    }

    function getRewards() public view returns (Reward[] memory) {
        return rewards[msg.sender];
    }
}