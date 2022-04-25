// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract FeeCollector is Ownable, ERC20  {
    address public owner;

    event TransferReceived(address _from, uint _amount);
    event TransferSent(address _from, address _destAddr, uint _amount);

    constructor(){
        owner = msg.sender;
    }

    function transferERC20(IERC20 token, address to, uint256 amount) public onlyOwner {
        uint256 erc20balance = token.balanceOf(address(this));
        require(amount <= erc20balance, "balance is low");
        token.transfer(to, amount);
        emit TransferSent(msg.sender, to, amount);
    }
}