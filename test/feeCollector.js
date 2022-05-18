const { expect } = require('chai');
const e = require('express');
const { constants } = require('ethers');
const { ethers } = require('hardhat');
const { limitedSupplyTokenContract, unlimitedSupplyTokenContract, createTokenFactory } = require('./utils');

describe.only('TimeLockController', function () {
    let owner, thxToken, stThxToken, timelockcontroller;

    before(async function () {
        [admin, user] = await ethers.getSigners();
        factory = await createTokenFactory();

        thxToken = await limitedSupplyTokenContract(
            factory.deployLimitedSupplyToken('THX Token', 'THX', await admin.getAddress(), 10000),
        );

        stThxToken = await unlimitedSupplyTokenContract(
            factory.deployUnlimitedSupplyToken(
                'Stake THX Token',
                'stTHX',
                [await admin.getAddress()],
                await admin.getAddress(),
            ),
        );

        const tlcFactory = await ethers.getContractFactory('TokenTimeLock');

        timelockcontroller = await tlcFactory.deploy(stThxToken.address, thxToken.address);
        await timelockcontroller.deployed();
    
        await stThxToken.addMinter(timelockcontroller.address);

        RewardTOken1 = await limitedSupplyTokenContract(
            factory.deployLimitedSupplyToken('ExampleToken1', 'THX1', timelockcontroller.address, 100000),
        );

        RewardTOken2 = await limitedSupplyTokenContract(
            factory.deployLimitedSupplyToken('ExampleToken2', 'THX2', timelockcontroller.address, 200000),
        );
        
        RewardTOken3 = await limitedSupplyTokenContract(
            factory.deployLimitedSupplyToken('ExampleToken3', 'THX3', timelockcontroller.address, 300000),
        );

        RewardTOken4 = await limitedSupplyTokenContract(
            factory.deployLimitedSupplyToken('ExampleToken4', 'THX4', timelockcontroller.address, 400000),
        );

        await timelockcontroller.addexampleTokens(RewardTOken1.address, RewardTOken2.address, RewardTOken3.address, RewardTOken4.address);
        await timelockcontroller.allocate(admin.getAddress(), RewardTOken1.address, 50000);
        
    });

    it('Should be able to stake THX and stakes more than 10 thx', async function () {
        await thxToken.approve(timelockcontroller.address, constants.MaxUint256);
        await expect(timelockcontroller.deposit(2000, 1)).to.emit(timelockcontroller, 'Staked');
    });
    it('Check if users balance is lowered after staking', async function () {
        let test = await thxToken.balanceOf(admin.getAddress());
        expect(test).to.equal(8000);
    });

    it('Check if contract balance is the expected amount of rewardtoken1', async function () {
        let test01 = await RewardTOken1.balanceOf(timelockcontroller.address);
        expect(test01).to.equal(100000);
    });

    it('Check if contract balance is the expected amount of rewardtoken2', async function () {
        let test02 = await RewardTOken2.balanceOf(timelockcontroller.address);
        expect(test02).to.equal(200000);
    });
    it('Check if contract balance is the expected amount of rewardtoken3', async function () {
        let test03 = await RewardTOken3.balanceOf(timelockcontroller.address);
        expect(test03).to.equal(300000);
    });
    it('Check if contract balance is the expected amount of rewardtoken4', async function () {
        let test04 = await RewardTOken4.balanceOf(timelockcontroller.address);
        expect(test04).to.equal(400000);
    });
    it('Check if user receives staked thx', async function () {
        let test2 = await stThxToken.balanceOf(admin.getAddress());
        expect(test2).to.equal(2000);
    });
    it('Check if contract staked thx balance equals 0', async function () {
        let test3 = await stThxToken.balanceOf(timelockcontroller.address);
        expect(test3).to.equal(0);
    });
    it('Check if user can withdraw', async function () {
        await expect(timelockcontroller.withdraw()).to.emit(timelockcontroller, 'Withdrawn');
    });
    it('Check if user thx balance equals 10000 after withdrawing', async function () {
        let test4 = await thxToken.balanceOf(admin.getAddress());
        expect(test4).to.equal(10000);
    });
    it('Check if user staked thx balance equals 0 after withdrawing', async function () {
        let test5 = await stThxToken.balanceOf(admin.getAddress());
        expect(test5).to.equal(0);
    });
    it('Check if user received allocated reward1', async function () {
        let test6 = await RewardTOken1.balanceOf(admin.getAddress());
        expect(test6).to.equal(50000);
    });
});
