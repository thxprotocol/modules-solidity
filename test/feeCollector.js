const { expect } = require('chai');
const { ethers } = require('hardhat');

describe.only('FeeCollector', function() {
    let contract, tokenContract1, tokenContract2, tokenContract3, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory('FeeCollector');
        contract = await Contract.deploy();

        const TokenContract1 = await ethers.getContractFactory('LimitedSupplyToken');
        tokenContract1 = await TokenContract1.deploy('TEST token 1', 'TST1', contract.address, 1000);

        const TokenContract2 = await ethers.getContractFactory('LimitedSupplyToken');
        tokenContract2 = await TokenContract2.deploy('TEST token 2', 'TST2', contract.address, 1000);

        const TokenContract3 = await ethers.getContractFactory('LimitedSupplyToken');
        tokenContract3 = await TokenContract3.deploy('TEST token 3', 'TST3', contract.address, 1);
        
        await contract.deployed();
    });

    it('Return empty array when no rewards are set or all have been withdrawn', async function () {
        const contractRewards = await contract.getRewards(addr1.address);
        expect(contractRewards.length).to.equal(0);
    });
    
    it('Set single reward', async function () {
        const reward = {
            token: tokenContract1.address,
            amount: 5,
        }

        await contract.setRewards(addr1.address, [reward]);

        const assignedRewards = await contract.getRewards(addr1.address);
        expect(assignedRewards[0][0].toString()).to.eq(reward.token);
        expect(assignedRewards[0][1].toNumber()).to.eq(reward.amount);
    });

    it('Set multiple rewards', async function () {
        const reward = {
            token: tokenContract1.address,
            amount: 5,
        }

        const reward2 = {
            token: tokenContract2.address,
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

        const assignedRewards = await contract.getRewards(addr1.address);
        expect(assignedRewards[0][0].toString()).to.eq(reward.token);
        expect(assignedRewards[0][1].toNumber()).to.eq(reward.amount);

        const assignedRewards2 = await contract.getRewards(addr2.address);
        expect(assignedRewards2[0][0].toString()).to.eq(reward2.token);
        expect(assignedRewards2[0][1].toNumber()).to.eq(reward2.amount);
    });

    it('Require rewards to be set to withdraw', async function () {
        await expect(contract.connect(addr1).withdraw(tokenContract1.address)).to.be.reverted;
        await expect(contract.connect(addr1).withdrawBulk()).to.be.reverted;
    });

    it('Emit event on withdraw', async function () {
        const reward = {
            token: tokenContract1.address,
            amount: 5,
        }

        await contract.setRewards(addr1.address, [reward]);

        await expect(contract.connect(addr1).withdraw(tokenContract1.address)).to.emit(contract, 'WithdrawReward')
    });

    it('Require fee collector to have enough fees collected to transfer', async function () {
        const reward = {
            token: tokenContract3.address,
            amount: 5,
        }

        await contract.setRewards(addr1.address, [reward]);

        await expect(contract.connect(addr1).withdraw(tokenContract3.address)).to.be.reverted;
    });

    it('Withdraw single token', async function () {
        const reward = {
            token: tokenContract1.address,
            amount: 5,
        }

        const reward2 = {
            token: tokenContract2.address,
            amount: 27,
        }

        await contract.setRewards(addr1.address, [reward, reward2]);

        await contract.connect(addr1).withdraw(tokenContract1.address);

        const assignedRewards = await contract.getRewards(addr1.address);
        expect(assignedRewards[0][0].toString()).to.eq(reward2.token);
        expect(assignedRewards[0][1].toNumber()).to.eq(reward2.amount);
    });

    it('Withdraw multiple tokens', async function () {
        const reward = {
            token: tokenContract1.address,
            amount: 5,
        }

        const reward2 = {
            token: tokenContract2.address,
            amount: 27,
        }

        await contract.setRewards(addr1.address, [reward, reward2]);

        await contract.connect(addr1).withdrawBulk();

        const contractRewards = await contract.getRewards(addr1.address);
        expect(contractRewards.length).to.equal(0);
    });
});