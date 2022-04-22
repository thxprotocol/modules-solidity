
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8;

//import ERC20 from openzeppelin
//******************************
//Access control, or “who is allowed to do this thing”, 
//is incredibly important when dealing with smart contracts. 
//The access control of your contract may govern who can mint tokens, 
//vote on proposals, freeze transfers, and many other things.

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/utils/Counters.sol';

contract DevToken is ERC20, Ownable{
  constructor(
      string memory _name,
      string memory _symbol,
      address _owner
      ) ERC20("stTHX", "$THX"){
          transferOwnership(_owner);
      }

  function issueToken(address receiver, uint256 amount) external override onlyOwner returns (uint256) public{
    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();
    _mint(recipient, newItemId);
    _mint(receiver, amount);
  }

}
