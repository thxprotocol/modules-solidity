const { expect } = require('chai');
const { ethers } = require('hardhat');

describe.only('FeeCollector', function() {
    let owner;
    let contract;
    let token;
    let addr1;
    let addr2;
    let addrs

    beforeEach(async function () {
        [owner, token, addr1, addr2, ...addrs] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory('FeeCollector');
        contract = await Contract.deploy();
        
        await contract.deployed();
    });

    it('Set single reward', async function () {
        await contract.setRewards(addr1.address, [
            { 
                token: token.address, 
                amount: 5 
            },
        ]);

        console.log(await contract.connect(addr1).getRewards());
    });

    it('Set bulk rewards', async function () {
        await contract.setRewardsBulk([
            {
                recipient: addr1.address, 
                tokens: [
                    { 
                        token: token.address, 
                        amount: 5 
                    },
                ]
            },
        ]);

        console.log(await contract.connect(addr1).getRewards());
    });
});