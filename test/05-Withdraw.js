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
