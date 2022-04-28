// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IMinterAccess {
    function initializeRoles(address _owner) external;

    function isMinter(address _account) external view returns (bool);

    function addMinter(address _account) external;

    function removeMinter(address _account) external;

    function isMinterRoleAdmin(address _account) external view returns (bool);

    function getOwner() external view returns (address);
}