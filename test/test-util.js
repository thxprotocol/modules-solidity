const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { unlimitedSupplyTokenContract, createTokenFactory } = require('./utils');

describe('Unlimited Token', function () {
    let token;

    before(async function () {
        [owner, receiver] = await ethers.getSigners();

        const factory = await createTokenFactory();
        token = await unlimitedSupplyTokenContract(
            factory.deployUnlimitedSupplyToken('Test Token', 'TST', [], await owner.getAddress()),
        );
    });

    it('Cannot mint when not in minter list', async () => {
        try {
            await token.transfer(await receiver.getAddress(), parseEther('1000'));
        } catch (e) {
            expect(e.message).to.equal(
                "VM Exception while processing transaction: reverted with reason string 'ERC20: transfer amount exceeds balance'",
            );
        }
    });

    it('Admin able to add new address to minter list', async () => {
        const recept = await token.connect(owner).setMinter(await owner.getAddress());
        expect(recept).to.not.be.undefined;
    });

    it('Non-admin not able to add new address to minter list', async () => {
        try {
            await token.setMinter(await owner.getAddress());
        } catch (e) {
            expect(e).to.not.be.undefined;
        }
    });

    it('Initial state', async function () {
        expect(await token.balanceOf(await owner.getAddress())).to.eq(0);
        expect(await token.balanceOf(await receiver.getAddress())).to.eq(0);
    });
    it('Send', async function () {
        await token.transfer(await receiver.getAddress(), parseEther('1000'));
        expect(await token.balanceOf(await owner.getAddress())).to.eq(0);
        expect(await token.balanceOf(await receiver.getAddress())).to.eq(parseEther('1000'));
    });
    it('Return', async function () {
        await token.connect(receiver).transfer(await owner.getAddress(), parseEther('1000'));
        expect(await token.balanceOf(await owner.getAddress())).to.eq(parseEther('1000'));
        expect(await token.balanceOf(await receiver.getAddress())).to.eq(0);
    });
    it('Resend', async function () {
        await token.transfer(await receiver.getAddress(), parseEther('1000'));
        expect(await token.balanceOf(await owner.getAddress())).to.eq(parseEther('1000'));
        expect(await token.balanceOf(await receiver.getAddress())).to.eq(parseEther('1000'));
    });
});
