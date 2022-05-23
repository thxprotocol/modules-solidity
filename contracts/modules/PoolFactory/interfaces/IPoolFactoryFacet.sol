// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/interfaces/IDiamondCut.sol';

interface IPoolFactoryFacet {
    event PoolDeployed(address pool);
    
    function setDefaultController(address _controller) external;  
    function deployDefaultPool(IDiamondCut.FacetCut[] memory _facets, address _registry, address _token) external;
    function deployNFTPool(IDiamondCut.FacetCut[] memory _facets, address _token) external;
}
