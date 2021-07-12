// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

/******************************************************************************\
* @title ERC20 Unlimited Supply
* @author Evert Kors <evert@thx.network>
* @notice Used for point systems with an unlimited supply. Mints the required tokens whenever they are needed.
* @dev Not upgradable contract.
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TokenUnlimitedAccount is ERC20 {
    address public immutable unlimited;

    constructor(
        string memory _name,
        string memory _symbol,
        address _unlimited
    ) ERC20(_name, _symbol) {
        unlimited = _unlimited;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        if (from == unlimited) {
            _mint(from, amount);
        }
    }
}
