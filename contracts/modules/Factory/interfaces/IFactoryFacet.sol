// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;


import 'diamond-2/contracts/interfaces/IDiamondCut.sol';

interface IFactoryFacet {
    event DiamondDeployed(address indexed diamond, address indexed token);

    function initialize(address _owner, address _registry) external;

    function deploy(
        IDiamondCut.FacetCut[] memory _facets,
        address _erc20,
        address _erc721
    ) external;
}
