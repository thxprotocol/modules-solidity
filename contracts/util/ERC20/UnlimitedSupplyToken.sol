// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

/******************************************************************************\
* @title ERC20 Unlimited Supply
* @author Evert Kors <evert@thx.network>
* @notice Used for point systems with an unlimited supply. Mints the required tokens whenever they are needed.
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol'; 
import '../MinterAccess/MinterAccess.sol';
import './LibUnlimitedSupplyTokenStorage.sol';

contract UnlimitedSupplyToken is ERC20, Ownable {

    constructor(
        string memory _name,
        string memory _symbol,
        address[] memory _minters,
        address _admin
    ) ERC20(_name, _symbol) {
        require(_admin != address(0), 'INVALID_ADDRESS');
        LibUnlimitedSupplyTokenStorage.UnlimitedSupplyTokenStorage storage ms = LibUnlimitedSupplyTokenStorage.unlimitedSupplyTokenStorage();
        ms.admin = _admin;
        for (uint256 i = 0; i < _minters.length; ++i) {
            require(_minters[i] != address(0), 'NOT_MINTER');
            ms.minters[_minters[i]] = true;
        }
    }

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal override {
        LibUnlimitedSupplyTokenStorage.UnlimitedSupplyTokenStorage storage ms = LibUnlimitedSupplyTokenStorage.unlimitedSupplyTokenStorage();
        if (ms.minters[_from] == true) {
            _mint(_from, _amount);
        }
    }
}
