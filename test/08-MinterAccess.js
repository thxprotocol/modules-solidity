const { expect } = require('chai');
const { constants } = require('ethers');
const { getFacetCut } = require('./utils.js');

describe.only('08 minter access', function () {
    let owner;
    let voter;
    let minterAccess;

    before(async function () {
        [owner, voter, collector] = await ethers.getSigners();

        const minterAccessFactory = await ethers.getContractFactory('MinterAccess');
        const ustFactory = await ethers.getContractFactory('UnlimitedSupplyToken');

        diamondCut = [];
        diamondCut.push(getFacetCut(await minterAccessFactory.deploy()));
        diamondCut.push(
            getFacetCut(
                await ustFactory.deploy('Test Token', 'TTT', [await owner.getAddress()], await owner.getAddress()),
            ),
        );

        const diamondFactory = await ethers.getContractFactory('Diamond');
        minterAccess = await diamondFactory.deploy(diamondCut, [await owner.getAddress()]);
        minterAccess = await ethers.getContractAt('IMinterAccess', minterAccess.address);
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
