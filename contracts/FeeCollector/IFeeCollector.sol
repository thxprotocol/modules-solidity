// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

interface IFeeCollector {
    event FeeCollected(address token, uint256 amount);
    event FeeSwapped(address token, uint256 amount);

    function initializeCollector(address _assetPoolFactory, address _thx) external;

    function registerFee(address _token, uint256 _fee) external;

    function swapExactTokensForTHX(
        address _token,
        uint256 _minOut,
        uint256 _deadline
    ) external;
}
