const { constants } = require('ethers');
const { diamond, assetPool, getDiamondCuts } = require('./utils.js');

describe('Pool', function () {
    describe('03 member access', function () {
        let owner;
        let voter;
        let memberAccess;

        before(async function () {
            [owner, voter] = await ethers.getSigners();
            const factory = await diamond();
            const diamondCuts = await getDiamondCuts([
                'MemberAccess',
                'DiamondCutFacet',
                'DiamondLoupeFacet',
                'OwnershipFacet',
            ]);

            memberAccess = await assetPool(factory.deployAssetPool(diamondCuts, constants.AddressZero));
        });
    });
});
