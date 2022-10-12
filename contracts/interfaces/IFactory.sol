// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import 'diamond-2/contracts/interfaces/IERC173.sol';
import 'diamond-2/contracts/interfaces/IDiamondLoupe.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';
import '../modules/Factory/interfaces/IFactoryFacet.sol';

interface IFactory is IERC173, IDiamondLoupe, IDiamondCut, IFactoryFacet {}
