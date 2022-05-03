const { expect } = require('chai');
const e = require('express');
const { ethers } = require('hardhat');
const { limitedSupplyTokenContract, unlimitedSupplyTokenContract, createTokenFactory } = require('./utils');

describe.only('TimeLockController', function () {
    let owner, thxToken, timelockcontroller;

    before(async function () {
        [admin, user] = await ethers.getSigners();
        factory = await createTokenFactory();

        thxToken = await limitedSupplyTokenContract(
            factory.deployLimitedSupplyToken('THX Token', 'THX', await admin.getAddress(), 1000),
        );

        const stThxToken = await unlimitedSupplyTokenContract(
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

        await stThxToken.addMinter(stThxToken.address);
    });

    it('Should be able to stake THX', async function () {
        await thxToken.approve(timelockcontroller.address, 1000);
        await expect(timelockcontroller.deposit(1000, 1)).to.emit(timelockcontroller, 'Staked');
    });
});
