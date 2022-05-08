const { expect } = require('chai');
const e = require('express');
const { ethers } = require('hardhat');
const { isCallTrace } = require('hardhat/internal/hardhat-network/stack-traces/message-trace');

describe.only ('Allocation', function () {
    const testalloc = await ethers.getContractFactory('Allocation');

    it('Should be allocate coin and amount and also check if its an address and integer', async function () {
        await testalloc.allocate(0x71C7656EC7ab88b098defB751B7401B5f6d8976F, 1000);
    });
});