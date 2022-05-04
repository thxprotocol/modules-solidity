const { expect } = require('chai');
const { constants } = require('ethers');
const { diamond, assetPool, getDiamondCuts, createPoolRegistry } = require('./utils.js');

const diamondTest = async () => {
    factoryFacets = [
        await ethers.getContractFactory('AssetPoolFactoryFacet'),
        await ethers.getContractFactory('OwnershipFacet'),
    ];
    diamondCutFactory = [];
    for (let i = 0; i < factoryFacets.length; i++) {
        const f = await factoryFacets[i].deploy();
        diamondCutFactory.push({
            action: FacetCutAction.Add,
            facetAddress: f.address,
            functionSelectors: getSelectors(f),
        });
    }

    [owner] = await ethers.getSigners();
    const Diamond = await ethers.getContractFactory('Diamond');
    const diamond = await Diamond.deploy(diamondCutFactory, [await owner.getAddress()]);
    factory = await ethers.getContractAt('IDefaultFactory', diamond.address);
    await factory.setDefaultController(await owner.getAddress());

    return factory;
};

describe('08 minter access', function () {
    let owner;
    let voter;
    let minterAccess;

    before(async function () {
        [owner, voter, collector] = await ethers.getSigners();
        const registry = await createPoolRegistry(await collector.getAddress(), 0);
        const factory = await diamond();
        const diamondCuts = await getDiamondCuts([
            'MinterAccess',
            'UnlimitedSupplyToken',
            'DiamondCutFacet',
            'DiamondLoupeFacet'
        ]);
        minterAccess = await assetPool(factory.deployAssetPool(diamondCuts, registry.address));
    });
    it('Initial state', async function () {
        expect(await minterAccess.isMinter(await owner.getAddress())).to.eq(true);
        expect(await minterAccess.getOwner()).to.eq(await owner.getAddress());
    });
    it('Initial state admin', async function () {
        expect(await minterAccess.isMinterRoleAdmin(await owner.getAddress())).to.eq(true);
        expect(await minterAccess.isMinterRoleAdmin(await voter.getAddress())).to.eq(false);
    });
    it('Minter ID', async function () {
        expect(await minterAccess.getMinterByAddress(await owner.getAddress())).to.eq(1001);
        expect(await minterAccess.getAddressByMinter(1001)).to.eq(await owner.getAddress());
    });
    it('Add minter', async function () {
        expect(await minterAccess.isMinter(await voter.getAddress())).to.eq(false);
        expect(await minterAccess.getMinterByAddress(await voter.getAddress())).to.eq(0);
        expect(await minterAccess.getAddressByMinter(0)).to.eq(constants.AddressZero);

        await minterAccess.addMinter(await voter.getAddress());

        expect(await minterAccess.isMinter(await voter.getAddress())).to.eq(true);
        expect(await minterAccess.getMinterByAddress(await voter.getAddress())).to.eq(1002);
        expect(await minterAccess.getAddressByMinter(1002)).to.eq(await voter.getAddress());
    });

    it('Remove minter', async function () {
        await minterAccess.removeMinter(await voter.getAddress());

        expect(await minterAccess.isMinter(await voter.getAddress())).to.eq(false);
        expect(await minterAccess.getMinterByAddress(await voter.getAddress())).to.eq(1002);
        expect(await minterAccess.getAddressByMinter(1002)).to.eq(await voter.getAddress());
    });
    it('Upgrade address', async function () {
        expect(await minterAccess.getAddressByMinter(1001)).to.eq(await owner.getAddress());
        expect(await minterAccess.upgradeAddress(await owner.getAddress(), await voter.getAddress()));
        expect(await minterAccess.getAddressByMinter(1001)).to.eq(await voter.getAddress());
        expect(await minterAccess.isMinter(await voter.getAddress())).to.eq(true);
        // owner role is not transferred
        expect(await minterAccess.getOwner()).to.eq(await owner.getAddress());
    });
});
