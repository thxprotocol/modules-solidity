// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import '../util/ERC20/UnlimitedSupplyToken.sol';
import './IUnlimitedSupplyTokenFactory.sol';

import 'diamond-2/contracts/libraries/LibDiamond.sol';

contract NonFungibleTokenFactoryFacet is INonFungibleTokennFactory {
    /**
     * @param _name string Token name.
     * @param _symbol string Token symbol.
     * @param _to address Address the total supply will be minted to.
     */
    function deployNonFungibleToken(
        string memory _name,
        string memory _symbol,
        address _to,
        string memory _baseURI
    ) external override {
        LibDiamond.enforceIsContractOwner();

        NonFungibleToken t = new NonFungibleToken(_name, _symbol, _to, _baseURI);
        emit NonFungibleToken(address(t));
    }
}
