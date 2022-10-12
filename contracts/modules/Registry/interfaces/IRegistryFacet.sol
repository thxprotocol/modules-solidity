// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

interface IRegistryFacet {
    function initialize(address _feeCollector, uint256 _feePercentage) external;

    function setFeeCollector(address _feeCollector) external;

    function setFeePercentage(uint256 _feePercentage) external;

    function feeCollector() external view returns (address);

    function feePercentage() external view returns (uint256);
}
