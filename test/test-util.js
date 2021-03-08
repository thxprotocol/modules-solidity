const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");

describe("Unlimited Token", function () {
  let token;

  before(async function () {
    [owner, receiver] = await ethers.getSigners();
    const TokenUnlimitedAccount = await ethers.getContractFactory(
      "TokenUnlimitedAccount"
    );
    token = await TokenUnlimitedAccount.deploy(
      "Test Token",
      "TST",
      await owner.getAddress()
    );
  });
  it("Initial state", async function () {
    expect(await token.balanceOf(await owner.getAddress())).to.eq(0);
    expect(await token.balanceOf(await receiver.getAddress())).to.eq(0);
  });
  it("Send", async function () {
    await token.transfer(await receiver.getAddress(), parseEther("1000"));
    expect(await token.balanceOf(await owner.getAddress())).to.eq(0);
    expect(await token.balanceOf(await receiver.getAddress())).to.eq(
      parseEther("1000")
    );
  });
  it("Return", async function () {
    await token
      .connect(receiver)
      .transfer(await owner.getAddress(), parseEther("1000"));
    expect(await token.balanceOf(await owner.getAddress())).to.eq(
      parseEther("1000")
    );
    expect(await token.balanceOf(await receiver.getAddress())).to.eq(0);
  });
  it("Resend", async function () {
    await token.transfer(await receiver.getAddress(), parseEther("1000"));
    expect(await token.balanceOf(await owner.getAddress())).to.eq(
      parseEther("1000")
    );
    expect(await token.balanceOf(await receiver.getAddress())).to.eq(
      parseEther("1000")
    );
  });
});
