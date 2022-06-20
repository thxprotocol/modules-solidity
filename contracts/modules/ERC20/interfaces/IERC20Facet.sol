// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IERC20Facet {
    event Topup(address sender, uint256 amount);
    event ERC20Updated(address old, address current);
    event RegistryUpdated(address old, address current);
    event DepositFeeCollected(uint256 fee);
    event Deposited(address sender, uint256 amount);
    event TransferFeeCollected(uint256 fee);
    event TransferredTo(address recipient, uint256 amount);
    event SwapRuleUpdated(address tokenAddress, uint256 multiplier);
    event Swap(address sender, uint256 amountIn, uint256 amountOut, address tokenIn, address tokenOut);

    function setPoolRegistry(address _registry) external;
    function getPoolRegistry() external view returns (address);
    function setERC20(address _token) external;
    function getERC20() external view returns (address);
    function getBalance() external view returns (uint256);
    function deposit(uint256 _amount) external;
    function topup(uint256 _amount) external;
    function transferToMany(address[] memory _recipients, uint256[] memory _amounts) external;
    function setSwapRule(address _tokenAddress, uint256 multiplier) external;
    function getSwapRule(address _tokenAddress) external view returns (uint256);
    function swap(uint256 _amountIn, address _tokenAddress) external;
}
