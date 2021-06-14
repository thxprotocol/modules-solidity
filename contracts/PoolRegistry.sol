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

    /**
     * @param _feeCollector Address of the FeeCollector contract.
     * @param _feeCollector Integer representing the deposit fee percentage.
     */
    constructor(address _feeCollector, uint256 _feePercentage) public {
        feeCollector = _feeCollector;
        feePercentage = _feePercentage;
    }

    /**
     * @param _feeCollector Address of the FeeCollector contract.
     */
    function setFeeCollector(address _feeCollector) external onlyOwner {
        feeCollector = _feeCollector;
    }

    /**
     * @param _feePercentage 0 - 100 value used for substracting fees from deposits into an asset pool.
     */
    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        feePercentage = _feePercentage;
    }
}
