// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

/******************************************************************************\
* @title GasStation
* @author Evert Kors <evert@thx.network>
* @notice Manage gas costs for relayed contract calls.
* 
* Implementations:
* TMP-9 Gas Station: https://github.com/thxprotocol/modules/issues/9
/******************************************************************************/

import './LibSignature.sol';
import '../TMP/TMP9/LibGasStationStorage.sol';
import '../TMP/TMP9/IGasStation.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';

contract GasStationFacet is IGasStation {
    function initializeGasStation(address _admin) external override {
        require(msg.sender == LibDiamond.diamondStorage().contractOwner);
        LibGasStationStorage.gsStorage().admin = _admin;
        LibGasStationStorage.gsStorage().enabled = true;
    }

    function getGasStationAdmin() external view override returns (address) {
        return LibGasStationStorage.gsStorage().admin;
    }

    /**
     * @dev Get the latest nonce of a given signer
     * @param _signer Address of the signer
     */
    function getLatestNonce(address _signer) external view override returns (uint256) {
        return LibGasStationStorage.gsStorage().signerNonce[_signer];
    }

    /**
     * @dev Validate a given nonce, reverts if nonce is not right
     * @param _signer Address of the signer
     * @param _nonce Nonce of the signer
     */
    function validateNonce(address _signer, uint256 _nonce) private {
        LibGasStationStorage.GSStorage storage s = LibGasStationStorage.gsStorage();

        require(s.signerNonce[_signer] + 1 == _nonce, 'INVALID_NONCE');
        s.signerNonce[_signer] = _nonce;
    }

    function setSigning(bool _enabled) public override {
        require(msg.sender == LibGasStationStorage.gsStorage().admin, 'AUTH');
        LibGasStationStorage.gsStorage().enabled = _enabled;
    }

    // Multinonce? https://github.com/PISAresearch/metamask-comp#multinonce
    function call(
        bytes memory _call,
        uint256 _nonce,
        bytes memory _sig
    ) external override {
        require(msg.sender == LibGasStationStorage.gsStorage().admin, 'ONLY_ADMIN');
        require(LibGasStationStorage.gsStorage().enabled, 'SIGNING_DISABLED');

        bytes32 message = LibSignature.prefixed(keccak256(abi.encodePacked(_call, _nonce)));
        address signer = LibSignature.recoverSigner(message, _sig);

        validateNonce(signer, _nonce);
        (bool success, bytes memory returnData) = address(this).call(abi.encodePacked(_call, signer));
        emit Result(success, returnData);
    }
}
