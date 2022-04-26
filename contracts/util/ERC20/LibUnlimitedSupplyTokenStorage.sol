// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

import 'diamond-2/contracts/interfaces/IDiamondCut.sol';

library LibUnlimitedSupplyTokenStorage {
    bytes32 constant STORAGE_POSITION = keccak256('diamond.standard.unlimitedsupplytoken.storage');

    struct UnlimitedSupplyTokenStorage {
        mapping(address => bool) minters;
        address public immutable admin;
    }

    function unlimitedSupplyTokenStorage() internal pure returns (UnlimitedSupplyTokenStorage storage bs) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            bs.slot := position
        }
    }
}
