// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/interfaces/IDiamondCut.sol';

interface IUpdateDiamond {
    function updateAssetPool(bytes4[] memory _selectors, address _newAddress) external returns (uint256, bytes32);
}
