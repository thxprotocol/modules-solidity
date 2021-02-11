const { parseEther } = require("ethers/lib/utils");
const hre = require("hardhat");

async function main() {
  [owner] = await ethers.getSigners();
  const AccessControl = await ethers.getContractFactory("AccessControl");
  console.log("AccessControl", (await AccessControl.deploy()).address);

  const MemberAccess = await ethers.getContractFactory("MemberAccess");
  console.log("MemberAccess", (await MemberAccess.deploy()).address);

  const Token = await ethers.getContractFactory("Token");
  console.log("Token", (await Token.deploy()).address);

  const BasePollProxy = await ethers.getContractFactory("BasePollProxy");
  console.log("BasePollProxy", (await BasePollProxy.deploy()).address);

  const Withdraw = await ethers.getContractFactory("Withdraw");
  console.log("WithdrawBy", (await Withdraw.deploy()).address);

  const WithdrawPoll = await ethers.getContractFactory("WithdrawPoll");
  console.log("WithdrawPoll", (await WithdrawPoll.deploy()).address);

  const WithdrawPollProxy = await ethers.getContractFactory(
    "WithdrawPollProxy"
  );
  console.log("WithdrawPollProxy", (await WithdrawPollProxy.deploy()).address);

  const WithdrawBy = await ethers.getContractFactory("WithdrawBy");
  console.log("WithdrawBy", (await WithdrawBy.deploy()).address);

  const WithdrawByPoll = await ethers.getContractFactory("WithdrawByPoll");
  console.log("WithdrawByPoll", (await WithdrawByPoll.deploy()).address);

  const WithdrawByPollProxy = await ethers.getContractFactory(
    "WithdrawByPollProxy"
  );
  console.log(
    "WithdrawByPollProxy",
    (await WithdrawByPollProxy.deploy()).address
  );

  const Reward = await ethers.getContractFactory("Reward");
  console.log("Reward", (await Reward.deploy()).address);

  const RewardPoll = await ethers.getContractFactory("RewardPoll");
  console.log("RewardPoll", (await RewardPoll.deploy()).address);

  const RewardPollProxy = await ethers.getContractFactory("RewardPollProxy");
  console.log("RewardPollProxy", (await RewardPollProxy.deploy()).address);

  const RewardBy = await ethers.getContractFactory("RewardBy");
  console.log("RewardBy", (await RewardBy.deploy()).address);

  const RewardByPoll = await ethers.getContractFactory("RewardByPoll");
  console.log("RewardByPoll", (await RewardByPoll.deploy()).address);

  const RewardByPollProxy = await ethers.getContractFactory(
    "RewardByPollProxy"
  );
  console.log("RewardByPollProxy", (await RewardByPollProxy.deploy()).address);

  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  console.log("DiamondCutFacet", (await DiamondCutFacet.deploy()).address);

  const DiamondLoupeFacet = await ethers.getContractFactory(
    "DiamondLoupeFacet"
  );
  console.log("DiamondLoupeFacet", (await DiamondLoupeFacet.deploy()).address);

  const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");
  console.log("OwnershipFacet", (await OwnershipFacet.deploy()).address);

  const UpdateDiamondFacet = await ethers.getContractFactory(
    "UpdateDiamondFacet"
  );
  console.log(
    "UpdateDiamondFacet",
    (await UpdateDiamondFacet.deploy()).address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
