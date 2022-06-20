const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { deployDefaultPool, helpSign, hex2a, getDiamondCuts, deployPoolRegistry, MINTER_ROLE } = require('./utils.js');

describe('RelayHubFacet', function () {
    let solution, registry, owner, voter, erc20;

    before(async function () {
        [owner, voter, collector] = await ethers.getSigners();
        const diamondCuts = await getDiamondCuts([
            'RelayHubFacet',
            'MemberAccessFacet',
            'ERC20Facet',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);
        const UnlimitedSupplyToken = await ethers.getContractFactory('UnlimitedSupplyToken');
        erc20 = await UnlimitedSupplyToken.deploy('Test Token', 'UNL-TKN', await owner.getAddress());
        registry = await deployPoolRegistry(await collector.getAddress(), 0);
        solution = await deployDefaultPool(diamondCuts, registry.address, erc20.address);

        await erc20.grantRole(MINTER_ROLE, solution.address);
        await solution.addManager(await voter.getAddress());
    });
    it('Relay call', async function () {
        const receipt = await helpSign(
            solution,
            'transferToMany',
            [[await voter.getAddress()], [parseEther('10')]],
            owner,
        );

        expect(receipt.events[receipt.events.length - 2].args.recipient).to.eq(await voter.getAddress());
        expect(receipt.events[receipt.events.length - 2].args.amount).to.eq(parseEther('10'));
        expect(receipt.events[receipt.events.length - 1].args.success).to.eq(true);
    });
    it('Only owner', async function () {
        const receipt = await helpSign(
            solution,
            'transferToMany',
            [[await voter.getAddress()], [parseEther('10')]],
            voter,
        );

        expect(receipt.events[receipt.events.length - 1].args.success).to.eq(false);
        expect(hex2a(receipt.events[0].args.data.substr(10))).to.eq('NOT_OWNER');
    });
    it('Wrong nonce', async function () {
        const nonce = 5;
        const call = solution.interface.encodeFunctionData('transferToMany', [
            [await voter.getAddress()],
            [parseEther('10')],
        ]);
        const hash = web3.utils.soliditySha3(call, nonce);
        const sig = await owner.signMessage(ethers.utils.arrayify(hash));

        await expect(solution.call(call, nonce, sig)).to.be.revertedWith('INVALID_NONCE');
    });
    it('Relayception', async function () {
        // Approve for the deposit call
        await erc20.connect(voter).approve(solution.address, parseEther('1'));

        const call = solution.interface.encodeFunctionData('deposit', [parseEther('1')]);
        const nonce = Number(await solution.getLatestNonce(await voter.getAddress())) + 1;
        const hash = web3.utils.soliditySha3(call, nonce);
        const sig = await voter.signMessage(ethers.utils.arrayify(hash));
        const receipt = await helpSign(solution, 'call', [call, nonce, sig], owner);

        expect(receipt.events[receipt.events.length - 3].args.sender).to.eq(await voter.getAddress());
        expect(receipt.events[receipt.events.length - 3].args.amount).to.eq(parseEther('1'));
        expect(receipt.events[receipt.events.length - 2].args.success).to.eq(true);
        expect(receipt.events[receipt.events.length - 1].args.success).to.eq(true);
    });
    it('Relayception', async function () {
        // Approve for the deposit call
        await erc20.connect(voter).approve(solution.address, parseEther('1'));

        const call = solution.interface.encodeFunctionData('deposit', [parseEther('1')]);
        const nonce = Number(await solution.getLatestNonce(await voter.getAddress())) + 1;
        const hash = web3.utils.soliditySha3(call, nonce);
        const sig = await voter.signMessage(ethers.utils.arrayify(hash));
        const receipt = await helpSign(solution, 'call', [call, nonce, sig], owner);

        expect(receipt.events[receipt.events.length - 3].args.sender).to.eq(await voter.getAddress());
        expect(receipt.events[receipt.events.length - 3].args.amount).to.eq(parseEther('1'));
        expect(receipt.events[receipt.events.length - 2].args.success).to.eq(true);
        expect(receipt.events[receipt.events.length - 1].args.success).to.eq(true);
    });
});
