// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/libraries/LibDiamond.sol';
import './lib/LibFactoryStorage.sol';
import './interfaces/IPoolFactoryFacet.sol';
import '../../interfaces/IDefaultDiamond.sol';
import '../../utils/RelayDiamond.sol';

contract PoolFactoryFacet is IPoolFactoryFacet {
    /**
     * @notice Sets the controller for the factory diamond.
     * @param _controller Address of the diamond controller.
     */
    function setDefaultController(address _controller) external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.s().defaultController = _controller;
    }

    /**
     * @notice Registers a pool address in the internal register. Only accessible for diamond owner.
     * @param _pool Address of pool that should be registered.
     */
    function registerAssetPool(address _pool) external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.Data storage s = LibFactoryStorage.s();
        s.assetPools.push(_pool);
        s.isAssetPool[_pool] = true;
        emit AssetPoolRegistered(_pool);
    }

    function isAssetPool(address _pool) external view override returns (bool) {
        LibFactoryStorage.Data storage s = LibFactoryStorage.s();
        return s.isAssetPool[_pool];
    }

    /**
     * @notice Deploys and stores the reference to an asset pool based on the current defaultCut.
     * @dev Transfers ownership to the controller and initializes access control.
     * @param _facets Asset Pool facets for the factory diamond to deploy.
     * @param _registry Registry address to point the pool to.
     */
    function deployAssetPool(IDiamondCut.FacetCut[] memory _facets, address _registry) external override {
        require(_registry != address(0), 'NO_REGISTRY');
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.Data storage s = LibFactoryStorage.s();
        //direct is required for the initialize functions below
        RelayDiamond d = new RelayDiamond(_facets, address(this));
        IDefaultDiamond assetPool = IDefaultDiamond(address(d));

        assetPool.setPoolRegistry(_registry);
        assetPool.transferOwnership(s.defaultController);
        assetPool.initializeRoles(s.defaultController);

        s.assetPools.push(address(d));
        s.isAssetPool[address(d)] = true;
        emit AssetPoolDeployed(address(d));
    }

    /**
     * @notice Deploys and stores the reference to an nft pool based.
     * @dev Transfers ownership to the controller and initializes access control.
     * @param _facets Asset Pool facets for the factory diamond to deploy.
     */
    function deployNFTPool(IDiamondCut.FacetCut[] memory _facets) external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.Data storage s = LibFactoryStorage.s();
        //direct is required for the initialize functions below
        RelayDiamond d = new RelayDiamond(_facets, address(this));
        IDefaultDiamond assetPool = IDefaultDiamond(address(d));

        assetPool.transferOwnership(s.defaultController);
        assetPool.initializeRoles(s.defaultController);

        s.assetPools.push(address(d));
        s.isAssetPool[address(d)] = true;
        emit AssetPoolDeployed(address(d));
    }
}