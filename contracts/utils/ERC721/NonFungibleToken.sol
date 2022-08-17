// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;
pragma abicoder v2;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import './INonFungibleToken.sol';
import './royalties/RoyaltyOverrideCore.sol';

contract NonFungibleToken is INonFungibleToken, ERC721, ERC2981RoyaltyOverrideCore, AccessControl, Ownable {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address owner_,
        address royaltyRecipient,
        uint16 royaltyBps
    ) ERC721(name_, symbol_) {
        transferOwnership(owner_);
        _setupRole(DEFAULT_ADMIN_ROLE, owner_);
        _setupRole(MINTER_ROLE, owner_);
        _setBaseURI(baseURI_);
        
        if(royaltyRecipient != address(0) && royaltyBps > 0) {
            _setDefaultRoyalty(TokenRoyalty(royaltyRecipient, royaltyBps));
        }
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, ERC2981RoyaltyOverrideCore, IERC165) returns (bool) {
        return ERC2981RoyaltyOverrideCore.supportsInterface(interfaceId);
    }

    function mint(address _recipient, string memory _tokenURI) external override returns (uint256) {
        require(hasRole(MINTER_ROLE, msg.sender), 'NOT_MINTER');

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(_recipient, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        return newItemId;
    }

     /**
     * @dev See {IERC2981RoyaltyOverride-setTokenRoyalties}.
     */
    function setTokenRoyalties(TokenRoyaltyConfig[] calldata royaltyConfigs) external override onlyOwner {
        _setTokenRoyalties(royaltyConfigs);
    }

    /**
     * @dev See {IERC2981RoyaltyOverride-setDefaultRoyalty}.
     */
    function setDefaultRoyalty(TokenRoyalty calldata royalty) external override onlyOwner {
        _setDefaultRoyalty(royalty);
    }
}
