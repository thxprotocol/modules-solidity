const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { diamond, assetPool, MEMBER_ROLE, MANAGER_ROLE, ADMIN_ROLE } = require('./utils.js');

describe('03 member access', function () {
    let owner;
    let voter;
    let memberAccess;

    before(async function () {
        [owner, voter] = await ethers.getSigners();
        const MemberAccess = await ethers.getContractFactory('MemberAccess');
        const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
        const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet');
        const OwnershipFacet = await ethers.getContractFactory('OwnershipFacet');

        const factory = await diamond([MemberAccess, DiamondCutFacet, DiamondLoupeFacet, OwnershipFacet]);
        memberAccess = await assetPool(factory.deployAssetPool());
    });
    it('Initial state', async function () {
        expect(await memberAccess.isMember(await owner.getAddress())).to.eq(true);
        expect(await memberAccess.isManager(await owner.getAddress())).to.eq(true);
        expect(await memberAccess.getOwner()).to.eq(await owner.getAddress());
    });
    it('Initial state admin', async function () {
        expect(await memberAccess.isManagerRoleAdmin(await owner.getAddress())).to.eq(true);
        expect(await memberAccess.isMemberRoleAdmin(await owner.getAddress())).to.eq(true);

        expect(await memberAccess.isManagerRoleAdmin(await voter.getAddress())).to.eq(false);
        expect(await memberAccess.isMemberRoleAdmin(await voter.getAddress())).to.eq(false);
    });
    it('Member ID', async function () {
        expect(await memberAccess.getMemberByAddress(await owner.getAddress())).to.eq(1001);
        expect(await memberAccess.getAddressByMember(1001)).to.eq(await owner.getAddress());
    });
    it('Add member', async function () {
        expect(await memberAccess.isMember(await voter.getAddress())).to.eq(false);
        expect(await memberAccess.getMemberByAddress(await voter.getAddress())).to.eq(0);
        expect(await memberAccess.getAddressByMember(0)).to.eq(constants.AddressZero);

        await memberAccess.addMember(await voter.getAddress());

        expect(await memberAccess.isMember(await voter.getAddress())).to.eq(true);
        expect(await memberAccess.getMemberByAddress(await voter.getAddress())).to.eq(1002);
        expect(await memberAccess.getAddressByMember(1002)).to.eq(await voter.getAddress());
    });
    it('Add manager', async function () {
        expect(await memberAccess.isManager(await voter.getAddress())).to.eq(false);

        await memberAccess.addManager(await voter.getAddress());

        expect(await memberAccess.isManager(await voter.getAddress())).to.eq(true);
        expect(await memberAccess.getMemberByAddress(await voter.getAddress())).to.eq(1002);
        expect(await memberAccess.getAddressByMember(1002)).to.eq(await voter.getAddress());
    });
    it('Remove manager', async function () {
        await memberAccess.removeManager(await voter.getAddress());

        expect(await memberAccess.isManager(await voter.getAddress())).to.eq(false);
        expect(await memberAccess.getMemberByAddress(await voter.getAddress())).to.eq(1002);
        expect(await memberAccess.getAddressByMember(1002)).to.eq(await voter.getAddress());
    });
    it('Remove member', async function () {
        await memberAccess.removeMember(await voter.getAddress());

        expect(await memberAccess.isMember(await voter.getAddress())).to.eq(false);
        expect(await memberAccess.getMemberByAddress(await voter.getAddress())).to.eq(1002);
        expect(await memberAccess.getAddressByMember(1002)).to.eq(await voter.getAddress());
    });
    it('Upgrade address', async function () {
        expect(await memberAccess.getAddressByMember(1001)).to.eq(await owner.getAddress());
        expect(await memberAccess.upgradeAddress(await owner.getAddress(), await voter.getAddress()));
        expect(await memberAccess.getAddressByMember(1001)).to.eq(await voter.getAddress());
        expect(await memberAccess.isMember(await voter.getAddress())).to.eq(true);
        expect(await memberAccess.isManager(await voter.getAddress())).to.eq(true);
        // owner role is not transferred
        expect(await memberAccess.getOwner()).to.eq(await owner.getAddress());
    });
});
