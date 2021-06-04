const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { constants } = require("ethers");
const {
  diamond,
  assetPool,
  MEMBER_ROLE,
  MANAGER_ROLE,
  ADMIN_ROLE,
} = require("./utils.js");

describe("Pool", function () {
  describe("03 member access", function () {
    let owner;
    let voter;
    let memberAccess;

    before(async function () {
      [owner, voter] = await ethers.getSigners();
      const MemberAccess = await ethers.getContractFactory("MemberAccess");
      const DiamondCutFacet = await ethers.getContractFactory(
        "DiamondCutFacet"
      );
      const DiamondLoupeFacet = await ethers.getContractFactory(
        "DiamondLoupeFacet"
      );
      const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");

      const factory = await diamond([
        MemberAccess,
        DiamondCutFacet,
        DiamondLoupeFacet,
        OwnershipFacet,
      ]);
      memberAccess = await assetPool(factory.deployAssetPool());
    });
  });
});
