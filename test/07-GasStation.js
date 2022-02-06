const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { diamond, assetPool, helpSign } = require('./utils.js');

describe('07 GasStation', function () {
    let solution;

    let owner;
    let voter;

    before(async function () {
        [owner, voter] = await ethers.getSigners();
        const MemberAccess = await ethers.getContractFactory('MemberAccess');
        const BasePollProxy = await ethers.getContractFactory('BasePollProxy');
        const Reward = await ethers.getContractFactory('Reward');
        const RewardPoll = await ethers.getContractFactory('RewardPoll');
        const RewardPollProxy = await ethers.getContractFactory('RewardPollProxy');

        const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
        const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet');
        const OwnershipFacet = await ethers.getContractFactory('OwnershipFacet');
        const GasStationFacet = await ethers.getContractFactory('GasStationFacet');

        const factory = await diamond([
            MemberAccess,
            BasePollProxy,
            Reward,
            RewardPoll,
            RewardPollProxy,
            DiamondCutFacet,
            DiamondLoupeFacet,
            OwnershipFacet,
            GasStationFacet,
        ]);
        solution = await assetPool(factory.deployAssetPool());
        await solution.initializeGasStation(await owner.getAddress());
        await solution.setSigning(true);
    });
    describe('Signing enabled/disabled', async function () {
        it('Signing disabled', async function () {
            await solution.setSigning(false);
            await expect(helpSign(solution, 'setRewardPollDuration', [180], owner, 1)).to.be.revertedWith(
                'SIGNING_DISABLED',
            );
        });
        it('Signing enabled', async function () {
            await solution.setSigning(true);
            expect(await solution.getRewardPollDuration()).to.eq(0);
            await helpSign(solution, 'setRewardPollDuration', [180], owner);
            expect(await solution.getRewardPollDuration()).to.eq(180);
        });
        it('Not manager', async function () {
            // needed
            await solution.addMember(await voter.getAddress());
            const tx = await helpSign(solution, 'setRewardPollDuration', [180], voter);
            expect(tx.events[0].args.success).to.eq(false);
            expect(await solution.getGasStationAdmin()).to.eq(await owner.getAddress());
        });
        it('Wrong nonce', async function () {
            const call = solution.interface.encodeFunctionData('setRewardPollDuration', [180]);
            const hash = web3.utils.soliditySha3(call, 5);
            const sig = await owner.signMessage(ethers.utils.arrayify(hash));

            await expect(solution.call(call, 5, sig)).to.be.revertedWith('INVALID_NONCE');
        });
    });
    describe('Signing voting flow', async function () {
        before(async function () {
            [owner, voter] = await ethers.getSigners();
            const MemberAccess = await ethers.getContractFactory('MemberAccess');
            const BasePollProxy = await ethers.getContractFactory('BasePollProxy');
            const Reward = await ethers.getContractFactory('Reward');
            const RewardPoll = await ethers.getContractFactory('RewardPoll');
            const RewardPollProxy = await ethers.getContractFactory('RewardPollProxy');

            const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
            const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet');
            const OwnershipFacet = await ethers.getContractFactory('OwnershipFacet');
            const GasStationFacet = await ethers.getContractFactory('GasStationFacet');

            const factory = await diamond([
                MemberAccess,
                BasePollProxy,
                Reward,
                RewardPoll,
                RewardPollProxy,
                DiamondCutFacet,
                DiamondLoupeFacet,
                OwnershipFacet,
                GasStationFacet,
            ]);
            solution = await assetPool(factory.deployAssetPool());
            await solution.initializeGasStation(await owner.getAddress());
            await solution.setSigning(true);
            await solution.addMember(await voter.getAddress());
            await solution.setSigning(true);

            await solution.setRewardPollDuration(180);
        });
        it('Add reward, no access', async function () {
            const tx = await helpSign(solution, 'addReward', [parseEther('5'), 180], voter);
            expect(tx.events[0].args.success).to.eq(false);
        });
        it('Add reward', async function () {
            await helpSign(solution, 'addReward', [parseEther('5'), 180], owner);
        });
        it('Vote reward', async function () {
            await helpSign(solution, 'rewardPollVote', [1, true], owner);
        });
        it('Finalize reward', async function () {
            await ethers.provider.send('evm_increaseTime', [250]);
            await helpSign(solution, 'rewardPollFinalize', [1], owner);
        });
        it('Claim reward', async function () {
            tx = await helpSign(solution, 'claimRewardFor', [1, await voter.getAddress()], owner);
        });
        it('Vote withdraw', async function () {
            await helpSign(solution, 'withdrawPollVote', [2, true], owner);
        });
        it('Finalize withdraw', async function () {
            await ethers.provider.send('evm_increaseTime', [250]);
            await helpSign(solution, 'withdrawPollFinalize', [2], owner);
        });
    });
});
