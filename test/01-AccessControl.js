const { expect } = require('chai');
const { diamond, assetPool, MEMBER_ROLE, MANAGER_ROLE, ADMIN_ROLE } = require('./utils.js');

describe('01 Access Control', function () {
    let owner;
    let voter;
    let accessControl;

    before(async function () {
        [owner, voter] = await ethers.getSigners();
        const MemberAccess = await ethers.getContractFactory('MemberAccess');
        const AccessControl = await ethers.getContractFactory('MockSetup');
        const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
        const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet');
        const OwnershipFacet = await ethers.getContractFactory('OwnershipFacet');

        const factory = await diamond([
            MemberAccess,
            AccessControl,
            DiamondCutFacet,
            DiamondLoupeFacet,
            OwnershipFacet,
        ]);
        accessControl = await assetPool(factory.deployAssetPool());
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
