const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const {
    deployDefaultPool,
    MEMBER_ROLE,
    MANAGER_ROLE,
    ADMIN_ROLE,
    getDiamondCuts,
    deployPoolRegistry,
} = require('./utils.js');

describe('AccessControlFacet', function () {
    let owner;
    let voter;
    let accessControl;

    before(async function () {
        [owner, voter, collector] = await ethers.getSigners();
        const registry = await deployPoolRegistry(await collector.getAddress(), 0);
        const diamondCuts = await getDiamondCuts([
            'MemberAccessFacet',
            'MockSetup',
            'ERC20Facet',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);
        const ExampleToken = await ethers.getContractFactory('ExampleToken');

        erc20 = await ExampleToken.deploy(await owner.getAddress(), parseEther('1000000'));
        accessControl = await deployDefaultPool(diamondCuts, registry.address, erc20.address);

        await accessControl.setupMockAccess(
            [MEMBER_ROLE, MANAGER_ROLE, ADMIN_ROLE],
            [await owner.getAddress(), await owner.getAddress(), await owner.getAddress()],
        );
    });
    it('Initial state', async function () {
        expect(await accessControl.hasRole(MEMBER_ROLE, await owner.getAddress())).to.eq(true);
        expect(await accessControl.hasRole(MANAGER_ROLE, await owner.getAddress())).to.eq(true);
        expect(await accessControl.hasRole(ADMIN_ROLE, await owner.getAddress())).to.eq(true);
    });
    it('Test role', async function () {
        expect(await accessControl.hasRole(MEMBER_ROLE, await voter.getAddress())).to.eq(false);
        expect(await accessControl.getRoleMemberCount(MEMBER_ROLE)).to.eq(1);

        await accessControl.grantRole(MEMBER_ROLE, await voter.getAddress());

        expect(await accessControl.hasRole(MEMBER_ROLE, await voter.getAddress())).to.eq(true);
        expect(await accessControl.getRoleMemberCount(MEMBER_ROLE)).to.eq(2);
        expect(await accessControl.getRoleMember(MEMBER_ROLE, 1)).to.eq(await voter.getAddress());
    });
    it('Test renounceRole', async function () {
        await accessControl.connect(voter).renounceRole(MEMBER_ROLE, await voter.getAddress());
        expect(await accessControl.hasRole(MEMBER_ROLE, await voter.getAddress())).to.eq(false);
    });
    it('Test revokeRole', async function () {
        await accessControl.grantRole(MEMBER_ROLE, await voter.getAddress());

        await accessControl.revokeRole(MEMBER_ROLE, await voter.getAddress());
        expect(await accessControl.hasRole(MEMBER_ROLE, await voter.getAddress())).to.eq(false);
    });
    it('Test role admins', async function () {
        expect(await accessControl.getRoleAdmin(MEMBER_ROLE)).to.eq(ADMIN_ROLE);
        expect(await accessControl.getRoleAdmin(MANAGER_ROLE)).to.eq(ADMIN_ROLE);
        expect(await accessControl.getRoleAdmin(ADMIN_ROLE)).to.eq(ADMIN_ROLE);
    });
});
