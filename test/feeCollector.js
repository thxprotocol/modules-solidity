const { expect } = require('chai');
const { ethers } = require('hardhat');

describe.only('Example', function() {
    let owner;

    before(async function () {
        [admin, user] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory('FeeCollector');
        contract = await Contract.deploy();

        await contract.deployed();
    });

    it('Example test', async function () {
    });
}); 