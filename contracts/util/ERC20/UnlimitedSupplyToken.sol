// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

/******************************************************************************\
* @title ERC20 Unlimited Supply
* @author Evert Kors <evert@thx.network>
* @notice Used for point systems with an unlimited supply. Mints the required tokens whenever they are needed.
* @dev Not upgradable contract.
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract UnlimitedSupplyToken is ERC20, Ownable {
    mapping(address => bool) public minters;

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_
    ) ERC20(name_, symbol_) {
        transferOwnership(owner_);
        minters[owner_] = true;
    }


    /**
     * Add a new minter to this contract
     * @param _minter Minter address to add.
     */
    function addMinter(address _minter) external onlyOwner {
        require(_minter != address(0), 'INVALID_ADDRESS');
        minters[_minter] = true;
    }

    /**
     * Remove a minter from this contract
     * @param _minter Minter address to remove.
     */
    function removeMinter(address _minter) external onlyOwner {
        require(_minter != address(0), 'INVALID_ADDRESS');
        require(minters[_minter] == true, 'NOT_MINTER');

        delete minters[_minter];
    }

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal override {
        if (minters[_from] == true) {
            _mint(_from, _amount);
        }
    }
}
