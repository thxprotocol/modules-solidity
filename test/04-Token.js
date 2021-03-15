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

const onePercent = ethers.BigNumber.from("10").pow(16);

describe("04 token", function () {
  let owner;
  let voter;
  let token;

  before(async function () {
    [owner, voter, collector] = await ethers.getSigners();
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
    const ExampleToken = await ethers.getContractFactory("ExampleToken");
    erc20 = await ExampleToken.deploy(
      await owner.getAddress(),
      parseEther("1000000")
    );
    token = await assetPool(factory.deployAssetPool());
  });
  it("Test token", async function () {
    expect(await token.getToken()).to.eq(constants.AddressZero);
    expect(await token.addToken(erc20.address));
    expect(await token.getToken()).to.eq(erc20.address);
  });
  it("Test registry", async function () {
    const PoolRegistry = await ethers.getContractFactory("PoolRegistry");
    let poolRegistry = await PoolRegistry.deploy(
      await collector.getAddress(),
      onePercent
    );

    expect(await token.getPoolRegistry()).to.eq(constants.AddressZero);
    expect(await token.setPoolRegistry(poolRegistry.address));
    expect(await token.getPoolRegistry()).to.eq(poolRegistry.address);
  });
  it("Test deposit", async function () {
    expect(await token.getBalance()).to.eq(0);
    expect(await erc20.balanceOf(await collector.getAddress())).to.eq(0);
    expect(await erc20.balanceOf(token.address)).to.eq(0);

    await erc20.approve(token.address, constants.MaxUint256);
    await token.deposit(parseEther("100"));

    expect(await token.getBalance()).to.eq(parseEther("99"));
    expect(await erc20.balanceOf(await collector.getAddress())).to.eq(
      parseEther("1")
    );
    expect(await erc20.balanceOf(token.address)).to.eq(parseEther("99"));
  });
});
