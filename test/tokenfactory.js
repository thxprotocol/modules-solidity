const { expect } = require('chai');
const { createTokenFactory, limitedSupplyTokenContract, unlimitedSupplyTokenContract } = require('./utils');

describe('Unlimited Token factory', function () {
    let factory, owner, receiver;

    before(async function () {
        [owner, receiver] = await ethers.getSigners();
        factory = await createTokenFactory();
    });

    it('Limited Supply', async function () {
        const tokenContract = await limitedSupplyTokenContract(
            factory.deployLimitedSupplyToken('Test Token', 'TST', await owner.getAddress(), 1000),
        );

        expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(1000);
        expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
        expect(await tokenContract.totalSupply()).to.eq(1000);
        expect(await tokenContract.symbol()).to.eq('TST');
        expect(await tokenContract.name()).to.eq('Test Token');
    });

    it('unlimited Supply', async function () {
        const tokenContract = await unlimitedSupplyTokenContract(
            factory.deployUnlimitedSupplyToken('Test Token', 'TST', await owner.getAddress()),
        );

        expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(0);
        expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
        expect(await tokenContract.totalSupply()).to.eq(0);
        expect(await tokenContract.symbol()).to.eq('TST');
        expect(await tokenContract.name()).to.eq('Test Token');
    });
});
