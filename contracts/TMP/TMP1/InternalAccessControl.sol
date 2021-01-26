// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

import "../RelayReceiver.sol";

contract InternalAccessControl is RelayReceiver {
    // TODO test with conflicting storage (with other pools)
    // set storage pointer based upon assigned id (by factory)

    function getRoleAdmin(bytes32 role) internal view returns (bytes32) {
        bytes4 sig = bytes4(keccak256("getRoleAdmin(bytes32)"));
        bytes memory _call = abi.encodeWithSelector(sig, role);

        (bool success, bytes memory data) = address(this).staticcall(
            abi.encodePacked(_call, _msgSender())
        );
        require(success, string(data));
        return abi.decode(data, (bytes32));
    }
}
