// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import "../RelayDiamond.sol";
import "../IDefaultDiamond.sol";
import "./IAssetPoolFactory.sol";
import "./LibFactoryStorage.sol";

import "diamond-2/contracts/libraries/LibDiamond.sol";

contract AssetPoolFactoryFacet is IAssetPoolFactory {
    function initialize(IDiamondCut.FacetCut[] memory _facets)
        external
        override
    {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.Data storage s = LibFactoryStorage.s();

        s.defaultController = msg.sender;
        for (uint256 i; i < _facets.length; i++) {
            s.defaultCut.push(_facets[i]);
        }
    }

    function setDefaultController(address _controller) external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.s().defaultController = _controller;
    }

    function deployAssetPool() external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.Data storage s = LibFactoryStorage.s();
        //direct is required for the initialize functions below
        RelayDiamond d = new RelayDiamond(s.defaultCut, address(this));
        IDefaultDiamond assetPool = IDefaultDiamond(address(d));
        assetPool.transferOwnership(s.defaultController);
        s.assetPools.push(address(d));
        s.isAssetPool[address(d)] = true;
        emit AssetPoolDeployed(address(d));
    }
}
