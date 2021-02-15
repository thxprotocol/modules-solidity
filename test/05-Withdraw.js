const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { constants } = require("ethers");
const {
  events,
  diamond,
  timestamp,
  assetPool,
  MEMBER_ROLE,
  MANAGER_ROLE,
  ADMIN_ROLE,
} = require("./utils.js");

describe("05 withdaw", function () {
  let owner;
  let voter;
  let withdraw;

  before(async function () {
    [owner, voter] = await ethers.getSigners();
    const MemberAccess = await ethers.getContractFactory("MemberAccess");
    const BasePollProxy = await ethers.getContractFactory("BasePollProxy");
    const Withdraw = await ethers.getContractFactory("Withdraw");
    const WithdrawPoll = await ethers.getContractFactory("WithdrawPoll");
    const WithdrawPollProxy = await ethers.getContractFactory(
      "WithdrawPollProxy"
    );

    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const DiamondLoupeFacet = await ethers.getContractFactory(
      "DiamondLoupeFacet"
    );
    const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");

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
    await withdraw.initializeRoles(await owner.getAddress());
    await withdraw.setProposeWithdrawPollDuration(100);
  });
  it("Initial state", async function () {
    const duration = await withdraw.getProposeWithdrawPollDuration();
    expect(duration).to.eq(100);
  });
  it("Test proposeWithdraw", async function () {
    expect(await withdraw.getAmount(1)).to.eq(0);
    expect(await withdraw.getBeneficiary(1)).to.eq(constants.AddressZero);

    const ev = await events(
      withdraw.proposeWithdraw(parseEther("1"), await owner.getAddress())
    );

    expect(ev[0].args.id).to.eq(1);
    expect(await withdraw.getAmount(1)).to.eq(parseEther("1"));
    expect(await withdraw.getBeneficiary(1)).to.eq(1001);
  });
  it("Test withdrawPollVote", async function () {
    expect(await withdraw.getYesCounter(1)).to.eq(0);
    await withdraw.withdrawPollVote(1, true);
    expect(await withdraw.getYesCounter(1)).to.eq(1);
  });
});

describe("05 - proposeWithdraw", function () {
  let withdraw;

  let owner;
  let voter;
  let poolMember;
  let token;
  let reward;
  let _beforeDeployment;

  let withdrawTimestamp;

  before(async function () {
    [owner, voter, poolMember] = await ethers.getSigners();
    const ExampleToken = await ethers.getContractFactory("ExampleToken");
    token = await ExampleToken.deploy(
      await owner.getAddress(),
      parseEther("1000000")
    );

    const MemberAccess = await ethers.getContractFactory("MemberAccess");
    const Token = await ethers.getContractFactory("Token");
    const BasePollProxy = await ethers.getContractFactory("BasePollProxy");
    const Withdraw = await ethers.getContractFactory("Withdraw");
    const WithdrawPoll = await ethers.getContractFactory("WithdrawPoll");
    const WithdrawPollProxy = await ethers.getContractFactory(
      "WithdrawPollProxy"
    );

    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const DiamondLoupeFacet = await ethers.getContractFactory(
      "DiamondLoupeFacet"
    );
    const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");

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

    await token.transfer(withdraw.address, parseEther("1000"));

    await withdraw.addToken(token.address);
    await withdraw.initializeRoles(await owner.getAddress());
    await withdraw.setProposeWithdrawPollDuration(100);
    await withdraw.addMember(await poolMember.getAddress());
  });
  it("Test proposeWithdraw", async function () {
    const ev = await events(
      withdraw.proposeWithdraw(parseEther("1"), await poolMember.getAddress())
    );
    const member = ev[0].args.member;
    expect(member).to.eq(
      await withdraw.getMemberByAddress(await poolMember.getAddress())
    );

    withdrawTimestamp = (await ev[0].getBlock()).timestamp;
  });
  it("withdrawPoll storage", async function () {
    expect(await withdraw.getBeneficiary(1)).to.be.eq(
      await withdraw.getMemberByAddress(await poolMember.getAddress())
    );
    expect(await withdraw.getAmount(1)).to.be.eq(parseEther("1"));
  });
  it("basepoll storage", async function () {
    expect(await withdraw.getStartTime(1)).to.be.eq(withdrawTimestamp);
    expect(await withdraw.getEndTime(1)).to.be.eq(withdrawTimestamp + 100);
    expect(await withdraw.getYesCounter(1)).to.be.eq(0);
    expect(await withdraw.getNoCounter(1)).to.be.eq(0);
    expect(await withdraw.getTotalVoted(1)).to.be.eq(0);
  });
  it("Verify current approval state", async function () {
    expect(await withdraw.withdrawPollApprovalState(1)).to.be.eq(false);
  });
  it("propose reward as non member", async function () {
    await expect(
      withdraw
        .connect(voter)
        .proposeWithdraw(parseEther("1"), await owner.getAddress())
    ).to.be.revertedWith("NOT_MEMBER");
  });
  it("propose rewardFor non member", async function () {
    await expect(
      withdraw.proposeWithdraw(parseEther("1"), await voter.getAddress())
    ).to.be.revertedWith("NOT_MEMBER");
  });
  it("propose rewardFor member as non member", async function () {
    await expect(
      withdraw
        .connect(voter)
        .proposeWithdraw(parseEther("1"), await voter.getAddress())
    ).to.be.revertedWith("NOT_MEMBER");
  });
  it("vote", async function () {
    voteTxTimestamp = await timestamp(withdraw.withdrawPollVote(1, true));
    expect(await withdraw.getYesCounter(1)).to.be.eq(1);
    expect(await withdraw.getNoCounter(1)).to.be.eq(0);
    expect(await withdraw.getTotalVoted(1)).to.be.eq(1);

    const vote = await withdraw.getVoteByAddress(1, owner.getAddress());
    expect(vote.time).to.be.eq(voteTxTimestamp);
    expect(vote.weight).to.be.eq(1);
    expect(vote.agree).to.be.eq(true);
  });
  it("finalize", async function () {
    expect(await token.balanceOf(await poolMember.getAddress())).to.eq(0);
    await ethers.provider.send("evm_increaseTime", [180]);
    await withdraw.withdrawPollFinalize(1);
    expect(await token.balanceOf(await poolMember.getAddress())).to.eq(
      parseEther("1")
    );
  });
});
// todo test
// withdrawPollRevokeVote
