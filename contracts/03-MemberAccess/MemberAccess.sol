// contracts/AssetPool.sol
// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';

// depends on
import '../TMP/TMP1/IAccessControlEvents.sol';
import '../TMP/TMP1/LibAccessStorage.sol';

// implements
import '../TMP/TMP2/IMemberID.sol';
import '../TMP/TMP2/LibMemberAccessStorage.sol';
import '../TMP/TMP3/IPoolRoles.sol';

import '../TMP/RelayReceiver.sol';

contract MemberAccess is IMemberID, IPoolRoles, RelayReceiver, IAccessControlEvents {
    function initializeRoles(address _owner) public override {
        LibMemberAccessStorage.memberStorage().memberCounter = 1000;
        setupMember(_owner);
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
        _setupRole(MEMBER_ROLE, _owner);
        _setupRole(MANAGER_ROLE, _owner);
    }

    function isMember(address _account) external view override returns (bool) {
        return _isMember(_account);
    }

    function addMember(address _account) external override {
        setupMember(_account);
        _grantRole(MEMBER_ROLE, _account);
    }

    function removeMember(address _account) external override {
        _revokeRole(MEMBER_ROLE, _account);
    }

    function isManager(address _account) external view override returns (bool) {
        return _isManager(_account);
    }

    function addManager(address _account) external override {
        setupMember(_account);
        _grantRole(MANAGER_ROLE, _account);
    }

    function removeManager(address _account) external override {
        require(_msgSender() != _account, 'OWN_ACCOUNT');
        _revokeRole(MANAGER_ROLE, _account);
    }

    function isManagerRoleAdmin(address _account) external view override returns (bool) {
        return _hasRole(LibAccessStorage.roleStorage().roles[MANAGER_ROLE].adminRole, _account);
    }

    function isMemberRoleAdmin(address _account) external view override returns (bool) {
        return _hasRole(LibAccessStorage.roleStorage().roles[MEMBER_ROLE].adminRole, _account);
    }

    function getOwner() external view override returns (address) {
        return _getOwner();
    }

    // todo warning
    // different member id's can map to the same address
    function upgradeAddress(address _oldAddress, address _newAddress) external override {
        require(_oldAddress == _msgSender(), 'OLD_NOT_SENDER');
        LibMemberAccessStorage.MemberStorage storage ms = LibMemberAccessStorage.memberStorage();
        uint256 member = ms.addressToMember[_oldAddress];
        require(member != 0, 'NON_MEMBER');
        ms.addressToMember[_oldAddress] = 0;
        ms.addressToMember[_newAddress] = member;
        ms.memberToAddress[member] = _newAddress;

        if (_hasRole(MEMBER_ROLE, _oldAddress)) {
            _revokeRole(MEMBER_ROLE, _oldAddress);
            _grantRole(MEMBER_ROLE, _newAddress);
        }

        if (_hasRole(MANAGER_ROLE, _oldAddress)) {
            _revokeRole(MANAGER_ROLE, _oldAddress);
            _grantRole(MANAGER_ROLE, _newAddress);
        }
        emit MemberAddressChanged(member, _oldAddress, _newAddress);
    }

    function getAddressByMember(uint256 _member) external view override returns (address) {
        return LibMemberAccessStorage.memberStorage().memberToAddress[_member];
    }

    function getMemberByAddress(address _address) external view override returns (uint256) {
        return LibMemberAccessStorage.memberStorage().addressToMember[_address];
    }

    function setupMember(address _account) internal {
        LibMemberAccessStorage.MemberStorage storage ms = LibMemberAccessStorage.memberStorage();
        uint256 member = ms.addressToMember[_account];
        if (member != 0) {
            //member is already setup
            return;
        }
        ms.memberCounter += 1;
        ms.addressToMember[_account] = ms.memberCounter;
        ms.memberToAddress[ms.memberCounter] = _account;
    }

    //
    // Access control view methods internal
    //
    using EnumerableSet for EnumerableSet.AddressSet;
    using Address for address;

    function _hasRole(bytes32 role, address account) internal view virtual returns (bool) {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        return rs.roles[role].members.contains(account);
    }

    function _setupRole(bytes32 role, address account) internal virtual {
        _grantRole(role, account);
    }

    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        emit RoleAdminChanged(role, rs.roles[role].adminRole, adminRole);
        rs.roles[role].adminRole = adminRole;
    }

    function _grantRole(bytes32 role, address account) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        if (rs.roles[role].members.add(account)) {
            emit RoleGranted(role, account, _msgSender());
        }
    }

    function _revokeRole(bytes32 role, address account) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        if (rs.roles[role].members.remove(account)) {
            emit RoleRevoked(role, account, _msgSender());
        }
    }

    //
    // Pool roles view methods internal
    //
    bytes32 internal constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 internal constant MEMBER_ROLE = keccak256('MEMBER_ROLE');
    bytes32 internal constant MANAGER_ROLE = keccak256('MANAGER_ROLE');

    function _isManager(address _account) internal view returns (bool) {
        return _hasRole(MANAGER_ROLE, _account);
    }

    function _isMember(address _account) internal view returns (bool) {
        return _hasRole(MEMBER_ROLE, _account) || _hasRole(MANAGER_ROLE, _account);
    }

    function _getOwner() internal view returns (address) {
        return LibDiamond.contractOwner();
    }
}
