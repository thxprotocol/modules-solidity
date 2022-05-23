const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { getDiamondCuts, deployPoolRegistry, deployDefaultPool } = require('./utils.js');

const onePercent = ethers.BigNumber.from('10').pow(16);

describe('ERC20Facet', function () {
    let owner;
    let token, registry, diamondCuts;

    before(async function () {
        [owner, collector, recipient] = await ethers.getSigners();
        registry = await deployPoolRegistry(await collector.getAddress(), onePercent);
        diamondCuts = await getDiamondCuts([
            'MemberAccessFacet',
            'ERC20Facet',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);

        const ExampleToken = await ethers.getContractFactory('ExampleToken');
        erc20 = await ExampleToken.deploy(await owner.getAddress(), parseEther('1000000'));
        token = await deployDefaultPool(diamondCuts, registry.address, erc20.address);
    });
    it('Test token', async function () {
        expect(await token.getERC20()).to.eq(erc20.address);
    });
    it('Test registry', async function () {
        expect(await token.getPoolRegistry()).to.eq(registry.address);
        expect(await registry.feePercentage()).to.eq(onePercent);
        expect(await registry.feeCollector()).to.eq(await collector.getAddress());
    });
    it('Test set registry', async function () {
        expect(await token.setPoolRegistry(registry.address)).to.emit(registry, 'RegistryUpdated');
    });
    it('Test top up', async function () {
        expect(await token.getBalance()).to.eq(0);
        expect(await erc20.balanceOf(token.address)).to.eq(0);

        await erc20.approve(token.address, constants.MaxUint256);
        await expect(erc20.transfer(token.address, parseEther('100'))).to.emit(erc20, 'Transfer');

        expect(await token.getBalance()).to.eq(parseEther('100'));
        expect(await erc20.balanceOf(token.address)).to.eq(parseEther('100'));
    });
    it('Test deposit', async function () {
        expect(await erc20.balanceOf(await collector.getAddress())).to.eq(0);

        await erc20.approve(token.address, constants.MaxUint256);
        await expect(token.pay(parseEther('100'))).to.emit(token, 'PaymentFeeCollected');

        expect(await token.getBalance()).to.eq(parseEther('199'));
        expect(await erc20.balanceOf(token.address)).to.eq(parseEther('199'));
        expect(await erc20.balanceOf(await collector.getAddress())).to.eq(parseEther('1'));
    });
    it('Test transfer to many', async function () {
        await expect(
            token.transferToMany([recipient.address, recipient.address], [parseEther('5'), parseEther('15')]),
        ).to.emit(token, 'TransferredTo');
        expect(await token.getBalance()).to.eq(parseEther('178.8'));
        expect(await erc20.balanceOf(token.address)).to.eq(parseEther('178.8'));
        expect(await erc20.balanceOf(recipient.address)).to.eq(parseEther('20'));
    });
});
