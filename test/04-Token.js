const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { diamond, assetPool, MEMBER_ROLE, MANAGER_ROLE, ADMIN_ROLE } = require('./utils.js');

const onePercent = ethers.BigNumber.from('10').pow(16);

async function addLiquidity(pair, token0, token1, token0Amount, token1Amount, to) {
    await token0.transfer(pair.address, token0Amount);
    await token1.transfer(pair.address, token1Amount);
    await pair.mint(to); // TODO Figure out what needs to happen here...
}

describe('04 token', function () {
    let owner;
    let voter;
    let token;
    let thx;
    let weth;
    let collector;

    before(async function () {
        [owner, voter] = await ethers.getSigners();
        const MemberAccess = await ethers.getContractFactory('MemberAccess');
        const Token = await ethers.getContractFactory('Token');
        const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
        const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet');
        const OwnershipFacet = await ethers.getContractFactory('OwnershipFacet');

        const factory = await diamond([MemberAccess, Token, DiamondCutFacet, DiamondLoupeFacet, OwnershipFacet]);
        const ExampleToken = await ethers.getContractFactory('ExampleToken');
        const THXToken = await ethers.getContractFactory('TokenLimitedSupply');
        const WETHToken = await ethers.getContractFactory('TokenLimitedSupply');
        const MockUniswapV2Factory = await ethers.getContractFactory('MockUniswapV2Factory');
        const MockUniswapV2Router02 = await ethers.getContractFactory('MockUniswapV2Router02');

        erc20 = await ExampleToken.deploy(await owner.getAddress(), parseEther('1000000'));
        token = await assetPool(factory.deployAssetPool());

        collector = await ethers.getContractAt('MockFeeCollectorFacet', factory.address);

        thx = await THXToken.deploy('THX Network', 'THX', await owner.getAddress(), parseEther('1000000'));
        weth = await WETHToken.deploy('Wrapped Ether', 'WETH', await owner.getAddress(), parseEther('1000000'));

        uniswapV2Factory = await MockUniswapV2Factory.deploy();
        await uniswapV2Factory.initialize(erc20.address, weth.address, thx.address);
        uniswapV2Router02 = await MockUniswapV2Router02.deploy();

        // Provide liquidity
        const pair1Address = await uniswapV2Factory.getPair(erc20.address, weth.address);
        const pair2Address = await uniswapV2Factory.getPair(weth.address, thx.address);

        const pair1 = await ethers.getContractAt('MockUniswapV2Pair', pair1Address);
        const pair2 = await ethers.getContractAt('MockUniswapV2Pair', pair2Address);

        await addLiquidity(pair1, erc20, weth, parseEther('5'), parseEther('5'), await owner.getAddress());
        await addLiquidity(pair2, weth, thx, parseEther('5'), parseEther('5'), await owner.getAddress());

        await collector.initializeCollector(factory.address, thx.address);
        await collector.setUniswapV2Factory(uniswapV2Factory.address);
        await collector.setUniswapV2Router02(uniswapV2Router02.address);
        await collector.setWETH(weth.address);
    });
    it('Test token', async function () {
        expect(await token.getToken()).to.eq(constants.AddressZero);
        expect(await token.addToken(erc20.address));
        expect(await token.getToken()).to.eq(erc20.address);
    });
    it('Test collector', async function () {});
    it('Test registry', async function () {
        const PoolRegistry = await ethers.getContractFactory('PoolRegistry');
        let poolRegistry = await PoolRegistry.deploy(collector.address, onePercent);

        expect(await token.getPoolRegistry()).to.eq(constants.AddressZero);
        expect(await token.setPoolRegistry(poolRegistry.address));
        expect(await token.getPoolRegistry()).to.eq(poolRegistry.address);
    });
    it('Test deposit', async function () {
        expect(await token.getBalance()).to.eq(0);
        expect(await erc20.balanceOf(collector.address)).to.eq(0);
        expect(await erc20.balanceOf(token.address)).to.eq(0);

        await erc20.approve(token.address, constants.MaxUint256);
        await token.deposit(parseEther('100'));

        expect(await token.getBalance()).to.eq(parseEther('99'));
        expect(await erc20.balanceOf(collector.address)).to.eq(parseEther('1'));
        expect(await erc20.balanceOf(token.address)).to.eq(parseEther('99'));
    });

    it('Test swap', async function () {
        await token.deposit(parseEther('100'));

        expect(await collector.getTotalFeeForToken(erc20.address)).to.eq(parseEther('2'));

        // TODO Figure out the correct params for this call and fix the liquidity problem
        const r = await collector.swapExactTokensForTHX(
            erc20.address,
            parseEther('0'),
            Math.floor(new Date().getTime() / 1000) + 3600,
        );
        console.log(r);
        // TODO Check collector fee mapping
        // TODO Call swapExactTokensForTHX
        // TODO Check balances
    });
});
