// SPDX-License-Identifier: MIT
// source: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol

pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../TMP/TMP1/LibAccessStorage.sol";
import "../TMP/TMP1/IAccessControl.sol";
import "../TMP/TMP1/IAccessControlEvents.sol";
import "../TMP/RelayReceiver.sol";

contract AccessControl is IAccessControl, IAccessControlEvents, RelayReceiver {
    using EnumerableSet for EnumerableSet.AddressSet;
    using Address for address;

    function hasRole(bytes32 role, address account)
        external
        override
        view
        returns (bool)
    {
        return _hasRole(role, account);
    }

    function getRoleMemberCount(bytes32 role)
        public
        override
        view
        returns (uint256)
    {
        return LibAccessStorage.roleStorage().roles[role].members.length();
    }

    function getRoleMember(bytes32 role, uint256 index)
        public
        override
        view
        returns (address)
    {
        return LibAccessStorage.roleStorage().roles[role].members.at(index);
    }

    function getRoleAdmin(bytes32 role) public override view returns (bytes32) {
        return LibAccessStorage.roleStorage().roles[role].adminRole;
    }

    function grantRole(bytes32 role, address account) external override {
        require(
            _hasRole(
                LibAccessStorage.roleStorage().roles[role].adminRole,
                _msgSender()
            ),
            "AccessControl: sender must be an admin to grant"
        );
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) external override {
        require(
            _hasRole(
                LibAccessStorage.roleStorage().roles[role].adminRole,
                _msgSender()
            ),
            "AccessControl: sender must be an admin to revoke"
        );
        _revokeRole(role, account);
    }

    function renounceRole(bytes32 role, address account) external override {
        require(
            account == _msgSender(),
            "AccessControl: can only renounce roles for self"
        );
        _revokeRole(role, account);
    }

    function _hasRole(bytes32 role, address account)
        internal
        virtual
        view
        returns (bool)
    {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage
            .roleStorage();

        return rs.roles[role].members.contains(account);
    }

    function _setupRole(bytes32 role, address account) internal virtual {
        _grantRole(role, account);
    }

    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage
            .roleStorage();

        emit RoleAdminChanged(role, rs.roles[role].adminRole, adminRole);
        rs.roles[role].adminRole = adminRole;
    }

    function _grantRole(bytes32 role, address account) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage
            .roleStorage();

        if (rs.roles[role].members.add(account)) {
            emit RoleGranted(role, account, _msgSender());
        }
    }

    function _revokeRole(bytes32 role, address account) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage
            .roleStorage();

        if (rs.roles[role].members.remove(account)) {
            emit RoleRevoked(role, account, _msgSender());
        }
    }
}
