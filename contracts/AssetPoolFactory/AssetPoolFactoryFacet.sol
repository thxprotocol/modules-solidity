// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import '../RelayDiamond.sol';
import '../IDefaultDiamond.sol';
import './IAssetPoolFactory.sol';
import './LibFactoryStorage.sol';

import 'diamond-2/contracts/libraries/LibDiamond.sol';

contract AssetPoolFactoryFacet is IAssetPoolFactory {
    /**
     * @notice Initializes the factory with a default diamond cut.
     * @param _facets Default Asset Pool facets for the factory diamond to deploy.
     */
    function initialize(IDiamondCut.FacetCut[] memory _facets) external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.Data storage s = LibFactoryStorage.s();

        s.defaultController = msg.sender;
        for (uint256 i; i < _facets.length; i++) {
            s.defaultCut.push(_facets[i]);
        }
    }

    /**
     * @notice Sets the controller for the factory diamond.
     * @param _controller Address of the diamond controller.
     */
    function setDefaultController(address _controller) external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.s().defaultController = _controller;
    }

    /**
     * @notice Deploys and stores the reference to an asset pool based on the current defaultCut.
     * @dev Transfers ownership to the controller and initializes access control.
     */
    function deployAssetPool() external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.Data storage s = LibFactoryStorage.s();
        //direct is required for the initialize functions below
        RelayDiamond d = new RelayDiamond(s.defaultCut, address(this));
        IDefaultDiamond assetPool = IDefaultDiamond(address(d));
        assetPool.transferOwnership(s.defaultController);
        assetPool.initializeRoles(s.defaultController);
        s.assetPools.push(address(d));
        s.isAssetPool[address(d)] = true;
        emit AssetPoolDeployed(address(d));
    }

    function isAssetPool(address _assetPool) external override returns (bool) {
        LibFactoryStorage.Data storage s = LibFactoryStorage.s();
        return s.isAssetPool[_assetPool];
    }
}
