// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

interface ITokenFactory {
    event TokenLimitedSupplyDeployed(address token);
    event TokenUnlimitedAccountDeployed(address token);

    function deployTokenLimitedSupply(
        string memory _name,
        string memory _symbol,
        address to,
        uint256 amount
    ) external;

    function deployTokenUnlimitedAccount(
        string memory _name,
        string memory _symbol,
        address to
    ) external;
}
