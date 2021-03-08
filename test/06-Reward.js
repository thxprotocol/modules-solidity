const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { constants } = require("ethers");
const {
  events,
  diamond,
  assetPool,
  MEMBER_ROLE,
  MANAGER_ROLE,
  ADMIN_ROLE,
} = require("./utils.js");

describe("06 reward", function () {
  let owner;
  let voter;
  let withdraw;

  before(async function () {
    [owner, voter] = await ethers.getSigners();
    const MemberAccess = await ethers.getContractFactory("MemberAccess");
    const BasePollProxy = await ethers.getContractFactory("BasePollProxy");
    const Reward = await ethers.getContractFactory("Reward");
    const RewardPoll = await ethers.getContractFactory("RewardPoll");
    const RewardPollProxy = await ethers.getContractFactory("RewardPollProxy");

    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const DiamondLoupeFacet = await ethers.getContractFactory(
      "DiamondLoupeFacet"
    );
    const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");

    const factory = await diamond([
      MemberAccess,
      BasePollProxy,
      Reward,
      RewardPoll,
      RewardPollProxy,
      DiamondCutFacet,
      DiamondLoupeFacet,
      OwnershipFacet,
    ]);
    withdraw = await assetPool(factory.deployAssetPool());
    await withdraw.initializeRoles(await owner.getAddress());
    await withdraw.setRewardPollDuration(100);
  });
  it("Initial state", async function () {
    const duration = await withdraw.getRewardPollDuration();
    expect(duration).to.eq(100);
  });
  it("Test proposeWithdraw", async function () {
    expect(await withdraw.getWithdrawAmount(1)).to.eq(0);
    expect(await withdraw.getWithdrawDuration(1)).to.eq(0);
    expect(await withdraw.getRewardIndex(1)).to.eq(0);

    const ev = await events(withdraw.addReward(parseEther("1"), 500));
    expect(ev[0].args.id).to.eq(1);

    expect(await withdraw.getWithdrawAmount(1)).to.eq(parseEther("1"));
    expect(await withdraw.getWithdrawDuration(1)).to.eq(500);
    expect(await withdraw.getRewardIndex(1)).to.eq(0);
  });
  it("Test withdrawPollVote", async function () {
    expect(await withdraw.getYesCounter(1)).to.eq(0);
    await withdraw.rewardPollVote(1, true);
    expect(await withdraw.getYesCounter(1)).to.eq(1);
  });
});

describe("06 reward - claim", function () {
  let owner;
  let voter;
  let solution;

  before(async function () {
    [owner, voter] = await ethers.getSigners();
    const MemberAccess = await ethers.getContractFactory("MemberAccess");
    const BasePollProxy = await ethers.getContractFactory("BasePollProxy");
    const Reward = await ethers.getContractFactory("Reward");
    const RewardPoll = await ethers.getContractFactory("RewardPoll");
    const RewardPollProxy = await ethers.getContractFactory("RewardPollProxy");

    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const DiamondLoupeFacet = await ethers.getContractFactory(
      "DiamondLoupeFacet"
    );
    const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");

    const factory = await diamond([
      MemberAccess,
      BasePollProxy,
      Reward,
      RewardPoll,
      RewardPollProxy,
      DiamondCutFacet,
      DiamondLoupeFacet,
      OwnershipFacet,
    ]);
    solution = await assetPool(factory.deployAssetPool());
    await solution.initializeRoles(await owner.getAddress());
    await solution.setRewardPollDuration(100);
    await solution.addReward(parseEther("5"), 250);

    await solution.rewardPollVote(1, true);
    await ethers.provider.send("evm_increaseTime", [180]);
    await solution.rewardPollFinalize(1);
  });
  it("Test claimReward", async function () {
    ev = await events(solution.claimReward(1));
    const member = ev[0].args.member;
    const id = ev[0].args.id;
    expect(member).to.be.eq(
      await solution.getMemberByAddress(await owner.getAddress())
    );
    expect(id).to.be.eq(2);

    withdrawTimestamp = (await ev[0].getBlock()).timestamp;
  });
  it("basepoll storage", async function () {
    expect(await solution.getStartTime(2)).to.be.eq(withdrawTimestamp);
    expect(await solution.getEndTime(2)).to.be.eq(withdrawTimestamp + 250);
    expect(await solution.getYesCounter(2)).to.be.eq(0);
    expect(await solution.getNoCounter(2)).to.be.eq(0);
    expect(await solution.getTotalVoted(2)).to.be.eq(0);
  });
  it("Claim reward as non member", async function () {
    await expect(solution.connect(voter).claimReward(1)).to.be.revertedWith(
      "NOT_MEMBER"
    );
  });
  it("Claim rewardFor non member", async function () {
    await expect(
      solution.connect(owner).claimRewardFor(1, await voter.getAddress())
    ).to.be.revertedWith("NOT_MEMBER");
  });
  it("Claim rewardFor member as non owner", async function () {
    await expect(
      solution.connect(voter).claimRewardFor(1, await owner.getAddress())
    ).to.be.revertedWith("NOT_MEMBER");
  });
  it("Claim non reward", async function () {
    await expect(solution.connect(owner).claimReward(2)).to.be.reverted;
  });
  // it("Claim disabled reward", async function () {
  //   ev = await events(solution.updateReward(1, DISABLE_REWARD, 0));
  //   const pollid = ev[0].args.id;
  //   await solution.rewardPollVote(pollid, true);
  //   await ethers.provider.send("evm_increaseTime", [180]);
  //   await solution.rewardPollFinalize(pollid);

  //   await expect(solution.claimReward(1)).to.be.revertedWith("IS_NOT_ENABLED");
  // });
});