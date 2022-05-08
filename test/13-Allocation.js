const { expect } = require('chai');
const e = require('express');
const { ethers } = require('hardhat');
const { isCallTrace } = require('hardhat/internal/hardhat-network/stack-traces/message-trace');

describe.only('alloctest', function () {

    before(async function() {
        const testalloc = await ethers.getContractFactory('allocation');

        alloctest = await testalloc.deploy();
        await alloctest.deployed();
    });

    it('Should be allocate coin and amount and also check if its an address and integer', async function () {
        await expect(alloctest.allocate(0x71C7656EC7ab88b098defB751B7401B5f6d8976F, 1000));
    });
    it('Show the availabe amount per', async function () {
        let test = alloctest.showAllocation(0x71C7656EC7ab88b098defB751B7401B5f6d8976F);
        test.then(function(result) {
            if (result == 1000){
                console.log("yes");
            } else {
                console.log("no");
            }
        })
    });
});