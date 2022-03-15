// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

interface ITokenFactory {
    enum TokenType { Limited, Unlimited }
    event TokenDeployed(address token, TokenType tokenType);

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
