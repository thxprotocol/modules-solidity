// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

// diamond storage structs
// https://dev.to/mudgen/how-diamond-storage-works-90e#:~:text=Diamond%20storage%20is%20a%20contract,easy%20to%20read%20and%20write.

library LibTokenStorage {
    bytes32 constant TOKEN_STORAGE_POSITION = keccak256('diamond.standard.token.storage');

    struct TokenStorage {
        address registry;
        uint256 balance; // balance is not used but should not be removed as per diamond storage struct usage
        IERC20 token;
    }

    function tokenStorage() internal pure returns (TokenStorage storage ts) {
        bytes32 position = TOKEN_STORAGE_POSITION;
        assembly {
            ts.slot := position
        }
    }
}
