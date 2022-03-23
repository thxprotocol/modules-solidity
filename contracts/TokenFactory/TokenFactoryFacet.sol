// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import '../util/TokenLimitedSupply.sol';
import '../util/TokenUnlimitedSupply.sol';
import './ITokenFactory.sol';

import 'diamond-2/contracts/libraries/LibDiamond.sol';

contract TokenFactoryFacet is ITokenFactory {
    /**
     * @param _name string Token name.
     * @param _symbol string Token symbol.
     * @param to address Address the total supply will be minted to.
     * @param amount uint256 Total supply of this token.
     */
    function deployNonFungibleToken(
        string memory _name,
        string memory _symbol,
        address to
    ) external override {
        LibDiamond.enforceIsContractOwner();

        NonFungibleToken t = new NonFungibleToken(_name, _symbol, to);
        emit TokenDeployed(address(t), TokenType.NonFungible);
    }

    /**
     * @param _name string Token name.
     * @param _symbol string Token symbol.
     * @param to address Address the total supply will be minted to.
     * @param amount uint256 Total supply of this token.
     */
    function deployLimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address to,
        uint256 amount
    ) external override {
        LibDiamond.enforceIsContractOwner();

        TokenLimitedSupply t = new TokenLimitedSupply(_name, _symbol, to, amount);
        emit TokenDeployed(address(t), TokenType.Limited);
    }

    /**
     * @param _name string Token name.
     * @param _symbol string Token symbol.
     * @param _unlimited address Addres which is allowed to transfer tokens which are minted on the fly.
     */
    function deployUnlimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address _unlimited
    ) external override {
        LibDiamond.enforceIsContractOwner();

        TokenUnlimitedSupply t = new TokenUnlimitedSupply(_name, _symbol, _unlimited);
        emit TokenDeployed(address(t), TokenType.Unlimited);
    }
}
