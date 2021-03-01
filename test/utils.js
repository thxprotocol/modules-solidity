const { utils } = require("ethers/lib");
const { constants } = require("ethers");

module.exports = {
  // keccak256("MEMBER_ROLE")
  FacetCutAction: {
    Add: 0,
    Replace: 1,
    Remove: 2,
  },
  helpSign: async (solution, name, args, account) => {
    nonce = await solution.getLatestNonce(account.getAddress());
    nonce = parseInt(nonce) + 1;
    const call = solution.interface.encodeFunctionData(name, args);
    const hash = web3.utils.soliditySha3(call, nonce);
    const sig = await account.signMessage(ethers.utils.arrayify(hash));
    tx = await solution.call(call, nonce, sig);
    tx = await tx.wait();
    return tx;
  },
  getSelectors: function (contract) {
    const signatures = [];
    for (const key of Object.keys(contract.functions)) {
      signatures.push(utils.keccak256(utils.toUtf8Bytes(key)).substr(0, 10));
    }
    return signatures;
  },
  assetPool: async (deploy) => {
    tx = await deploy;
    tx = await tx.wait();
    const address = tx.events[tx.events.length - 1].args.assetPool;
    solution = await ethers.getContractAt("IDefaultDiamond", address);
    return solution;
  },
  events: async (tx) => {
    tx = await tx;
    tx = await tx.wait();
    return tx.events;
  },
  timestamp: async (tx) => {
    tx = await tx;
    tx = await tx.wait();
    return (await ethers.provider.getBlock(tx.blockNumber)).timestamp;
  },
  diamond: async (facets) => {
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

    diamondCut = [];
    for (let i = 0; i < facets.length; i++) {
      const f = await facets[i].deploy();
      diamondCut.push({
        action: FacetCutAction.Add,
        facetAddress: f.address,
        functionSelectors: getSelectors(f),
      });
    }
    AssetPoolFactory = await ethers.getContractFactory("AssetPoolFactory");
    return AssetPoolFactory.deploy(diamondCut);
  },
  MEMBER_ROLE:
    "0x829b824e2329e205435d941c9f13baf578548505283d29261236d8e6596d4636",
  // keccak256("MANAGER_ROLE")
  MANAGER_ROLE:
    "0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08",
  ADMIN_ROLE: constants.HashZero,
};
