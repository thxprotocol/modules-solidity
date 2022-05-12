// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IUnlimitedSupplyToken is IERC20 {
    function isMinter(address _minter) external returns (bool);
    function addMinter(address _minter) external;
    function removeMinter(address _minter) external;
    function burn(address user, uint256 amount) external payable;
}