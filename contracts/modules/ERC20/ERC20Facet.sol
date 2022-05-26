// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;

/******************************************************************************\
* @title Asset Pool ERC20 asset type.
* @author Evert Kors <evert@thx.network>
* @notice Connect and deposit ERC20 assets.
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import './interfaces/IERC20Facet.sol';
import './lib/LibTokenStorage.sol';
import '../../utils/Access.sol';
import '../PoolRegistry/interfaces/IPoolRegistryFacet.sol';

contract ERC20Facet is Access, IERC20Facet {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /**
     * @notice Sets registry address for the asset pool.
     * @param _registry Address of the registry contract.
     * @dev Registry contains general pool settings and will be governable at some point.
     */
    function setPoolRegistry(address _registry) external override onlyOwner {
        LibTokenStorage.tokenStorage().registry = _registry;
        emit RegistryUpdated(address(0), _registry);
    }

    /**
     * @return address of the registry contract of the asset pool.
     */
    function getPoolRegistry() external view override returns (address) {
        return LibTokenStorage.tokenStorage().registry;
    }

    /**
     * @param _erc20 Address of the ERC20 contract to use in the asset pool.
     * @dev Can only be set once.
     */
    function setERC20(address _erc20) external override onlyOwner {
        require(LibTokenStorage.tokenStorage().token == IERC20(0), 'INIT');
        require(_erc20 != address(0), 'ZERO');

        uint256 MAX_INT = 2**256 - 1;

        LibTokenStorage.tokenStorage().token = IERC20(_erc20);
        LibTokenStorage.tokenStorage().token.approve(address(this), MAX_INT);
        emit ERC20Updated(address(0), _erc20);
    }

    /// @return address of the ERC20 contract used in the asset pool.
    function getERC20() external view override returns (address) {
        return address(LibTokenStorage.tokenStorage().token);
    }

    /**
     * @return pool token balance for the asset pool
     */
    function getBalance() external view override returns (uint256) {
        return LibTokenStorage.tokenStorage().token.balanceOf(address(this));
    }

    /**
     * @notice Calculates the deposit fee over the amount and substracts of the total. Fee is transfered to FeeCollector address as stored in the registry.
     * @param _amount Deposit amount to transfer to the pool.
     * @dev Make sure a transfer for the given amount is approved before calling.
     */
    function deposit(uint256 _amount) external override {
        require(_amount > 0, 'ZERO_AMOUNT');
        LibTokenStorage.TokenStorage storage s = LibTokenStorage.tokenStorage();

        IPoolRegistryFacet registry = IPoolRegistryFacet(s.registry);

        uint256 fee = _amount.mul(registry.feePercentage()).div(10**18);
        uint256 amount = _amount.sub(fee);

        if (fee > 0) {
            s.token.safeTransferFrom(_msgSender(), registry.feeCollector(), fee);
            emit DepositFeeCollected(fee);
        }

        s.token.safeTransferFrom(_msgSender(), address(this), amount);
        emit Depositted(_msgSender(), amount);
    }

    function topup(uint256 _amount) external override onlyOwner {
        require(_amount > 0, 'ZERO_AMOUNT');
        LibTokenStorage.TokenStorage storage s = LibTokenStorage.tokenStorage();
        s.token.safeTransferFrom(_msgSender(), address(this), _amount);
        emit Topup(_msgSender(), _amount);
    }

    function transferToMany(address[] memory _recipients, uint256[] memory _amounts) external override onlyOwner {
        require(_amounts.length == _recipients.length, 'INVALID_INPUT');

        LibTokenStorage.TokenStorage storage s = LibTokenStorage.tokenStorage();
        IPoolRegistryFacet registry = IPoolRegistryFacet(s.registry);

        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_amounts[i] > 0, 'ZERO_AMOUNT');

            uint256 fee = _amounts[i].mul(registry.feePercentage()).div(10**18);

            if (fee > 0) {
                s.token.safeTransferFrom(address(this), registry.feeCollector(), fee);
                emit TransferFeeCollected(fee);
            }

            s.token.safeTransferFrom(address(this), _recipients[i], _amounts[i]);
            emit TransferredTo(_recipients[i], _amounts[i]);
        }
    }
}
