const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { helpSign, diamond, assetPool, MEMBER_ROLE, MANAGER_ROLE, ADMIN_ROLE } = require('./utils.js');

const onePercent = ethers.BigNumber.from('10').pow(16);

describe('04 token', function () {
    let owner;
    let voter;
    let token;

    before(async function () {
        [owner, voter, collector] = await ethers.getSigners();
        const MemberAccess = await ethers.getContractFactory('MemberAccess');
        const Token = await ethers.getContractFactory('Token');
        const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
        const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet');
        const OwnershipFacet = await ethers.getContractFactory('OwnershipFacet');
        const GasStationFacet = await ethers.getContractFactory('GasStationFacet');

        const factory = await diamond([
            MemberAccess,
            Token,
            DiamondCutFacet,
            DiamondLoupeFacet,
            OwnershipFacet,
            GasStationFacet,
        ]);
        const ExampleToken = await ethers.getContractFactory('ExampleToken');

        erc20 = await ExampleToken.deploy(await owner.getAddress(), parseEther('1000000'));
        token = await assetPool(factory.deployAssetPool());
        await token.initializeGasStation(await owner.getAddress());
        await token.setSigning(true);
    });
    it('Test token', async function () {
        expect(await token.getToken()).to.eq(constants.AddressZero);
        expect(await token.addToken(erc20.address));
        expect(await token.getToken()).to.eq(erc20.address);
    });
    it('Test registry', async function () {
        const PoolRegistry = await ethers.getContractFactory('PoolRegistry');
        let poolRegistry = await PoolRegistry.deploy(await collector.getAddress(), onePercent);

        expect(await token.getPoolRegistry()).to.eq(constants.AddressZero);
        expect(await token.setPoolRegistry(poolRegistry.address));
        expect(await token.getPoolRegistry()).to.eq(poolRegistry.address);
    });
    it('Test deposit', async function () {
        expect(await token.getBalance()).to.eq(0);
        expect(await erc20.balanceOf(await collector.getAddress())).to.eq(0);
        expect(await erc20.balanceOf(token.address)).to.eq(0);

        await erc20.approve(token.address, constants.MaxUint256);

        const tx = await helpSign(token, 'deposit', [parseEther('100')], owner);
        expect(tx.events.find((ev) => ev.event === 'Result').args.success).to.eq(true);

        expect(await token.getBalance()).to.eq(parseEther('99'));
        expect(await erc20.balanceOf(await collector.getAddress())).to.eq(parseEther('1'));
        expect(await erc20.balanceOf(token.address)).to.eq(parseEther('99'));
    });
});
