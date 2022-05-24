// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "hardhat/console.sol";
import "../util/ERC20/IUnlimitedSupplyToken.sol";

// one can deposit into this contract but you must wait 1 week before you can withdraw your funds

contract TokenTimeLock {
  using SafeMath for uint256;
  // amount you deposited is saved in balances
  mapping(address => uint256) public balances;
  // when you can withdraw is saved in lockTime
  mapping(address => uint256) public lockTime;

  mapping(address => mapping(address => uint256)) public allocations;

  address admin;
  address[] public addresses;

  IERC20 private THXtoken;
  IUnlimitedSupplyToken stTHXtoken;

  constructor(address _stTHXtoken, address _THXtoken) public {
    THXtoken = IERC20(_THXtoken);
    stTHXtoken = IUnlimitedSupplyToken(_stTHXtoken);
    admin = msg.sender;
  }

  modifier onlyAdmin() {
    require(msg.sender == admin, "ADMIN_ONLY");
    _;
  }

  function deposit(uint256 amount, uint256 _increase) external payable {
    require(amount >= 10, "Cannot stake less than 10");
    // update total staked
    balances[msg.sender] = balances[msg.sender].add(amount);
    addresses.push(msg.sender);
    // Omrekenen tijd in weken naar seconden
    uint increase = _increase.mul(604800);
    // updated locktime 1 week from now
    lockTime[msg.sender] = block.timestamp.add(increase);
    // Transfer THX naar contract voor staken
    THXtoken.transferFrom(msg.sender, address(this), amount);
    // Transfer stTHX naar User
    stTHXtoken.approve(address(this), amount);
    stTHXtoken.transferFrom(address(this), msg.sender, amount);

    // Log hoeveel gestaked is
    emit Staked(msg.sender, amount);
  }

  function amountStaked() public view returns (uint256) {
    return balances[msg.sender];
  }

  function getAddress() public view returns (address[] memory) {
    return addresses;
  }

    // Allocating per user the coin and the amount it has
  function allocate(
    address _userAddress,
    address _tokenAddress,
    uint256 allocating
  ) public {
    allocations[_tokenAddress][_userAddress] = allocations[_tokenAddress][_userAddress].add(allocating);
    emit Allocated(_tokenAddress, allocating);
  }

  // delete test for remix
  function payout(address _user, address _tokenAddress) public onlyAdmin {
    IERC20(_tokenAddress).approve(address(this), allocations[_tokenAddress][_user]);
    IERC20(_tokenAddress).transferFrom(address(this), _user, allocations[_tokenAddress][_user]);
    delete allocations[_tokenAddress][_user];
  }

    // show test voor remix
  // function showAllocation(address _tokenAddress) public view returns (uint256) {
  //   return allocations[_tokenAddress][msg.sender];
  // }

  function withdraw() public {
    // check if that the sender has deposited in this contract in the mapping and the balance >0
    require(balances[msg.sender] > 0, "There is no funds added");
    // check that the now time is > the time saved in the lock time mapping
    //require(block.timestamp > lockTime[msg.sender], "lock time has not expired yet");

    // update balance
    uint256 amount = balances[msg.sender];
    delete balances[msg.sender];
    // burn staked thx
    stTHXtoken.burn(msg.sender, amount);
    // send the money to the sender
    THXtoken.approve(address(this), amount);
    THXtoken.transferFrom(address(this), msg.sender, amount);
    emit Withdrawn(msg.sender, amount);
  }

  event Allocated(address _tokenAddress, uint256 _allocating);
  event Staked(address indexed user, uint256 amount);
  event Withdrawn(address indexed user, uint256 amount);
}
