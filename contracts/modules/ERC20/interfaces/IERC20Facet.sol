// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IERC20Facet {
    event ERC20Updated(address old, address current);
    event RegistryUpdated(address old, address current);
    event PaymentFeeCollected(uint256 fee);
    event Paid(address sender, uint256 amount);
    event TransferFeeCollected(uint256 fee);
    event TransferredTo(address recipient, uint256 amount);

    function setPoolRegistry(address _registry) external;
    function getPoolRegistry() external view returns (address);
    function setERC20(address _token) external;
    function getERC20() external view returns (address);
    function getBalance() external view returns (uint256);
    function pay(uint256 _amount) external;
    function transferToMany(address[] memory _recipients, uint256[] memory _amounts) external; 
}
