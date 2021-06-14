// SPDX-License-Identifier: Apache-2.0
// source: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol

pragma solidity >=0.6.0 <0.8.0;

/******************************************************************************\
* @author Evert Kors <evert@thx.network>
* @dev Only used during tests.
* 
* Implementations: 
* TMP-1 Access Control: https://github.com/thxprotocol/modules/issues/1
/******************************************************************************/

import '../TMP/TMP1/IAccessControl.sol';
import '../TMP/TMP1/IAccessControlEvents.sol';

contract AccessControlMock is IAccessControl, IAccessControlEvents {
    // TODO, consider moving storage to lib, for diamond tests
    bool hasRoleMock;

    function mockHasRole(bool _value) public {
        hasRoleMock = _value;
    }

    function hasRole(bytes32 role, address account) external view override returns (bool) {
        return hasRoleMock;
    }

    uint256 getRoleMemberCountMock;

    function mockGetRoleMemberCount(uint256 _value) public {
        getRoleMemberCountMock = _value;
    }

    function getRoleMemberCount(bytes32 role) public view override returns (uint256) {
        return getRoleMemberCountMock;
    }

    address getRoleMemberMock;

    function mockGetRoleMember(address _value) public {
        getRoleMemberMock = _value;
    }

    function getRoleMember(bytes32 role, uint256 index) public view override returns (address) {
        return getRoleMemberMock;
    }

    bytes32 getRoleAdminMock;

    function mockGetRoleAdmin(bytes32 _value) public {
        getRoleAdminMock = _value;
    }

    function getRoleAdmin(bytes32 role) public view override returns (bytes32) {
        return getRoleAdminMock;
    }

    function grantRole(bytes32 role, address account) external override {}

    function revokeRole(bytes32 role, address account) external override {}

    function renounceRole(bytes32 role, address account) external override {}
}
