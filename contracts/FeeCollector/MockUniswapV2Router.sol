// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

import 'hardhat/console.sol';

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';

contract MockUniswapV2Router02 {
    using SafeERC20 for IERC20;

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        IERC20(path[path.length - 1]).safeTransfer(to, amountOutMin + 10**18);
    }
}
