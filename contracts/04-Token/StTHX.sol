
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

contract DevToken is ERC20{
  constructor() ERC20("stTHX", "$THX"){}

  function issueToken(address receiver, uint256 amount) public{
    _mint(receiver, amount);
  }

}
