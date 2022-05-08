// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;

/******************************************************************************\
* @title ERC721 Connector
* @author Peter Polman <peter@thx.network>
* @notice Connect ERC721 token contract.
/******************************************************************************/

import '@openzeppelin/contracts/math/SafeMath.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import './interfaces/IERC721Facet.sol';
import './lib/LibERC721FacetStorage.sol';
import '../../utils/ERC721/INonFungibleToken.sol';
import '../../utils/RelayReceiver.sol';

contract ERC721Facet is IERC721Facet, RelayReceiver {
    using SafeMath for uint256;

    /**
     * @param _token Address of the ERC721 contract to connect to this pool.
     * @dev Can only be set once.
     */
    function setERC721(address _token) external override {
        require(LibERC721ConnectStorage.store().token == INonFungibleToken(0), 'INIT');
        require(_token != address(0), 'ZERO');

        LibDiamond.enforceIsContractOwner();
        LibERC721ConnectStorage.store().token = INonFungibleToken(_token);

        emit ERC721Updated(address(0), _token);
    }

    /// @return address of the ERC721 contract used in the asset pool.
    function getERC721() external view override returns (address) {
        return address(LibERC721ConnectStorage.store().token);
    }

    /**
     * @param _beneficiary Address of recipient for this token
     * @param _tokenUri URI of the token
     */
    function mintFor(address _beneficiary, string memory _tokenUri) external override {
        require(LibERC721ConnectStorage.store().token != INonFungibleToken(0), 'NO_TOKEN');

        LibDiamond.enforceIsContractOwner();
        INonFungibleToken nft = INonFungibleToken(LibERC721ConnectStorage.store().token);

        uint256 tokenId = nft.mint(_beneficiary, _tokenUri);

        emit ERC721Minted(_beneficiary, tokenId);
    }
}
