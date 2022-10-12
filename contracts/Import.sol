// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import 'diamond-2/contracts/facets/DiamondCutFacet.sol';
import 'diamond-2/contracts/facets/DiamondLoupeFacet.sol';
import 'diamond-2/contracts/facets/OwnershipFacet.sol';
import 'diamond-2/contracts/Diamond.sol';

// Get the compiler to pick up these facets
contract Imports {
    DiamondCutFacet public diamondCutFacet;
    DiamondLoupeFacet public diamondLoupeFacet;
    OwnershipFacet public ownershipFacet;
    Diamond public diamond;
}
