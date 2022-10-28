
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

import "@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract SharedWalletProxy is Initializable, ERC1967UpgradeUpgradeable {
    function initialize(address implementation) public virtual initializer {
        ERC1967UpgradeUpgradeable.__ERC1967Upgrade_init();
        _upgradeTo(implementation);
    }

    function getImplementation() external view returns (address) {
        return _getImplementation();
    }

    function upgradeTo(address newImplementation) external {
        _upgradeTo(newImplementation);
    }
}