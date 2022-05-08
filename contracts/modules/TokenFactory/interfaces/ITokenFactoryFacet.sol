// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

interface ITokenFactoryFacet {
    enum TokenType { Limited, Unlimited, NonFungible }
    event TokenDeployed(address token, TokenType tokenType);

    function deployNonFungibleToken(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        address _owner
    ) external;

    function deployLimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address _to,
        uint256 _amount
    ) external;

    function deployUnlimitedSupplyToken(
        string memory _name,
        string memory _symbol,
        address _owner
    ) external;
}
