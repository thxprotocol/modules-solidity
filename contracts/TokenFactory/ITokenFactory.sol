// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

interface ITokenFactory {
    event TokenDeployed(address token);

    function deployLimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address to,
        uint256 amount
    ) external;

    function deployUnlimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address to
    ) external;
}
