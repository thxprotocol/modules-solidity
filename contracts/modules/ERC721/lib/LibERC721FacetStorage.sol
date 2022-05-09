// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

import '../../../utils/ERC721/INonFungibleToken.sol';

library LibERC721ConnectStorage {
    bytes32 constant ERC721CONNECT_STORAGE_POSITION = keccak256('diamond.standard.erc721connect.storage');

    struct ERC721ConnectStorage {
        address registry;
        INonFungibleToken token;
    }

    function store() internal pure returns (ERC721ConnectStorage storage s) {
        bytes32 position = ERC721CONNECT_STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
