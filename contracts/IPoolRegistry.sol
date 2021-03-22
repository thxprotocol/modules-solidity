// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;

interface IPoolRegistry {
    function feeCollector() external returns (address);

    function feePercentage() external returns (uint256);
}
