// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/libraries/LibDiamond.sol';
import './lib/LibFactoryStorage.sol';
import './interfaces/IPoolFactoryFacet.sol';
import '../../interfaces/IDefaultDiamond.sol';
import '../../utils/RelayDiamond.sol';
import '../../utils/Access.sol';

contract PoolFactoryFacet is IPoolFactoryFacet, Access {
    /**
     * @notice Sets the controller for the factory diamond.
     * @param _controller Address of the diamond controller.
     */
    function setDefaultController(address _controller) external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.s().defaultController = _controller;
    }

    /**
     * @notice Deploys and stores the reference to an pool based on the current defaultCut.
     * @dev Transfers ownership to the controller and initializes access control.
     * @param _facets Pool facets for the factory diamond to deploy.
     * @param _registry Registry address to point the pool to.
     */
    function deployDefaultPool(
        IDiamondCut.FacetCut[] memory _facets,
        address _registry,
        address _erc20,
        address _erc721
    ) external override {
        require(_registry != address(0), 'NO_REGISTRY');
        require(_erc20 != address(0), 'NO_TOKEN');

        LibFactoryStorage.Data storage s = LibFactoryStorage.s();
        RelayDiamond diamond = new RelayDiamond(_facets, address(this));

        IDefaultDiamond pool = IDefaultDiamond(address(diamond));
        pool.setPoolRegistry(_registry);
        pool.setERC20(_erc20);

        if(_erc721 != address(0)) {
            pool.setERC721(_erc721);
        }
        
        pool.transferOwnership(s.defaultController);
        pool.initializeRoles(s.defaultController);

        emit PoolDeployed(address(diamond), _erc20);
    }

    /**
     * @notice Deploys and stores the reference to an nft pool based.
     * @dev Transfers ownership to the controller and initializes access control.
     * @param _facets Pool facets for the factory diamond to deploy.
     */
    function deployNFTPool(IDiamondCut.FacetCut[] memory _facets, address _token) external override {
        require(_token != address(0), 'NO_TOKEN');

        LibFactoryStorage.Data storage s = LibFactoryStorage.s();
        RelayDiamond diamond = new RelayDiamond(_facets, address(this));

        IDefaultDiamond pool = IDefaultDiamond(address(diamond));
        pool.setERC721(_token);
        pool.transferOwnership(s.defaultController);
        pool.initializeRoles(s.defaultController);

        emit PoolDeployed(address(diamond), _token);
    }
}
