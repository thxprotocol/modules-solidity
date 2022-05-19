// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

/******************************************************************************\
* @title ERC20 Unlimited Supply
* @author Evert Kors <evert@thx.network>
* @notice Used for point systems with an unlimited supply. Mints the required tokens whenever they are needed.
* @dev Not upgradable contract.
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './IUnlimitedSupplyToken.sol';

import 'hardhat/console.sol';

contract UnlimitedSupplyToken is IUnlimitedSupplyToken, ERC20 {
    address public immutable admin;
    mapping(address => bool) public minters;

    constructor(
        string memory _name,
        string memory _symbol,
        address[] memory _minters,
        address _admin
    ) ERC20(_name, _symbol) {
        require(_admin != address(0), 'INVALID_ADDRESS');
        admin = _admin;

        for (uint256 i = 0; i < _minters.length; ++i) {
            require(_minters[i] != address(0), 'NOT_MINTER');
            minters[_minters[i]] = true;
        }
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, 'ADMIN_ONLY');
        _;
    }

    /**
     * Add a new minter to this contract
     * @param _minter Minter address to add.
     */
    function isMinter(address _minter) external override returns (bool) {
        return minters[_minter];
    }

    /**
     * Add a new minter to this contract
     * @param _minter Minter address to add.
     */
    function addMinter(address _minter) external override onlyAdmin {
        require(_minter != address(0), 'INVALID_ADDRESS');
        minters[_minter] = true;
    }

    /**
     * Remove a minter from this contract
     * @param _minter Minter address to remove.
     */
    function removeMinter(address _minter) external override onlyAdmin {
        require(_minter != address(0), 'INVALID_ADDRESS');
        require(minters[_minter] == true, 'NOT_MINTER');

        delete minters[_minter];
    }

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal override {
        if (minters[_from] == true && _to != address(0)) {
            _mint(_from, _amount);
        }
    }

    function burn(address user, uint256 amount) external payable override {
        _burn(user, amount);
    }
}
