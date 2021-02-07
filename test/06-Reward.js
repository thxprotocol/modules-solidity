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
