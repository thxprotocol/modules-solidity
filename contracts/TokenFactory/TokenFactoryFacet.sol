// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import '../util/TokenLimitedSupply.sol';
import '../util/TokenUnlimitedSupply.sol';
import './ITokenFactory.sol';

import 'diamond-2/contracts/libraries/LibDiamond.sol';

contract TokenFactoryFacet is ITokenFactory {
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

    function deployUnlimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address to
    ) external override {
        LibDiamond.enforceIsContractOwner();

        TokenUnlimitedSupply t = new TokenUnlimitedSupply(_name, _symbol, to);
        emit TokenDeployed(address(t), TokenType.Unlimited);
    }
}
