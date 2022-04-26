// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import '../util/ERC20/UnlimitedSupplyToken.sol';
import './IUnlimitedSupplyTokenFactory.sol';

import 'diamond-2/contracts/libraries/LibDiamond.sol';

contract UnlimitedSupplyTokenFactoryFacet is IUnlimitedSupplyTokenFactory {
    /**
     * @param _name string Token name.
     * @param _symbol string Token symbol.
     * @param _minters address[] List if address that able to mint new tokens
     * @param _admin address Addres which is allowed to transfer tokens which are minted on the fly.
     */
    function deployUnlimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address[] memory _minters,
        address _admin 
    ) external override {
        LibDiamond.enforceIsContractOwner();

        UnlimitedSupplyToken t = new UnlimitedSupplyToken(_name, _symbol, _minters, _admin);
        emit UnlimitedSupplyTokenDeployed(address(t));
    }
}
