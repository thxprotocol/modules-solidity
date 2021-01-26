// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

interface IWithdrawPoll {
    function getBeneficiary(uint256 _id) external view returns (uint256);

    function getAmount(uint256 _id) external view returns (uint256);
}
