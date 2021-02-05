const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const {
  diamond,
  assetPool,
  MEMBER_ROLE,
  MANAGER_ROLE,
  ADMIN_ROLE,
} = require("./utils.js");

describe("Test Access Control", function () {
  let owner;
  let voter;
  let accessControl;

  before(async function () {
    [owner, voter] = await ethers.getSigners();
    const AccessControl = await ethers.getContractFactory("MockSetup");
    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const DiamondLoupeFacet = await ethers.getContractFactory(
      "DiamondLoupeFacet"
    );
    const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");

    const factory = await diamond([
      AccessControl,
      DiamondCutFacet,
      DiamondLoupeFacet,
      OwnershipFacet,
    ]);
    accessControl = await assetPool(factory.deployAssetPool());
    await accessControl.setupMockAccess(
      [MEMBER_ROLE, MANAGER_ROLE, ADMIN_ROLE],
      [
        await owner.getAddress(),
        await owner.getAddress(),
        await owner.getAddress(),
      ]
    );
  });
  it("Initial state", async function () {
    expect(
      await accessControl.hasRole(MEMBER_ROLE, await owner.getAddress())
    ).to.eq(true);
    expect(
      await accessControl.hasRole(MANAGER_ROLE, await owner.getAddress())
    ).to.eq(true);
    expect(
      await accessControl.hasRole(ADMIN_ROLE, await owner.getAddress())
    ).to.eq(true);
  });
  it("Test role", async function () {
    expect(
      await accessControl.hasRole(MEMBER_ROLE, await voter.getAddress())
    ).to.eq(false);
    await accessControl.grantRole(MEMBER_ROLE, await voter.getAddress());
    expect(
      await accessControl.hasRole(MEMBER_ROLE, await voter.getAddress())
    ).to.eq(true);
  });
});
