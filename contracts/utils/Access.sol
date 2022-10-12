// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import 'diamond-2/contracts/libraries/LibDiamond.sol';

contract Access {
    modifier onlyOwner() {
        require(LibDiamond.contractOwner() == msg.sender, 'NOT_OWNER');
        _;
    }
}
