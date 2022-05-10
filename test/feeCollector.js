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
    });

    it('Should be able to stake THX and stakes more than 10 thx', async function () {
        await thxToken.approve(timelockcontroller.address, constants.MaxUint256);
        await expect(timelockcontroller.deposit(2000, 1)).to.emit(timelockcontroller, 'Staked');
    });
    it('Check if users balance is lowered after staking', async function () {
        let test = await thxToken.balanceOf(admin.getAddress());
        expect(test).to.equal(8000);
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
});
