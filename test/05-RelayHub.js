const { expect } = require('chai');
const { diamond, assetPool, helpSign, hex2a, getDiamondCuts, createPoolRegistry } = require('./utils.js');

describe('RelayHubFacet', function () {
    let solution, registry, factory, owner, voter;

    before(async function () {
        [owner, voter, collector] = await ethers.getSigners();
        factory = await diamond();
        const diamondCuts = await getDiamondCuts([
            'RelayHubFacet',
            'MemberAccessFacet',
            'ERC20Facet',
            'BasePollProxyFacet',
            'WithdrawByFacet',
            'WithdrawByPollFacet',
            'WithdrawByPollProxyFacet',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);
        registry = await createPoolRegistry(await collector.getAddress(), 0);
        solution = await assetPool(factory.deployAssetPool(diamondCuts, registry.address));

        await solution.addManager(await voter.getAddress());
    });
    it('Relay call', async function () {
        const receipt = await helpSign(
            solution,
            'proposeWithdraw',
            [10, await voter.getAddress(), Math.floor(Date.now() * 1000)],
            owner,
        );
        expect(receipt.events[0].args.account).to.eq(await voter.getAddress());
        expect(receipt.events[1].args.id).to.eq(1);
        expect(receipt.events[receipt.events.length - 1].args.success).to.eq(true);
    });
    it('Only owner', async function () {
        const receipt2 = await helpSign(
            solution,
            'proposeWithdraw',
            [10, await voter.getAddress(), Math.floor(Date.now() * 1000)],
            voter,
        );

        expect(receipt2.events[receipt2.events.length - 1].args.success).to.eq(false);
        expect(hex2a(receipt2.events[0].args.data.substr(10))).to.eq('NOT_OWNER');
    });
    it('Wrong nonce', async function () {
        const nonce = 5;
        const call = solution.interface.encodeFunctionData('proposeWithdraw', [
            10,
            await voter.getAddress(),
            Math.floor(Date.now() * 1000),
        ]);
        const hash = web3.utils.soliditySha3(call, nonce);
        const sig = await owner.signMessage(ethers.utils.arrayify(hash));

        await expect(solution.call(call, nonce, sig)).to.be.revertedWith('INVALID_NONCE');
    });
    it('Relayception', async function () {
        const call = solution.interface.encodeFunctionData('proposeWithdraw', [
            10,
            await voter.getAddress(),
            Math.floor(Date.now() * 1000),
        ]);
        // Increase nonce with 2 since the call will be relayed twice.
        const nonce = Number(await solution.getLatestNonce(await owner.getAddress())) + 2;
        const hash = web3.utils.soliditySha3(call, nonce);
        const sig = await owner.signMessage(ethers.utils.arrayify(hash));
        const receipt = await helpSign(solution, 'call', [call, nonce, sig], owner);

        expect(receipt.events[0].args.id).to.eq(2);
        expect(receipt.events[receipt.events.length - 2].args.success).to.eq(true);
        expect(receipt.events[receipt.events.length - 1].args.success).to.eq(true);
    });
});
