const { expect } = require('chai');
const e = require('express');
const { ethers } = require('hardhat');
const { isCallTrace } = require('hardhat/internal/hardhat-network/stack-traces/message-trace');

describe.only('alloctest', function () {

    before(async function() {
        //const [user] = await ethers.getSigners();
        const testalloc = await ethers.getContractFactory('allocation');

        alloctest = await testalloc.deploy();
        await alloctest.deployed();
    });

    it('Should be allocate coin and amount and also check if its an address and integer', async function () {
        await expect(alloctest.allocate("0x71C7656EC7ab88b098defB751B7401B5f6d8976F", 1000)).to.emit(alloctest, 'Allocated');

    });
    it('Show the availabe amount per', async function () {
        let test = alloctest.showAllocation("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
        console.log("Running test");
        test.then(function(result) {
            if (result == 1000){
                console.log("Coin en amount komt overeen");
            } else {
                console.log("Coin en amount komt niet overeen");
            }
        })
    });
    it('Should delete the allocation', async function () {
        alloctest.payout("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    });

    it('Check if delete worked', async function () {
        let test = alloctest.showAllocation("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
        console.log("Running delete");
        test.then(function(result) {
            if (result == 0){
                console.log("Delete functie werkt");
            } else {
                console.log("Delete functie werkt niet");
            }
        })
    });

});