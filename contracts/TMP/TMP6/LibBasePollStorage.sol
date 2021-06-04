// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

library LibBasePollStorage {
    bytes32 constant BASE_STORAGE = keccak256('diamond.contract.assetpool.basepoll');

    struct BaseStorage {
        uint256 pollCounter;
    }

    struct BasePollStorage {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 yesCounter;
        uint256 noCounter;
        uint256 totalVoted;
        mapping(address => Vote) votesByAddress;
    }

    struct Vote {
        uint256 time;
        uint256 weight;
        bool agree;
    }

    function getPosition(uint256 _id) internal pure returns (bytes32) {
        return keccak256(abi.encode('diamond.contract.assetpool.basepoll', _id));
    }

    function baseStorage() internal pure returns (BaseStorage storage bs) {
        bytes32 position = BASE_STORAGE;
        assembly {
            bs.slot := position
        }
    }

    function basePollStorage(bytes32 _pos) internal pure returns (BasePollStorage storage bs) {
        assembly {
            bs.slot := _pos
        }
    }

    function basePollStorageId(uint256 _id) internal pure returns (BasePollStorage storage bs) {
        bytes32 position = getPosition(_id);
        assembly {
            bs.slot := position
        }
    }
}
