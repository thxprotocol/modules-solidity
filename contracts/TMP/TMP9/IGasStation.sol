// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IGasStation {
    event Result(bool success, bytes data);

    function initializeGasStation(address _admin) external;

    function getGasStationAdmin() external view returns (address);

    function getLatestNonce(address _signer) external view returns (uint256);

    function call(
        bytes calldata _call,
        uint256 _nonce,
        bytes memory _sig
    ) external;

    function setSigning(bool _enabled) external;
}
