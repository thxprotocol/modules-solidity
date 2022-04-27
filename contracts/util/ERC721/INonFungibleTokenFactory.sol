// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

interface INonFungibleTokenFactory {
    event NonFungibleTokenDeployed(address token);

    function deployNonFungibleToken(
        string memory _name,
        string memory _symbol,
        address _to,
        string memory _baseURI
    ) external;
}
