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
            factory.deployLimitedSupplyToken('THX Token', 'THX', await admin.getAddress(), 10000),
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

    it('Should be able to stake THX and stakes more than 10 thx', async function () {
        await thxToken.approve(timelockcontroller.address, 2000);
        await expect(timelockcontroller.deposit(2000, 1)).to.emit(timelockcontroller, 'Staked');
    });
    it('Check if users balance is lowered', async function () {
        let test = thxToken.balanceOf(admin.getAddress());
        test.then(function(result) {
            if (result == 8000){
                console.log("yes");
            } else {
                console.log("no");
            }
         })
    });
});
