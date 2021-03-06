// contracts/AssetPool.sol
// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "diamond-2/contracts/libraries/LibDiamond.sol";

// depends on
import "../TMP/TMP1/IAccessControlEvents.sol";
import "../TMP/TMP1/LibAccessStorage.sol";

import "../TMP/RelayReceiver.sol";

contract Access is RelayReceiver, IAccessControlEvents {
    //
    // Access control view methods internal
    //
    using EnumerableSet for EnumerableSet.AddressSet;
    using Address for address;

    modifier onlyOwner() {
        require(LibDiamond.contractOwner() == _msgSender(), "NOT_OWNER");
        _;
    }

    modifier onlyManager() {
        require(_hasRole(MANAGER_ROLE, _msgSender()), "NOT_MANAGER");
        _;
    }

    modifier onlyMember() {
        require(_hasRole(MEMBER_ROLE, _msgSender()), "NOT_MEMBER");
        _;
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

    //
    // Pool roles view methods internal
    //
    bytes32 internal constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 internal constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    bytes32 internal constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    function _isManager(address _account) internal view returns (bool) {
        return _hasRole(MANAGER_ROLE, _account);
    }

    function _isMember(address _account) internal view returns (bool) {
        return
            _hasRole(MEMBER_ROLE, _account) || _hasRole(MANAGER_ROLE, _account);
    }

    function _getOwner() internal view returns (address) {
        return LibDiamond.contractOwner();
    }
}
