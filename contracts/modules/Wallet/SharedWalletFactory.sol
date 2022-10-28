
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

import "./SharedWalletProxy.sol";
import "./SharedWallet.sol"
;contract SharedWalletProxyFactory {
    address immutable implementation;

    constructor() {
        implementation = address(new SharedWallet());
    }

    function createProxy() external returns (address) {
        SharedWalletProxy proxy = new SharedWalletProxy();
        proxy.initialize(implementation);
        return address(proxy);
    }
}