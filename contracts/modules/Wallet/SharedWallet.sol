// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

contract SharedWallet is Ownable {
    using SafeERC20 for IERC20;
  
    /**
     * @param _owner Address of the Owner contract.
     */
    constructor(address _owner) {
        transferOwnership(_owner);
    }

    function approveERC20(address _tokenAddress, address _address, uint256 _amount) public onlyOwner {
        IERC20(_tokenAddress).approve(_address, _amount);
    }

    function approveERC721(address _tokenAddress, address _address, uint256 _tokenId) public onlyOwner {
        IERC721(_tokenAddress).approve(_address, _tokenId);
    }

    function transferERC20(address _tokenAddress, address _to, uint256 _amount) public onlyOwner {
        IERC20 erc20Token = IERC20(_tokenAddress);
        address owner = owner();
        require(erc20Token.balanceOf(owner) >= _amount, 'INSUFFICIENT BALANCE');
        erc20Token.safeTransferFrom(owner, _to, _amount);
    }

    function transferERC721(address _tokenAddress, address _to, uint256 _tokenId) public onlyOwner {
         address owner = owner();
        IERC721 erc721Token = IERC721(_tokenAddress);
        erc721Token.safeTransferFrom(owner, _to, _tokenId);
    }
}