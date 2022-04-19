const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Example', function() {
    let owner;
    let contract;

    before(async function () {
        [owner, addr1] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory('FeeCollector');
        contract = await Contract.deploy();
        
        await contract.deployed();
    });

    it('Example test', async function () {
        // TODO
    });
});