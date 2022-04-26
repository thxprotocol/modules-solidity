// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

interface IUnlimitedSupplyTokenFactory {
    event UnlimitedSupplyTokenDeployed(address token);

    function deployUnlimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address[] memory _minters,
        address _admin
    ) external;
}
