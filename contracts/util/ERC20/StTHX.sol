// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";



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
        if (minters[_from] == true) {
            _mint(_from, _amount);
        }
    }

    function mint(address account, uint256 value) public  {

        _totalSupply = _totalSupply.add(value);
        _balances[account] = _balances[account].add(value);
        emit Transfer(address(0), account, value);
    }


    function burn(uint256 amount) external payable {
    _burn(msg.sender, amount);
    } 


    function _burn(address account, uint256 amount) internal onlyAdmin override {
        // Requires that the message sender has enough tokens to burn
        //require(balanceOf(msg.sender) >= amount, 'NOT_ENOUGH_BALANCE');

        //check if the amount is not equal to 0 
        require(amount != 0);
        // Subtracts amount from callers balance and total supply
        //balanceOf(msg.sender).sub(amount);
        //_burn(msg.sender, amount);

        //check if the account address is not a zero address
        require(account != address(0));

        _totalSupply = _totalSupply.sub(amount);
        _balances[account] = _balances[account].sub(amount);
        emit Transfer(account, address(0), amount);
        
        // Since you cant actually burn tokens on the blockchain, sending to address 0, which none has the private keys to, removes them from the circulating supply
    
    }
}