const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { diamond, assetPool, getDiamondCuts } = require('./utils.js');

const onePercent = ethers.BigNumber.from('10').pow(16);

describe('04 token', function () {
    let owner;
    let token, factory, registry, diamondCuts;

    before(async function () {
        [owner, collector] = await ethers.getSigners();
        const PoolRegistry = await ethers.getContractFactory('PoolRegistry');
        registry = await PoolRegistry.deploy(await collector.getAddress(), onePercent);
        factory = await diamond();
        diamondCuts = await getDiamondCuts([
            'MemberAccess',
            'Token',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);

        token = await assetPool(factory.deployAssetPool(diamondCuts, registry.address));
        const ExampleToken = await ethers.getContractFactory('ExampleToken');
        erc20 = await ExampleToken.deploy(await owner.getAddress(), parseEther('1000000'));
    });
    it('Test token', async function () {
        expect(await token.getToken()).to.eq(constants.AddressZero);
        expect(await token.addToken(erc20.address));
        expect(await token.getToken()).to.eq(erc20.address);
    });
    it('Test registry', async function () {
        expect(await token.getPoolRegistry()).to.eq(registry.address);
    });
    it('Test deposit', async function () {
        expect(await token.getBalance()).to.eq(0);
        expect(await erc20.balanceOf(await collector.getAddress())).to.eq(0);
        expect(await erc20.balanceOf(token.address)).to.eq(0);

        await erc20.approve(token.address, constants.MaxUint256);
        await token.deposit(parseEther('100'));

        expect(await token.getBalance()).to.eq(parseEther('99'));
        expect(await erc20.balanceOf(await collector.getAddress())).to.eq(parseEther('1'));
        expect(await erc20.balanceOf(token.address)).to.eq(parseEther('99'));
    });
});
