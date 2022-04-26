// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

library LibMinterAccessStorage {
    bytes32 constant MINTER_ACCESS_STORAGE_POSITION = keccak256('diamond.standard.minter.access.storage');

    struct MemberStorage {
        uint256 minterCounter;
        mapping(address => uint256) addressToMinter;
        mapping(uint256 => address) minterToAddress;
    }

    function minterStorage() internal pure returns (MemberStorage storage rs) {
        bytes32 position = MINTER_ACCESS_STORAGE_POSITION;
        assembly {
            rs.slot := position
        }
    }
}
