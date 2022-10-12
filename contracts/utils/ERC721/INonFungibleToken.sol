// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

interface INonFungibleToken is IERC721 {
    function mint(address _recipient, string memory _tokenURI) external returns (uint256);
}
