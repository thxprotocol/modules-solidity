// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

/******************************************************************************\
* @title Minter Access Control
* @author Evert Kors <evert@thx.network>
* @notice Manage access control for MEMBER, MANAGER and OWNER roles.
* 
* Dependencies:
* TMP-1 Access Control: https://github.com/thxprotocol/modules/issues/1
* 
* Implementations: 
* TMP-2 Minter ID: https://github.com/thxprotocol/modules/issues/2
* TMP-3 Pool Roles: https://github.com/thxprotocol/modules/issues/3
/******************************************************************************/

import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import '../01-AccessControl/AccessControl.sol';

// depends on
import '../TMP/TMP1/IAccessControlEvents.sol';
import '../TMP/TMP1/LibAccessStorage.sol';

// implements
import '../TMP/TMP2/IMinterID.sol';
import './LibMinterAccessrAccessStorage.sol';
import './IMinterAccess.sol';

import '../TMP/RelayReceiver.sol';

contract MinterAccess is IMinterAccess, RelayReceiver {
    /**
     * @param _owner Address of the account that should own the contract.
     * @dev Should be called right after deploying the contract. _owner will become minter, manager and role admin.
     */
    function initializeRoles(address _owner) external override {
        require(LibMinterAccessStorage.minterStorage().minterCounter == 0, 'INIT');

        LibMinterAccessStorage.minterStorage().minterCounter = 1000;
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
        _setupRole(MINTER_ROLE, _owner);
        setupMinter(_owner);
    }

    modifier onlyMinter() {
        require(_hasRole(MINTER_ROLE, _msgSender()), 'NOT_MINTER');
        _;
    }

    /**
     * @param _account Address of the account to check the minter role for.
     * @return if the given address bears the minter role.
     */
    function isMinter(address _account) external view override returns (bool) {
        return _isMinter(_account);
    }

    /**
     * @param _account Address of the account to give the minter role to.
     */
    function addMinter(address _account) external override {
        require(_hasRole(MANAGER_ROLE, _msgSender()) || _hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), 'ACCESS');
        setupMinter(_account);
        _grantRole(MINTER_ROLE, _account);
    }

    /**
     * @param _account Address of the account to revoke the minter role for.
     */
    function removeMinter(address _account) external override {
        require(_hasRole(MANAGER_ROLE, _msgSender()) || _hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), 'ACCESS');
        _revokeRole(MINTER_ROLE, _account);
    }

    /**
     * @param _account Address of the account to check the minter role admin account for.
     * @return if the given address is the minter role admin.
     */
    function isMinterRoleAdmin(address _account) external view override returns (bool) {
        return _hasRole(LibAccessStorage.roleStorage().roles[MINTER_ROLE].adminRole, _account);
    }

    /**
     * @return address of the contract owner.
     */
    function getOwner() external view override returns (address) {
        return _getOwner();
    }

    /**
     * @notice Upgrades an existing minter address to a new minter address, can only be called by the minter itself.
     * @param _oldAddress The current address of the minter.
     * @param _newAddress The new address of the minter.
     * @dev Different minter id's can map to the same address.
     */
    function upgradeAddress(address _oldAddress, address _newAddress) external override {
        require(_oldAddress == _msgSender(), 'OLD_NOT_SENDER');
        LibMinterAccessStorage.MinterStorage storage ms = LibMinterAccessStorage.minterStorage();
        uint256 minter = ms.addressToMinter[_oldAddress];
        require(minter != 0, 'NON_MEMBER');
        ms.addressToMinter[_oldAddress] = 0;
        ms.addressToMinter[_newAddress] = minter;
        ms.minterToAddress[minter] = _newAddress;

        if (_hasRole(MINTER_ROLE, _oldAddress)) {
            _revokeRole(MINTER_ROLE, _oldAddress);
            _grantRole(MINTER_ROLE, _newAddress);
        }

        emit MinterAddressChanged(minter, _oldAddress, _newAddress);
    }

    /**
     * @notice Upgrades an existing minter address to a new minter address, can only be called by the minter itself.
     * @param _minter The index of the minter account.
     * @dev Different minter id's can map to the same address.
     * @return Address of the minter for the given minter index in the minterToAddress storage.
     */
    function getAddressByMinter(uint256 _minter) external view override returns (address) {
        return LibMinterAccessStorage.minterStorage().minterToAddress[_minter];
    }

    /**
     * @param _address The address of the minter account.
     * @return Index of the minter for a given address.
     */
    function getMinterByAddress(address _address) external view override returns (uint256) {
        return LibMinterAccessStorage.minterStorage().addressToMinter[_address];
    }

    /**
     * @param _account Address of the minter.
     * @dev Called during initilization.
     */
    function setupMinter(address _account) internal {
        LibMinterAccessStorage.MinterStorage storage ms = LibMinterAccessStorage.minterStorage();
        uint256 minter = ms.addressToMinter[_account];
        if (minter != 0) {
            //minter is already setup
            return;
        }
        ms.minterCounter += 1;
        ms.addressToMinter[_account] = ms.minterCounter;
        ms.minterToAddress[ms.minterCounter] = _account;
    }

    //
    // Access control view methods internal
    //
    using EnumerableSet for EnumerableSet.AddressSet;
    using Address for address;

    /**
     * @dev Checks if account bears role.
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     * @return if role minter storage array contains the given account address.
     */
    function _hasRole(bytes32 role, address account) internal view virtual returns (bool) {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        return rs.roles[role].minters.contains(account);
    }

    /**
     * @dev Called in initialize methods.
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     */
    function _setupRole(bytes32 role, address account) internal virtual {
        _grantRole(role, account);
    }

    /**
     * @dev Called during initialization
     * @param role Bytes32 array representing the role.
     * @param adminRole Address of the role admin
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        emit RoleAdminChanged(role, rs.roles[role].adminRole, adminRole);
        rs.roles[role].adminRole = adminRole;
    }

    /**
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     */
    function _grantRole(bytes32 role, address account) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        if (rs.roles[role].minters.add(account)) {
            emit RoleGranted(role, account, _msgSender());
        }
    }

    /**
     * @param role Bytes32 array representing the role.
     * @param account Address of the account
     */
    function _revokeRole(bytes32 role, address account) internal virtual {
        LibAccessStorage.RoleStorage storage rs = LibAccessStorage.roleStorage();

        if (rs.roles[role].minters.remove(account)) {
            emit RoleRevoked(role, account, _msgSender());
        }
    }

    //
    // Pool roles view methods internal
    //
    bytes32 internal constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 internal constant MINTER_ROLE = keccak256('MINTER_ROLE');
    bytes32 internal constant MANAGER_ROLE = keccak256('MANAGER_ROLE');

    function _isManager(address _account) internal view returns (bool) {
        return _hasRole(MANAGER_ROLE, _account);
    }

    function _isMinter(address _account) internal view returns (bool) {
        return _hasRole(MINTER_ROLE, _account) || _hasRole(MANAGER_ROLE, _account);
    }

    function _getOwner() internal view returns (address) {
        return LibDiamond.contractOwner();
    }
}
