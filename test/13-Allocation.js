const { expect } = require('chai');
const e = require('express');
const { ethers } = require('hardhat');
const { isCallTrace } = require('hardhat/internal/hardhat-network/stack-traces/message-trace');

describe('alloctest', function () {

// This gets the correct contract and creates the users.
    before(async function() {
        [user, user2] = await ethers.getSigners();
        const testalloc = await ethers.getContractFactory('allocation');

        alloctest = await testalloc.deploy();
        await alloctest.deployed();
    });

// This test allocates coins per user and logs it on the blockchain.
    it('Should be allocate coin and amount and also check if its an address and integer', async function () {
        await expect(alloctest.connect(user).allocate("0x71C7656EC7ab88b098defB751B7401B5f6d8976F", 1000)).to.emit(alloctest, 'Allocated');
        await expect(alloctest.connect(user).allocate("0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31", 1000)).to.emit(alloctest, 'Allocated');

        await expect(alloctest.connect(user2).allocate("0x71C7656EC7ab88b098defB751B7401B5f6d8976F", 2000)).to.emit(alloctest, 'Allocated');
        await expect(alloctest.connect(user2).allocate("0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31", 2000)).to.emit(alloctest, 'Allocated');



    });

// This test checks if the users have the correct amount of coins. It also checked for false values.
    it('Show the availabe amount per', async function () {
        let test = await alloctest.showAllocation("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
        console.log("Running test");
            if (test == 1000){
                console.log("Coin en amount komt overeen");
            } else {
                console.log("Coin en amount komt niet overeen");
            }
    });

    it('Show the availabe amount per', async function () {
        let test = await alloctest.showAllocation("0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31");
        console.log("Running test");
            if (test == 1000){
                console.log("Coin en amount komt overeen, coin2");
            } else {
                console.log("Coin en amount komt niet overeen, coin2");
            }
    });


    it('Show the availabe amount per', async function () {
        let test = await alloctest.connect(user2).showAllocation("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
        console.log("Running test");
            if (test == 2000){
                console.log("Coin en amount komt overeen user2");
            } else {
                console.log("Coin en amount komt niet overeen user2");
            }
    });

    it('Show the availabe amount per', async function () {
        let test = await alloctest.connect(user2).showAllocation("0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31");
        console.log("Running test");
            if (test == 2000){
                console.log("Coin en amount komt overeen user2, coin2");
            } else {
                console.log("Coin en amount komt niet overeen user2, coin2");
            }
    });

// This test deletes the allocated coins per user.
    it('Should delete the allocation', async function () {
        alloctest.connect(user).payout("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
        alloctest.connect(user2).payout("0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31");
    });

// This test checks if the allocation deletion worked.
    it('Check if delete worked', async function () {
        let test = await alloctest.showAllocation("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
        console.log("Running delete");
            if (test == 0){
                console.log("Delete functie werkt");
            } else {
                console.log("Delete functie werkt niet");
            }
    });

    it('Check if delete worked', async function () {
        let test = await alloctest.connect(user2).showAllocation("0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31");
        console.log("Running delete");
            if (test == 0){
                console.log("Delete functie werkt, user2");
            } else {
                console.log("Delete functie werkt niet, user2");
            }
    });

});
