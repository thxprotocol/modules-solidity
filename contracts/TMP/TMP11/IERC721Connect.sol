// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IERC721Connect {
    event ERC721Updated(address old, address current);

    function setERC721(address _token) external;

    function getERC721() external view returns (address);

    function mintFor(address beneficiary, string memory tokenUri) external;
}
