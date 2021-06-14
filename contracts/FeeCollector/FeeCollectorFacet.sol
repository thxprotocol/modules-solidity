// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Fee Collector
* @author Peter Polman <peter@thx.network>
* @notice Functions in this contract are called periodically
* @dev This facet contract is part of a diamond and can be upgraded by the diamond controller
/******************************************************************************/

import '../RelayDiamond.sol';
import '../IDefaultDiamond.sol';
import '../AssetPoolFactory/IAssetPoolFactory.sol';
import './IFeeCollector.sol';
import './LibFeeCollectorStorage.sol';

import 'diamond-2/contracts/libraries/LibDiamond.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';

import 'quickswap-periphery/contracts/interfaces/IUniswapV2Router02.sol';

import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';

contract FeeCollectorFacet is IFeeCollector {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /**
     * @param _assetPoolFactory The address of the THX asset pool factory
     * @param _thx The address of the THX ERC20 token
     */
    function initializeCollector(address _assetPoolFactory, address _thx) external override {
        LibDiamond.enforceIsContractOwner();
        LibFeeCollectorStorage.Data storage s = LibFeeCollectorStorage.s();

        s.assetPoolFactory = _assetPoolFactory;
        s.thx = _thx;

        s.router = 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff;
        s.factory = 0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32;
        s.weth = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;
    }

    /**
     * @param _token The address of a pool token that has registered fees.
     */
    function getTotalFeeForToken(address _token) public view override returns (uint256) {
        LibFeeCollectorStorage.Data storage s = LibFeeCollectorStorage.s();
        return s.totalFeeForToken[_token];
    }

    /**
     * @param _token The address of the token that was deposited to the asset pool
     * @param _fee The amount of tokens transfered to the collector
     */
    function registerFee(address _token, uint256 _fee) external override {
        LibFeeCollectorStorage.Data storage s = LibFeeCollectorStorage.s();
        require(s.assetPoolFactory != address(0), 'NO_POOL_FACTORY');
        require(IAssetPoolFactory(s.assetPoolFactory).isAssetPool(msg.sender), 'NOT_POOL');

        s.totalFeeForToken[_token] = s.totalFeeForToken[_token].add(_fee);

        emit FeeCollected(_token, _fee);
    }

    /**
     * @param _path The address of the input token that was deposited to the asset pool
     * @param _minOut The minimum amount of output tokens that must be received for the transaction not to revert
     * @param _deadline Unix timestamp after which the transaction will revert
     */
    function swapExactTokensForTHX(
        address[] memory _path,
        uint256 _minOut,
        uint256 _deadline
    ) external override {
        LibDiamond.enforceIsContractOwner();
        LibFeeCollectorStorage.Data storage s = LibFeeCollectorStorage.s();

        uint256 amountToSwap = s.totalFeeForToken[_path[0]];

        if (amountToSwap > 0) {
            IERC20(_path[0]).safeApprove(s.router, amountToSwap);
            IUniswapV2Router02(s.router).swapExactTokensForTokens(
                amountToSwap,
                _minOut,
                _path,
                address(this),
                _deadline
            );

            s.totalFeeForToken[_path[0]] = s.totalFeeForToken[_path[0]].sub(amountToSwap);

            emit FeeSwapped(_path[0], amountToSwap);
        }
    }
}

contract MockFeeCollectorFacet is FeeCollectorFacet {
    function setUniswapV2Router02(address _router) external {
        LibFeeCollectorStorage.Data storage s = LibFeeCollectorStorage.s();
        s.router = _router;
    }
}
