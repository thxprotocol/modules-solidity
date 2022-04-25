// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract FeeCollector is Ownable {
    struct RawReward {
        IERC20 token;
        uint256 amount;
    }

    struct RawParticipant {
        address recipient;
        RawReward[] tokens;
    }

    mapping(address => mapping(IERC20 => uint256)) public rewards;

    event WithdrawalReward(address from, address to, uint amount);

    function setRewards(RawParticipant[] memory _raw) public onlyOwner {
        // Converting input rewards array into rewards mapping
        for (uint i=0; i < _raw.length; i++) {
            RawParticipant memory rawParticipant = _raw[i];

            for (uint j=0; j < rawParticipant.tokens.length; j++) {
                RawReward memory rawReward = rawParticipant.tokens[j];
                rewards[rawParticipant.recipient][rawReward.token] = rawReward.amount; 
            }
        }
    }

    function withdrawal(IERC20 _token) external {
        require(rewards[msg.sender][_token] != 0, 'No rewards for this token have been assigned to address');

        uint256 allocatedReward = rewards[msg.sender][_token];
        uint256 contractBalance = _token.balanceOf(address(this));

        require(contractBalance < allocatedReward, 'Contract balance too low');

        _token.transfer(msg.sender, allocatedReward);

        emit WithdrawalReward(address(this), msg.sender, allocatedReward);
    }
}