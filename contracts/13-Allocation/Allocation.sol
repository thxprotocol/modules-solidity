// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract allocation {


  mapping(address => mapping(address => uint)) public allocations;

  //Allocating per user the coin and the amount it has    
  using SafeMath for uint;
  function allocate(address _tokenAddress, uint allocating) public {
    allocations[_tokenAddress][msg.sender] = allocations[_tokenAddress][msg.sender].add(allocating);
    emit Allocated(_tokenAddress, allocating);
  }

  //delete test for remix
  function payout(address _tokenAddress) public {
    delete allocations[_tokenAddress][msg.sender];
  }

  //show test voor remix
  function showAllocation(address _tokenAddress) public view returns (uint256) {
    return allocations[_tokenAddress][msg.sender];
  }

  event Allocated(address _tokenAddress, uint256 _allocating);

}