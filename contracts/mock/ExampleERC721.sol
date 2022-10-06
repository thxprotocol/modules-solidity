// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ExampleERC721 is ERC721 {

    using Counters for Counters.Counter;

    Counters.Counter private _tokenId;

    constructor(string memory baseURI_) ERC721('ExampleERC721', 'EX721') {
        _setBaseURI(baseURI_);
    }

    function mint(address to) public  {
         uint256 tokenId = _tokenId.current();
        _tokenId.increment();
        _safeMint(to, tokenId);
    }

    function getLastTokenId() public view returns (uint256) {
        return _tokenId.current();
    }
}
