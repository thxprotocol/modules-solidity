const { expect } = require('chai');
const { parseEther, parseUnits, formatEther } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { diamond, assetPool } = require('./utils.js');
const { MerkleTree } = require('./merkleTree');
const { soliditySha3 } = require('web3-utils');

const onePercent = ethers.BigNumber.from('10').pow(16);

describe('04 token', function () {
    let owner;
    let token;
    let thx;
    let collector;

    before(async function () {
        [owner, claimer] = await ethers.getSigners();
        const MemberAccess = await ethers.getContractFactory('MemberAccess');
        const Token = await ethers.getContractFactory('Token');
        const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
        const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet');
        const OwnershipFacet = await ethers.getContractFactory('OwnershipFacet');

        const factory = await diamond([MemberAccess, Token, DiamondCutFacet, DiamondLoupeFacet, OwnershipFacet]);
        const ExampleToken = await ethers.getContractFactory('ExampleToken');
        const THXToken = await ethers.getContractFactory('TokenLimitedSupply');
        const MockUniswapV2Router02 = await ethers.getContractFactory('MockUniswapV2Router02');

        thx = await THXToken.deploy('THX Network', 'THX', await owner.getAddress(), parseEther('1000'));
        erc20 = await ExampleToken.deploy(await owner.getAddress(), parseEther('100000000'));

        token = await assetPool(factory.deployAssetPool());
        collector = await ethers.getContractAt('MockFeeCollectorFacet', factory.address);
        router = await MockUniswapV2Router02.deploy();

        await thx.transfer(router.address, parseEther('100')); // Mock liquidity
        await collector.initializeCollector(factory.address, thx.address);
        await collector.setUniswapV2Router02(router.address);
    });
    it('Test token', async function () {
        expect(await token.getToken()).to.eq(constants.AddressZero);
        expect(await token.addToken(erc20.address));
        expect(await token.getToken()).to.eq(erc20.address);
    });
    it('Test collector', async function () {
        expect(await collector.getTotalFeeForToken(erc20.address)).to.eq(0);
    });
    it('Test registry', async function () {
        const PoolRegistry = await ethers.getContractFactory('PoolRegistry');
        const registry = await PoolRegistry.deploy(collector.address, onePercent);

        expect(await token.getPoolRegistry()).to.eq(constants.AddressZero);
        expect(await token.setPoolRegistry(registry.address));
        expect(await token.getPoolRegistry()).to.eq(registry.address);
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

        await token.deposit(parseEther('100'));

        expect(await erc20.balanceOf(collector.address)).to.eq(parseEther('2'));
    });
    it('Test swap', async function () {
        const deadline = Math.floor(new Date().getTime() / 1000) + 3600;
        const totalFeeForToken = await collector.getTotalFeeForToken(erc20.address);

        expect(totalFeeForToken).to.eq(parseEther('2'));
        expect(await thx.balanceOf(collector.address)).to.eq(0);
        expect(collector.swapExactTokensForTHX([erc20.address, thx.address], parseEther('2'), deadline))
            .to.emit(collector, 'FeeSwapped')
            .withArgs(erc20.address, totalFeeForToken);
        expect(await collector.getTotalFeeForToken(erc20.address)).to.eq(0);
        expect(await thx.balanceOf(collector.address)).to.eq(parseEther('2'));
    });

    describe('04.1 Test claim', async () => {
        const WEEK = 1;
        let redeem, merkleTree, elements, claimBalance;

        before(async () => {
            redeem = await ethers.getContractAt('MerkleRedeem', await collector.getRedeem());

            // Give the claimer a share of tokens
            await thx.transfer(await claimer.getAddress(), parseEther('100'));

            const ratio = (await thx.balanceOf(await claimer.getAddress())) / (await thx.totalSupply());
            const claimBalanceDecimal = formatEther(await thx.balanceOf(collector.address)) * ratio;

            claimBalance = parseUnits(parseEther(claimBalanceDecimal.toString()).toString(), 'wei').toString();
            elements = [soliditySha3(await claimer.getAddress(), claimBalance)];
            merkleTree = new MerkleTree(elements);
        });

        it('store allocation', async function () {
            const root = merkleTree.getHexRoot();

            await collector.seedAllocations(WEEK, root, await thx.balanceOf(collector.address));

            const proof = merkleTree.getHexProof(elements[0]);

            expect(await redeem.verifyClaim(await claimer.getAddress(), WEEK, claimBalance, proof)).to.eq(true);
        });

        it('claim allocation', async function () {
            const proof = merkleTree.getHexProof(elements[0]);

            expect(redeem.claimWeek(await claimer.getAddress(), WEEK, claimBalance, proof))
                .to.emit(redeem, 'Claimed')
                .withArgs(await claimer.getAddress(), claimBalance);

            expect(await thx.balanceOf(await claimer.getAddress())).to.eq(parseEther('100.2'));
            expect(await redeem.claimed(WEEK, await claimer.getAddress())).to.eq(true);
            expect(await thx.balanceOf(redeem.address)).to.eq(parseEther('1.8'));
        });
    });
});
