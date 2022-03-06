const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { events, diamond, timestamp, assetPool, helpSign, hex2a } = require('./utils.js');

describe('05 withdraw', function () {
    let owner;
    let withdraw;

    before(async function () {
        [owner, voter] = await ethers.getSigners();
        const MemberAccess = await ethers.getContractFactory('MemberAccess');
        const BasePollProxy = await ethers.getContractFactory('BasePollProxy');
        const Withdraw = await ethers.getContractFactory('Withdraw');
        const WithdrawPoll = await ethers.getContractFactory('WithdrawPoll');
        const WithdrawPollProxy = await ethers.getContractFactory('WithdrawPollProxy');

        const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
        const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet');
        const OwnershipFacet = await ethers.getContractFactory('OwnershipFacet');

        const factory = await diamond([
            MemberAccess,
            BasePollProxy,
            Withdraw,
            WithdrawPoll,
            WithdrawPollProxy,
            DiamondCutFacet,
            DiamondLoupeFacet,
            OwnershipFacet,
        ]);
        withdraw = await assetPool(factory.deployAssetPool());
        await withdraw.setProposeWithdrawPollDuration(100);
    });
    it('Initial state', async function () {
        const duration = await withdraw.getProposeWithdrawPollDuration();
        expect(duration).to.eq(100);
    });
    it('Test proposeWithdraw', async function () {
        expect(await withdraw.getAmount(1)).to.eq(0);
        expect(await withdraw.getBeneficiary(1)).to.eq(constants.AddressZero);

        const ev = await events(withdraw.proposeWithdraw(parseEther('1'), await owner.getAddress()));

        expect(ev[0].args.id).to.eq(1);
        expect(await withdraw.getAmount(1)).to.eq(parseEther('1'));
        expect(await withdraw.getBeneficiary(1)).to.eq(1001);
    });
    it('Test withdrawPollVote', async function () {
        expect(await withdraw.getYesCounter(1)).to.eq(0);
        await withdraw.withdrawPollVote(1, true);
        expect(await withdraw.getYesCounter(1)).to.eq(1);
    });
});

describe('05 - proposeWithdraw', function () {
    let withdraw;

    let owner;
    let voter;
    let poolMember;
    let token;

    let withdrawTimestamp;

    before(async function () {
        [owner, voter, poolMember, collector] = await ethers.getSigners();
        const ExampleToken = await ethers.getContractFactory('ExampleToken');
        token = await ExampleToken.deploy(await owner.getAddress(), parseEther('1000000'));

        const MemberAccess = await ethers.getContractFactory('MemberAccess');
        const Token = await ethers.getContractFactory('Token');
        const BasePollProxy = await ethers.getContractFactory('BasePollProxy');
        const Withdraw = await ethers.getContractFactory('Withdraw');
        const WithdrawPoll = await ethers.getContractFactory('WithdrawPoll');
        const WithdrawPollProxy = await ethers.getContractFactory('WithdrawPollProxy');
        const RelayHubFacet = await ethers.getContractFactory('RelayHubFacet');

        const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
        const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet');
        const OwnershipFacet = await ethers.getContractFactory('OwnershipFacet');

        const factory = await diamond([
            MemberAccess,
            Token,
            BasePollProxy,
            Withdraw,
            WithdrawPoll,
            WithdrawPollProxy,
            DiamondCutFacet,
            DiamondLoupeFacet,
            OwnershipFacet,
            RelayHubFacet,
        ]);
        withdraw = await assetPool(factory.deployAssetPool());
        await withdraw.addToken(token.address);

        const PoolRegistry = await ethers.getContractFactory('PoolRegistry');
        let poolRegistry = await PoolRegistry.deploy(await collector.getAddress(), 0);
        expect(await withdraw.setPoolRegistry(poolRegistry.address));
        await token.approve(withdraw.address, parseEther('1100'));
        await withdraw.deposit(parseEther('1100'));

        await withdraw.setProposeWithdrawPollDuration(100);
    });
    it('Relayed addMember by owner', async function () {
        const call = withdraw.interface.encodeFunctionData('addMember', [await poolMember.getAddress()]);
        const nonce = Number(await solution.getLatestNonce(owner.address)) + 2;
        const hash = web3.utils.soliditySha3(call, nonce);
        const sig = await owner.signMessage(ethers.utils.arrayify(hash));
        const tx = await helpSign(solution, 'call', [call, nonce, sig], owner);

        expect(tx.events[tx.events.length - 1].args.success).to.eq(true);
    });
    it('Test proposeWithdraw', async function () {
        const ev = await events(withdraw.proposeWithdraw(parseEther('1'), await poolMember.getAddress()));
        const member = ev[0].args.member;
        expect(member).to.eq(await withdraw.getMemberByAddress(await poolMember.getAddress()));

        withdrawTimestamp = (await ev[0].getBlock()).timestamp;
    });
    it('withdrawPoll storage', async function () {
        expect(await withdraw.getBeneficiary(1)).to.be.eq(
            await withdraw.getMemberByAddress(await poolMember.getAddress()),
        );
        expect(await withdraw.getAmount(1)).to.be.eq(parseEther('1'));
    });
    it('basepoll storage', async function () {
        expect(await withdraw.getStartTime(1)).to.be.eq(withdrawTimestamp);
        expect(await withdraw.getEndTime(1)).to.be.eq(withdrawTimestamp + 100);
        expect(await withdraw.getYesCounter(1)).to.be.eq(0);
        expect(await withdraw.getNoCounter(1)).to.be.eq(0);
        expect(await withdraw.getTotalVoted(1)).to.be.eq(0);
    });
    it('Verify current approval state', async function () {
        expect(await withdraw.withdrawPollApprovalState(1)).to.be.eq(false);
    });
    it('propose reward as non member', async function () {
        await expect(
            withdraw.connect(voter).proposeWithdraw(parseEther('1'), await owner.getAddress()),
        ).to.be.revertedWith('NOT_OWNER');
    });
    it('propose rewardFor for non member', async function () {
        await expect(withdraw.proposeWithdraw(parseEther('1'), await voter.getAddress())).to.be.revertedWith(
            'NOT_MEMBER',
        );
    });
    it('vote', async function () {
        voteTxTimestamp = await timestamp(withdraw.withdrawPollVote(1, true));
        expect(await withdraw.getYesCounter(1)).to.be.eq(1);
        expect(await withdraw.getNoCounter(1)).to.be.eq(0);
        expect(await withdraw.getTotalVoted(1)).to.be.eq(1);

        const vote = await withdraw.getVoteByAddress(1, owner.getAddress());
        expect(vote.time).to.be.eq(voteTxTimestamp);
        expect(vote.weight).to.be.eq(1);
        expect(vote.agree).to.be.eq(true);
    });
    it('finalize', async function () {
        expect(await token.balanceOf(await poolMember.getAddress())).to.eq(0);
        expect(await withdraw.getBalance()).to.eq(parseEther('1100'));
        expect(await token.balanceOf(withdraw.address)).to.eq(parseEther('1100'));

        await ethers.provider.send('evm_increaseTime', [180]);
        await withdraw.withdrawPollFinalize(1);
        expect(await token.balanceOf(await poolMember.getAddress())).to.eq(parseEther('1'));

        expect(await withdraw.getBalance()).to.eq(parseEther('1099'));
        expect(await token.balanceOf(withdraw.address)).to.eq(parseEther('1099'));
    });
});

describe('05 - tokenUnlimitedAccount', function () {
    let withdraw;
    let poolMember;
    let token;

    before(async function () {
        [owner, voter, poolMember, collector] = await ethers.getSigners();

        const MemberAccess = await ethers.getContractFactory('MemberAccess');
        const Token = await ethers.getContractFactory('Token');
        const BasePollProxy = await ethers.getContractFactory('BasePollProxy');
        const Withdraw = await ethers.getContractFactory('Withdraw');
        const WithdrawPoll = await ethers.getContractFactory('WithdrawPoll');
        const WithdrawPollProxy = await ethers.getContractFactory('WithdrawPollProxy');

        const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
        const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet');
        const OwnershipFacet = await ethers.getContractFactory('OwnershipFacet');

        const PoolRegistry = await ethers.getContractFactory('PoolRegistry');

        const TokenUnlimitedAccount = await ethers.getContractFactory('TokenUnlimitedAccount');

        const factory = await diamond([
            MemberAccess,
            Token,
            BasePollProxy,
            Withdraw,
            WithdrawPoll,
            WithdrawPollProxy,
            DiamondCutFacet,
            DiamondLoupeFacet,
            OwnershipFacet,
        ]);
        withdraw = await assetPool(factory.deployAssetPool());
        token = await TokenUnlimitedAccount.deploy('Test Token', 'TST', withdraw.address);
        await withdraw.addToken(token.address);

        const registry = await PoolRegistry.deploy(await collector.getAddress(), 0);

        await withdraw.setPoolRegistry(registry.address);
        await withdraw.setProposeWithdrawPollDuration(100);
        await withdraw.addMember(await poolMember.getAddress());
        await withdraw.proposeWithdraw(parseEther('1'), await poolMember.getAddress());
        await withdraw.withdrawPollVote(1, true);
    });

    it('finalize', async function () {
        expect(await token.balanceOf(await poolMember.getAddress())).to.eq(0);
        expect(await withdraw.getBalance()).to.eq(0);
        expect(await token.balanceOf(withdraw.address)).to.eq(0);

        await ethers.provider.send('evm_increaseTime', [180]);
        await withdraw.withdrawPollFinalize(1);
        expect(await token.balanceOf(await poolMember.getAddress())).to.eq(parseEther('1'));

        expect(await withdraw.getBalance()).to.eq(0);
        expect(await token.balanceOf(withdraw.address)).to.eq(0);
    });
});

// todo test
// withdrawPollRevokeVote
