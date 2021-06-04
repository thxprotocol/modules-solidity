// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import './RelayDiamond.sol';
import './IPoolRegistry.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';

contract PoolRegistry is IPoolRegistry, Ownable {
    address public override feeCollector;
    uint256 public override feePercentage;

    constructor(address _feeCollector, uint256 _feePercentage) public {
        feeCollector = _feeCollector;
        feePercentage = _feePercentage;
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        feeCollector = _feeCollector;
    }

    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        feePercentage = _feePercentage;
    }
}
