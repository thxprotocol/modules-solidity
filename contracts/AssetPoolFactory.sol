// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import "./RelayDiamond.sol";
import "./IDefaultDiamond.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "diamond-2/contracts/interfaces/IDiamondCut.sol";

contract AssetPoolFactory is Ownable {

    event AssetPoolDeployed(address assetPool);
    address public defaultController;

    address[] public assetPools;
    mapping(address => bool) public isAssetPool;

    IDiamondCut.FacetCut[] public defaultCut;

    constructor(IDiamondCut.FacetCut[] memory _facets) {
        defaultController = msg.sender;
        for (uint256 i; i < _facets.length; i++) {
            defaultCut.push(_facets[i]);
        }
    }

    function setDefaultController(address _controller) external onlyOwner {
        defaultController = _controller;
    }

    function deployAssetPool() external onlyOwner {
        // direct is required for the initialize functions below
        RelayDiamond d = new RelayDiamond(defaultCut, address(this));
        IDefaultDiamond assetPool = IDefaultDiamond(address(d));

        assetPool.transferOwnership(defaultController);
        assetPools.push(address(d));
        isAssetPool[address(d)] = true;
        emit AssetPoolDeployed(address(d));
    }
}
