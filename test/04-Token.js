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

describe("04 token", function () {
  let owner;
  let voter;
  let token;
  const tokenAddress = "0x553BF7Cfd38e09C3fb6a8d9B59C1f49b23630Ba8";

  before(async function () {
    [owner, voter] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const DiamondLoupeFacet = await ethers.getContractFactory(
      "DiamondLoupeFacet"
    );
    const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");

    const factory = await diamond([
      Token,
      DiamondCutFacet,
      DiamondLoupeFacet,
      OwnershipFacet,
    ]);
    token = await assetPool(factory.deployAssetPool());
  });
  it("Test token", async function () {
    expect(await token.getToken()).to.eq(constants.AddressZero);
    expect(await token.addToken(tokenAddress));
    expect(await token.getToken()).to.eq(tokenAddress);
  });
});
