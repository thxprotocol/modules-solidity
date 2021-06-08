// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.5.16;

import 'hardhat/console.sol';

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import '@uniswap/v2-core/contracts/UniswapV2Pair.sol';

contract MockUniswapV2Factory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    function initialize(
        address _token,
        address _weth,
        address _thx
    ) external {
        createPair(_token, _weth);
        createPair(_weth, _thx);
    }

    function createPair(address token0, address token1) internal returns (address pair) {
        bytes memory bytecode = type(UniswapV2Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IUniswapV2Pair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
    }
}
