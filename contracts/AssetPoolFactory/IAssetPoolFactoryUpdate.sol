// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/interfaces/IDiamondCut.sol';

interface IAssetPoolFactoryUpdate {
    function updateAssetPoolFactory(bytes4[] memory _selectors, address _newAddress)
        external
        returns (uint256, bytes32);
}
