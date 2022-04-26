// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DevToken is ERC20, Ownable {

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_
    ) ERC20(name_, symbol_) {
        transferOwnership(owner_);
        
    }

    function mint(address receiver, uint256 amount) external onlyOwner returns (uint256) {
        _mint(receiver, amount);
        return amount;
    }
}