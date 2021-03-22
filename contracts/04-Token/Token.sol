//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "diamond-2/contracts/libraries/LibDiamond.sol";

import "../IPoolRegistry.sol";
import "../TMP/TMP5/IToken.sol";
import "../TMP/TMP5/LibTokenStorage.sol";

contract Token is IToken {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    function setPoolRegistry(address _registry) external override {
        LibDiamond.enforceIsContractOwner();
        LibTokenStorage.tokenStorage().registry = _registry;
        emit RegistryUpdated(address(0), _registry);
    }

    function getPoolRegistry() external override view returns (address) {
        return LibTokenStorage.tokenStorage().registry;
    }

    function getBalance() external override view returns (uint256) {
        return LibTokenStorage.tokenStorage().balance;
    }

    function deposit(uint256 _amount) external override {
        LibTokenStorage.TokenStorage storage s = LibTokenStorage.tokenStorage();

        IPoolRegistry registry = IPoolRegistry(s.registry);

        uint256 fee = _amount.mul(registry.feePercentage()).div(10**18);
        uint256 amount = _amount.sub(fee);

        s.token.safeTransferFrom(msg.sender, registry.feeCollector(), fee);
        s.balance = s.balance.add(amount);
        s.token.safeTransferFrom(msg.sender, address(this), amount);
    }

    function addToken(address _token) external override {
        LibDiamond.enforceIsContractOwner();
        require(LibTokenStorage.tokenStorage().token == IERC20(0), "SET");

        LibTokenStorage.tokenStorage().token = IERC20(_token);
        emit TokenUpdated(address(0), _token);
    }

    function getToken() external override view returns (address) {
        return address(LibTokenStorage.tokenStorage().token);
    }
}
