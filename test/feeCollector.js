const { expect } = require('chai');
const { ethers } = require('hardhat');

describe.only('FeeCollector', function() {
    let contract, owner, token, addr1, addr2, addr3;

    beforeEach(async function () {
        [owner, token, addr1, addr2, ...addr3] = await ethers.getSigners();

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

        const assignedRewards = await contract.connect(addr1).getRewards();
        expect(assignedRewards[0][0].toString()).to.eq(reward.token);
        expect(assignedRewards[0][1].toNumber()).to.eq(reward.amount);
    });

    it('Set multiple rewards', async function () {
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

        const assignedRewards = await contract.connect(addr1).getRewards();
        expect(assignedRewards[0][0].toString()).to.eq(reward.token);
        expect(assignedRewards[0][1].toNumber()).to.eq(reward.amount);

        const assignedRewards2 = await contract.connect(addr2).getRewards();
        expect(assignedRewards2[0][0].toString()).to.eq(reward2.token);
        expect(assignedRewards2[0][1].toNumber()).to.eq(reward2.amount);
    });

    it('Require rewards to be set to withdraw', async function () {
        await expect(contract.connect(addr1).withdraw(token.address)).to.be.reverted;
        await expect(contract.connect(addr1).withdrawBulk(token.address)).to.be.reverted;
    });

    it('Withdraw single token', async function () {
        const reward = {
            token: token.address,
            amount: 5,
        }

        const reward2 = {
            token: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
            amount: 27,
        }

        await contract.setRewards(addr1.address, [reward, reward2]);

        await contract.connect(addr1).withdraw(token.address);

        const assignedRewards = await contract.connect(addr1).getRewards();
        expect(assignedRewards[0][0].toString()).to.eq(reward2.token);
        expect(assignedRewards[0][1].toNumber()).to.eq(reward2.amount);
    });

    it('Withdraw multiple tokens', async function () {
        const reward = {
            token: token.address,
            amount: 5,
        }

        const reward2 = {
            token: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
            amount: 27,
        }

        await contract.setRewards(addr1.address, [reward, reward2]);

        await contract.connect(addr1).withdrawBulk();

        await expect(contract.connect(addr1).getRewards()).to.be.reverted;
    });
});