// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/interfaces/IDiamondCut.sol';

interface IAssetPoolFactory {
    event AssetPoolDeployed(address assetPool);
    event AssetPoolRegistered(address assetPool);

    function initialize() external;

    function setDefaultController(address _controller) external;
    
    function registerPool(address _pool) external;

    function deployAssetPool(IDiamondCut.FacetCut[] memory _facets, address _registry) external;
}
