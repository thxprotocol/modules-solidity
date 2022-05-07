// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";



contract StTHX is ERC20 {
    address public immutable admin;
    mapping(address => bool) public minters;
    uint256 private _totalSupply;
    mapping (address => uint256) public _balances;



    using SafeMath for uint256;

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
    function addMinter(address _minter) public onlyAdmin {
        require(_minter != address(0), 'INVALID_ADDRESS');
        minters[_minter] = true;
    }

    /**
     * Remove a minter from this contract
     * @param _minter Minter address to remove.
     */
    function removeMinter(address _minter) public onlyAdmin {
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


    function burn(uint256 amount) external payable {
        _burn(msg.sender, amount);
    } 
}