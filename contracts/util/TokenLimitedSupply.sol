// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TokenLimitedSupply is ERC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        address to,
        uint256 amount
    ) ERC20(_name, _symbol) {
        _mint(to, amount);
    }
}
