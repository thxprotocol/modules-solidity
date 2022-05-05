// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import '../util/ERC20/LimitedSupplyToken.sol';
import '../util/ERC20/UnlimitedSupplyToken.sol';
import '../util/ERC721/NonFungibleToken.sol';
import './ITokenFactory.sol';

import 'diamond-2/contracts/libraries/LibDiamond.sol';

contract TokenFactoryFacet is ITokenFactory {
    /**
     * @param _name string Token name.
     * @param _symbol string Token symbol.
     * @param _baseURI address BaseURI for the tokenURI value of a token
     * @param _owner address Address of the owner and first minter
     */
    function deployNonFungibleToken(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        address _owner
    ) external override {
        LibDiamond.enforceIsContractOwner();

        NonFungibleToken t = new NonFungibleToken(_name, _symbol, _baseURI, _owner);
        emit TokenDeployed(address(t), TokenType.NonFungible);
    }

    /**
     * @param _name string Token name.
     * @param _symbol string Token symbol.
     * @param _to address Address the total supply will be minted to.
     * @param _amount uint256 Total supply of this token.
     */
    function deployLimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address _to,
        uint256 _amount
    ) external override {
        LibDiamond.enforceIsContractOwner();

        LimitedSupplyToken t = new LimitedSupplyToken(_name, _symbol, _to, _amount);
        emit TokenDeployed(address(t), TokenType.Limited);
    }

    /**
     * @param _name string Token name.
     * @param _symbol string Token symbol.
     * @param _owner address Addres which is allowed to transfer tokens which are minted on the fly.
     */
    function deployUnlimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address _owner
    ) external override {
        LibDiamond.enforceIsContractOwner();

        UnlimitedSupplyToken t = new UnlimitedSupplyToken(_name, _symbol, _owner);
        emit TokenDeployed(address(t), TokenType.Unlimited);
    }
}
