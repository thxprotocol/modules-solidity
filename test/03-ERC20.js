const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { getDiamondCuts, deployPoolRegistry, deployDefaultPool } = require('./utils.js');

const onePercent = ethers.BigNumber.from('10').pow(16);

describe('ERC20Facet', function () {
    let owner, voter;
    let token, token2, registry, diamondCuts;

    before(async function () {
        [owner, collector, recipient, voter] = await ethers.getSigners();
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

        const ExampleToken2 = await ethers.getContractFactory('ExampleToken');
        erc202 = await ExampleToken2.deploy(await voter.getAddress(), parseEther('1000000'));
        token2 = await deployDefaultPool(diamondCuts, registry.address, erc202.address);
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
        await expect(token.topup(parseEther('100'))).to.emit(token, 'Topup');

        expect(await token.getBalance()).to.eq(parseEther('100'));
        expect(await erc20.balanceOf(token.address)).to.eq(parseEther('100'));
    });
    it('Test deposit', async function () {
        expect(await erc20.balanceOf(await collector.getAddress())).to.eq(0);

        await erc20.approve(token.address, constants.MaxUint256);
        await expect(token.deposit(parseEther('100'))).to.emit(token, 'DepositFeeCollected');

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
    it('Test set swap rule', async function () {
        const multiplier = 10;
        expect(await token.setSwapRule(erc202.address, multiplier)).to.emit(registry, 'SwapRuleUpdated');
        expect(await token.getSwapRule(erc202.address)).to.eq(multiplier);
    });
    it('Test swap', async function () {
        // Approvals
        await erc20.approve(token.address, constants.MaxUint256);
        await erc202.connect(voter).approve(token.address, constants.MaxUint256);

        // Alice configures an 1:10 token2 swap in her pool
        const multiplier = 10;
        expect(await token.setSwapRule(erc202.address, multiplier)).to.emit(registry, 'SwapRuleUpdated');

        // Bob swaps 10 token in Alice her pool
        const amountIn = parseEther('10');
        expect(await erc202.balanceOf(await voter.address)).to.eq(parseEther('1000000'));
        expect(await erc202.balanceOf(await registry.feeCollector())).to.eq(parseEther('0'));
        expect(await token.connect(voter).swap(amountIn, erc202.address)).to.emit(registry, 'Swap');
        expect(await erc202.balanceOf(await voter.address)).to.eq(parseEther('999990'));

        // Bob receives 100 token from the pools
        expect(await erc20.balanceOf(voter.address)).to.eq(parseEther('100'));

        // The pool receives 9.9 ABC from Bob
        expect(await erc202.balanceOf(await token.address)).to.eq(parseEther('9.9'));

        //The FeeCollector receives 0.1 token2 from the pool (1%)
        expect(await erc202.balanceOf(await registry.feeCollector())).to.eq(parseEther('0.1'));
    });
});
