const { parseEther } = require("ethers/lib/utils");
const hre = require("hardhat");
const { utils } = require("ethers/lib");

async function main() {
  [owner] = await ethers.getSigners();
  networks = {
    goerli: {
      AccessControl: "0xc25f17c53E6ef5dA94A86D1355AC9D9e8981A201",
      MemberAccess: "0x09FF0628e1cC53819486D5ef82D3284Df0C35602",
      Token: "0x8aeF16AE91114F40e67B83D508b60313E0Ed65B0",
      BasePollProxy: "0x45981F165E56644D68d02D4cEEDc9e215a4B3f8F",
      Withdraw: "0x40A435640D8E4c77b66f802f939e5604d6EeF714",
      WithdrawPoll: "0x54b629816f37967806490b63914A21f43E33C217",
      WithdrawPollProxy: "0x24Ab443E5e0188e9fCA6f3D5f02d6E1e49aBd173",
      Reward: "0x062E05437961F6E7ad5bf541Dec3d3910c663850",
      RewardPoll: "0xfBD81624DE76468Ef939F178e27cF629424BeB8E",
      RewardPollProxy: "0x6F5149d0895929635eFcD6d014Ed70A7969b0a34",
      DiamondCutFacet: "0x8D13C1B01042ab1755f7af5eFD4Dbd75C09A68c6",
      DiamondLoupeFacet: "0xEd67775b25172A1F6Be4fbECad2fce2BCaCA2517",
      OwnershipFacet: "0xc15C08ff98A2edfD227d1AbFB2FDcd27725119BB",
      UpdateDiamond: "0x65dA75C66bd7bC8C0B2AECE3981B47504e8a995E",

      WithdrawBy: "0x1b280D1C8AeB6e0e742586c3F644d54251dcC9b9",
      WithdrawByPoll: "0xbc28306b668e5D15bAD620E0d9790c536E98d4be",
      WithdrawByPollProxy: "0x341f769Ec6eD6E68e1e2A2e86fC367a4b05ac97B",
      RewardBy: "0xFBbCF7466aa43755d03dcB5D67565Eb4f3f7af94",
      RewardByPoll: "0x35A71438B98278899E0DE2E560D1e506Df8A2aA1",
      RewardByPollProxy: "0xC886c1bD8C22b4eD26A385eEfa4b54E53E280BDF",
    },
  };

  const AccessControl = await ethers.getContractAt(
    "AccessControl",
    networks.goerli.AccessControl
  );

  const MemberAccess = await ethers.getContractAt(
    "MemberAccess",
    networks.goerli.MemberAccess
  );

  const Token = await ethers.getContractAt("Token", networks.goerli.Token);

  const BasePollProxy = await ethers.getContractAt(
    "BasePollProxy",
    networks.goerli.BasePollProxy
  );

  const Withdraw = await ethers.getContractAt(
    "Withdraw",
    networks.goerli.Withdraw
  );

  const WithdrawPoll = await ethers.getContractAt(
    "WithdrawPoll",
    networks.goerli.WithdrawPoll
  );

  const WithdrawPollProxy = await ethers.getContractAt(
    "WithdrawPollProxy",
    networks.goerli.WithdrawPollProxy
  );

  const WithdrawBy = await ethers.getContractAt(
    "WithdrawBy",
    networks.goerli.WithdrawBy
  );

  const WithdrawByPoll = await ethers.getContractAt(
    "WithdrawByPoll",
    networks.goerli.WithdrawByPoll
  );

  const WithdrawByPollProxy = await ethers.getContractAt(
    "WithdrawByPollProxy",
    networks.goerli.WithdrawByPollProxy
  );

  const Reward = await ethers.getContractAt("Reward", networks.goerli.Reward);

  const RewardPoll = await ethers.getContractAt(
    "RewardPoll",
    networks.goerli.RewardPoll
  );

  const RewardPollProxy = await ethers.getContractAt(
    "RewardPollProxy",
    networks.goerli.RewardPollProxy
  );

  const RewardBy = await ethers.getContractAt(
    "RewardBy",
    networks.goerli.RewardBy
  );

  const RewardByPoll = await ethers.getContractAt(
    "RewardByPoll",
    networks.goerli.RewardByPoll
  );

  const RewardByPollProxy = await ethers.getContractAt(
    "RewardByPollProxy",
    networks.goerli.RewardByPollProxy
  );

  const DiamondCutFacet = await ethers.getContractAt(
    "DiamondCutFacet",
    networks.goerli.DiamondCutFacet
  );

  const DiamondLoupeFacet = await ethers.getContractAt(
    "DiamondLoupeFacet",
    networks.goerli.DiamondLoupeFacet
  );

  const OwnershipFacet = await ethers.getContractAt(
    "OwnershipFacet",
    networks.goerli.OwnershipFacet
  );

  const UpdateDiamond = await ethers.getContractAt(
    "UpdateDiamond",
    networks.goerli.UpdateDiamond
  );

  FacetCutAction = {
    Add: 0,
    Replace: 1,
    Remove: 2,
  };
  getSelectors = function (contract) {
    const signatures = [];
    for (const key of Object.keys(contract.functions)) {
      signatures.push(utils.keccak256(utils.toUtf8Bytes(key)).substr(0, 10));
    }
    return signatures;
  };

  facets = [
    AccessControl,
    MemberAccess,
    Token,
    BasePollProxy,
    Withdraw,
    WithdrawPoll,
    WithdrawPollProxy,
    Reward,
    RewardPoll,
    RewardPollProxy,
    DiamondCutFacet,
    DiamondLoupeFacet,
    OwnershipFacet,
    UpdateDiamond,
  ];
  diamondCut = [];
  facets.forEach((facet) => {
    diamondCut.push({
      action: FacetCutAction.Add,
      facetAddress: facet.address,
      functionSelectors: getSelectors(facet),
    });
  });
  const RelayDiamond = await ethers.getContractFactory("RelayDiamond");
  console.log(
    "RelayDiamond",
    (await RelayDiamond.deploy(diamondCut, await owner.getAddress())).address
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
