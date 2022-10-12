// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

interface IRegistryProxyFacet {
    event RegistryProxyUpdated(address old, address current);

    function setRegistry(address _registry) external;

    function getRegistry() external view returns (address);
}
