// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

/******************************************************************************\
* @title ERC20 Unlimited Supply
* @author Evert Kors <evert@thx.network>
* @notice Used for point systems with an unlimited supply. Mints the required tokens whenever they are needed.
* @dev Not upgradable contract.
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract UnlimitedSupplyToken is ERC20 {
    address public admin;
    mapping(address => bool) public minterMap;

    constructor(
        string memory _name,
        string memory _symbol,
        address[] memory _minters,
        address _admin
    ) ERC20(_name, _symbol) {
        require(_admin != address(0), 'Invalid Admin Address');
        _admin = _admin;

        for (uint256 i = 0; i < _minters.length; ++i) {
            require(_minters[i] != address(0), 'Invalid Minter Address');
            minterMap[_minters[i]] = true;
        }
    }

    modifier mintable() {
        require(minterMap[msg.sender] == true, "You don't have mint right");
        _;
    }

    modifier modifiable() {
        require(msg.sender == admin, 'Only admin can run this function');
        _;
    }

    /**
     * Add a new minter to this contract
     * @param _minter Minter address to add.
     */
    function setMinter(address _minter) public modifiable {
        require(_minter != address(0), 'Invalid Minter Address');
        minterMap[_minter] = true;
    }

    /**
     * Remove a minter from this contract
     * @param _minter Minter address to add.
     */
    function delMinter(address _minter) public modifiable mintable {
        require(_minter != address(0), 'Invalid Minter Address');
        delete minterMap[_minter];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override mintable {
        _mint(from, amount);
    }
}
