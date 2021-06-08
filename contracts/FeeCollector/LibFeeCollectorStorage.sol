// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

library LibFeeCollectorStorage {
    bytes32 constant FEECOLLECTOR_STORAGE_POSITION = keccak256('diamond.standard.feecollector.storage');

    struct Data {
        address assetPoolFactory;
        address thx;
        address weth;
        address factory;
        address router;
        mapping(address => uint256) totalFeeForToken;
    }

    function s() internal pure returns (Data storage bs) {
        bytes32 position = FEECOLLECTOR_STORAGE_POSITION;
        assembly {
            bs.slot := position
        }
    }
}
