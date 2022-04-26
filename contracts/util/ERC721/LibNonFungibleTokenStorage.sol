// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

import 'diamond-2/contracts/interfaces/IDiamondCut.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

library LibNonFungibleTokenStorage {
    bytes32 constant STORAGE_POSITION = keccak256('diamond.standard.nonfungibletoken.storage');
    using Counters for Counters.Counter;

    struct NonFungibleTokenStorage {
        Counters.Counter tokenIds;
    }

    function nonFungibleTokenStorage() internal pure returns (NonFungibleTokenStorage storage bs) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            bs.slot := position
        }
    }
}
