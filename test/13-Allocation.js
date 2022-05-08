const { expect } = require('chai');
const e = require('express');
const { ethers } = require('hardhat');
const { isCallTrace } = require('hardhat/internal/hardhat-network/stack-traces/message-trace');

describe.only ('alloctest', function () {

    before(async function() {
        const testalloc = await ethers.getContractFactory('allocation');

        alloctest = await testalloc.deploy();
        await alloctest.deployed();
    });

    it('Should be allocate coin and amount and also check if its an address and integer', async function () {
        await alloctest.allocate(0xcd3b766ccdd6ae721141f452c550ca635964ce71, 1000);
    });
});