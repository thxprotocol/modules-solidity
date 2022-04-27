// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

/******************************************************************************\
* @title ERC721 URI Storage
* @author Peter Polman <peter@thx.network>
* @notice Used for point systems with a limited supply. Mints the full supply to the to argument given in the contructor. 
* @dev Upgradable contract.
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '../../MinterAccess/MinterAccess.sol';
import './LibNonFungibleTokenStorage.sol';

contract NonFungibleToken is ERC721, Ownable, MinterAccess {
    using Counters for Counters.Counter;

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_,
        string memory baseURI_
    ) ERC721(name_, symbol_) {
        transferOwnership(owner_);
        _setBaseURI(baseURI_);
    }

    function mint(address recipient, string memory tokenURI) external onlyMinter returns (uint256) {
        LibNonFungibleTokenStorage.NonFungibleTokenStorage storage ns = LibNonFungibleTokenStorage.nonFungibleTokenStorage();
        ns.tokenIds.increment();

        uint256 newItemId = ns.tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
