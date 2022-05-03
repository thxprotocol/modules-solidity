// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

//one can deposit into this contract but you must wait 1 week before you can withdraw your funds

contract TokenTimeLock{

  using SafeMath for uint;
  //amount you deposited is saved in balances
  mapping(address => uint) public balances;
  //when you can withdraw is saved in lockTime
  mapping(address => uint) public lockTime;
  //total staked amount
  mapping(address => uint) public stakedAmount;
  IERC20 private THXtoken;
  IERC20 stTHXtoken;
  mapping(address => uint) public tokenHolder;

  constructor (address _stTHXtoken, address _THXtoken ) public {
    THXtoken = IERC20(_THXtoken);
    stTHXtoken = IERC20 (_stTHXtoken);
  }

  function deposit (uint256 amount, uint week) external payable {
    require(amount > 0, "Cannot stake 0");
    //update total staked
    balances[msg.sender] = balances[msg.sender].add(amount);
    //updated locktime 1 week from now
    lockTime[msg.sender] = block.timestamp + week;
    THXtoken.transferFrom(msg.sender, address(this), amount);
    emit Staked(msg.sender, amount);
  }

  function increaseLockTime(uint _increase) public{
    lockTime[msg.sender] = lockTime[msg.sender].add(_increase);
  }

  function withdraw() public{
    //check if that the sender has deposited in this contract in the mapping and the balance >0
    require(balances[msg.sender] > 0, "There is no funds added");
        
    // check that the now time is > the time saved in the lock time mapping
    require(block.timestamp > lockTime[msg.sender], "lock time has not expired yet");

    //update balance
    uint amount = balances[msg.sender];
    balances[msg.sender] = 0;

    //send the money to the sender
    THXtoken.transferFrom(address(this), msg.sender, amount);
    emit Withdrawn(msg.sender, amount);
  }

  event Staked(address indexed user, uint256 amount);
  event Withdrawn(address indexed user, uint256 amount);
}