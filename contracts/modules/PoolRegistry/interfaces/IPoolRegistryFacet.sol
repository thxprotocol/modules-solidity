// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;

interface IPoolRegistryFacet {
    function initialize(address _feeCollector, uint256 _feePercentage) external;
    function setFeeCollector(address _feeCollector) external;
    function setFeePercentage(uint256 _feePercentage) external;
    function feeCollector() external view returns (address);
    function feePercentage() external view returns (uint256);
}
