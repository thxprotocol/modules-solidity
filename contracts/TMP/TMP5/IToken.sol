// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IToken {
    event TokenUpdated(address old, address current);

    function addToken(address _token) external;

    function getToken() external view returns (address);
}
