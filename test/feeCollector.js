const { expect } = require('chai');
const { ethers } = require('hardhat');

describe.only('FeeCollector', function() {
    let contract;
    let owner;
    let token;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, token, addr1, addr2] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory('FeeCollector');
        contract = await Contract.deploy();
        
        await contract.deployed();
    });

    it('Require rewards to be set to retrieve', async function () {
        await expect(contract.connect(addr1).getRewards()).to.be.reverted;
    });
    
    it('Set single reward', async function () {
        const reward = {
            token: token.address,
            amount: 5,
        }

        await contract.setRewards(addr1.address, [reward]);

        const setValue = await contract.connect(addr1).getRewards();
        expect(setValue[0][0].toString()).to.eq(reward.token);
        expect(setValue[0][1].toNumber()).to.eq(reward.amount);
    });

    it('Set bulk rewards', async function () {
        const reward = {
            token: token.address,
            amount: 5,
        }

        const reward2 = {
            token: token.address,
            amount: 27,
        }

        await contract.setRewardsBulk([
            {
                recipient: addr1.address, 
                tokens: [reward],
            },
            {
                recipient: addr2.address,
                tokens: [reward2],
            },
        ]);

        const setValue = await contract.connect(addr1).getRewards();
        expect(setValue[0][0].toString()).to.eq(reward.token);
        expect(setValue[0][1].toNumber()).to.eq(reward.amount);

        const setValue2 = await contract.connect(addr2).getRewards();
        expect(setValue2[0][0].toString()).to.eq(reward2.token);
        expect(setValue2[0][1].toNumber()).to.eq(reward2.amount);
    });
});