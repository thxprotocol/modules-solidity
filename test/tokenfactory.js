const { expect } = require('chai');
const { tokenFactory, limitedSupplyToken, unlimitedSupplyToken } = require('./utils');

describe('Unlimited Token factory', function () {
    let factory, owner, receiver;

    before(async function () {
        [owner, receiver] = await ethers.getSigners();
        factory = await tokenFactory();
    });

    it('Limited Supply', async function () {
        const tokenContract = await limitedSupplyToken(
            factory.deployTokenLimitedSupply('Test Token', 'TST', await owner.getAddress(), 1000),
        );

        expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(1000);
        expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
        expect(await tokenContract.totalSupply()).to.eq(1000);
        expect(await tokenContract.symbol()).to.eq('TST');
        expect(await tokenContract.name()).to.eq('Test Token');
    });

    it('unlimited Supply', async function () {
        const tokenContract = await unlimitedSupplyToken(
            factory.deployTokenUnlimitedAccount('Test Token', 'TST', await owner.getAddress()),
        );

        expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(0);
        expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
        expect(await tokenContract.totalSupply()).to.eq(0);
        expect(await tokenContract.symbol()).to.eq('TST');
        expect(await tokenContract.name()).to.eq('Test Token');
    });
});
