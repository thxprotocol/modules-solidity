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
  // save the duration of the staking in a mapping for each address
  mapping(address => uint256) public lockTime;
  // save the allocated rewards for each address in mapping
  mapping(address => mapping(address => uint256)) public allocations;

  address admin;
  //save the addresses that are doing a deposit in an array.
  address[] public addresses;
  IERC20 private THXtoken;
  IUnlimitedSupplyToken stTHXtoken;

  //give the address of staked thx token and THXtoken in the constructor to deposit and gain stTHX in return.
  constructor(address _stTHXtoken, address _THXtoken) public {
    THXtoken = IERC20(_THXtoken);
    stTHXtoken = IUnlimitedSupplyToken(_stTHXtoken);
    admin = msg.sender;
  }
  //Functions that can only be run by admin 'ADMIN_ONLY'
  modifier onlyAdmin() {
    require(msg.sender == admin, "ADMIN_ONLY");
    _;
  }
  //Give the amount you want to stake and how long you want to stake
  function deposit(uint256 amount, uint256 _increase) external payable {
  //You cannot stake less than 10 THX.
    require(amount >= 10, "Cannot stake less than 10");
    bool addressCheck = false;

  //Check if the address already exist in the addresses array.
  //If not, it needs to be added to the addresses array.
    for (uint i = 0; i < addresses.length; i++) {
      if (addresses[i] == msg.sender) {
        addressCheck = true;
      }
    }
    if (addressCheck == false) {
      addresses.push(msg.sender);
    }
    //Convert the time from weeks to seconds
    uint increase = _increase.mul(604800);
    // updated locktime 1 week from now

    //Check if the address already has a locktime, if not add the locktime to the respected address.

    if (lockTime[msg.sender] == 0) {
      lockTime[msg.sender] = block.timestamp.add(increase);
    } else {
      lockTime[msg.sender] = lockTime[msg.sender].add(increase);
    }
    // Transfer THX to contract for staking
    THXtoken.transferFrom(msg.sender, address(this), amount);
    // Transfer stTHX to User
    stTHXtoken.approve(address(this), amount);
    stTHXtoken.transferFrom(address(this), msg.sender, amount);

    // Log how much was deposited 
    emit Staked(msg.sender, amount);
  }

  //see which addreses are stored in the addresses array

  function getAddress() public view onlyAdmin returns (address[] memory){
    return addresses;
  }

  //see which address has a locktime

  function getLocktime() public view returns (uint256) {
    return lockTime[msg.sender];
  }

  // Allocating per user the coin and the amount it has
  //This function can be used in the future, it is still in development

//   function allocate(
//     address _userAddress,
//     address _tokenAddress,
//     uint256 allocating
//   ) public onlyAdmin {
//     allocations[_tokenAddress][_userAddress] = allocations[_tokenAddress][_userAddress].add(allocating);
//     emit Allocated(_tokenAddress, allocating);
//   }

  // 
  function payout(address _user, address _tokenAddress, uint256 rewards) public onlyAdmin {
    //rewards are calculated from the API
    //the given tokenaddress is IERC20 which makes the functions .approve and .transferFrom work.
    //the rewards of the specific tokenaddress must be approved for this contract
    //the rewards are then transfered from the contract to the user.
    IERC20(_tokenAddress).approve(address(this), rewards);
    IERC20(_tokenAddress).transferFrom(address(this), _user, rewards);
    //if the function allocations works, the allocation of the rewards for the user should be deleted
    // delete allocations[_tokenAddress][_user];
  }

  function withdraw() public {
    // check if that the sender has deposited in this contract in the mapping and the balance >0
    require(stTHXtoken.balanceOf(msg.sender) > 0, "There are no stThxTokens in your wallet");
    //check if there is any address stored in the array of addresess, to prevent errors there shoud be at least one address.
    uint index = 0;
    require(addresses.length > index, "Index out of bounds");
    //check if the user has a locktime
    require(lockTime[msg.sender] > 0, "User needs to have locktime");
    // check that the now time is > the time saved in the lock time mapping
    require(block.timestamp > lockTime[msg.sender], "lock time has not expired yet");
    // update balance
    uint256 amount = stTHXtoken.balanceOf(msg.sender);
    // burn staked thx that is called from stTHX.sol
    stTHXtoken.burn(msg.sender, amount);
    // send the amount that was deposited to the sender
    THXtoken.approve(address(this), amount);
    THXtoken.transferFrom(address(this), msg.sender, amount);

    //check if the address correlated to what is stored in addresses array, 
    //if it's true delete the address from the array
    for (uint i = index; i<addresses.length; i++){
      if (addresses[i] == msg.sender) {
        index = i;
        delete addresses[i];
        addresses[index] = addresses[addresses.length - 1];
      }
    }
    //to order the array
    delete addresses[addresses.length-1];
    //delete locktime for that address
    delete lockTime[msg.sender];
    //remove the address from array by popping it, otherwise it will still be in the array as an zero address
    addresses.pop();
    //log the amount that was withdrawn
    emit Withdrawn(msg.sender, amount);
  }

  //event Allocated(address _tokenAddress, uint256 _allocating);
  event Staked(address indexed user, uint256 amount);
  event Withdrawn(address indexed user, uint256 amount);
}
