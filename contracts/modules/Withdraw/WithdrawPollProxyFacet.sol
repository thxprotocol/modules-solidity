// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Withdraw Poll Proxy
* @author Evert Kors <evert@thx.network>
* @notice Supports relayed withdraw poll calls
/******************************************************************************/

import './interfaces/IWithdrawPollProxyFacet.sol';
import '../BasePoll/lib/LibBasePollStorage.sol';
import '../../utils/RelayReceiver.sol';

contract WithdrawPollProxyFacet is IWithdrawPollProxyFacet, RelayReceiver {
    function withdrawPollVote(uint256 _id, bool _agree) external override {
        bytes32 position = LibBasePollStorage.getPosition(_id);
        bytes4 sig = bytes4(keccak256('_withdrawPollVote(bool)'));
        bytes memory _call = abi.encodeWithSelector(sig, _agree);

        (bool success, bytes memory data) = address(this).call(abi.encodePacked(_call, position, _msgSender()));
        require(success, string(data));
    }

    function withdrawPollRevokeVote(uint256 _id) external override {
        bytes32 position = LibBasePollStorage.getPosition(_id);
        bytes4 sig = bytes4(keccak256('_withdrawPollRevokeVote()'));
        bytes memory _call = abi.encodeWithSelector(sig);

        (bool success, bytes memory data) = address(this).call(abi.encodePacked(_call, position, _msgSender()));
        require(success, string(data));
    }

    function withdrawPollFinalize(uint256 _id) external override {
        bytes32 position = LibBasePollStorage.getPosition(_id);
        bytes4 sig = bytes4(keccak256('_withdrawPollFinalize()'));
        bytes memory _call = abi.encodeWithSelector(sig);

        (bool success, bytes memory data) = address(this).call(abi.encodePacked(_call, position, _msgSender()));
        require(success, string(data));
    }

    function withdrawPollApprovalState(uint256 _id) external view override returns (bool) {
        bytes32 position = LibBasePollStorage.getPosition(_id);
        bytes4 sig = bytes4(keccak256('_withdrawPollApprovalState()'));
        bytes memory _call = abi.encodeWithSelector(sig);

        (bool success, bytes memory data) = address(this).staticcall(abi.encodePacked(_call, position, _msgSender()));
        require(success, string(data));
        return abi.decode(data, (bool));
    }
}
