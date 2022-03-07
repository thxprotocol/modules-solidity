const { utils } = require('ethers/lib');
const { constants } = require('ethers');

module.exports = {
    // keccak256("MEMBER_ROLE")
    FacetCutAction: {
        Add: 0,
        Replace: 1,
        Remove: 2,
    },
    hex2a: (hex) => {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            const v = parseInt(hex.substr(i, 2), 16);
            if (v == 8) continue; // http://www.fileformat.info/info/unicode/char/0008/index.htm
            if (v == 15) continue;
            if (v == 16) continue; // http://www.fileformat.info/info/unicode/char/0010/index.htm
            if (v == 14) continue; // https://www.fileformat.info/info/unicode/char/000e/index.htm
            if (v) str += String.fromCharCode(v);
        }
        return str.trim();
    },
    helpSign: async (solution, name, args, account) => {
        nonce = await solution.getLatestNonce(account.address);
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
        solution = await ethers.getContractAt('IDefaultDiamond', address);
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

        factoryFacets = [
            await ethers.getContractFactory('AssetPoolFactoryFacet'),
            await ethers.getContractFactory('OwnershipFacet'),
        ];
        diamondCutFactory = [];
        for (let i = 0; i < factoryFacets.length; i++) {
            const f = await factoryFacets[i].deploy();
            diamondCutFactory.push({
                action: FacetCutAction.Add,
                facetAddress: f.address,
                functionSelectors: getSelectors(f),
            });
        }

        [owner] = await ethers.getSigners();
        const Diamond = await ethers.getContractFactory('Diamond');
        diamond = await Diamond.deploy(diamondCutFactory, [await owner.getAddress()]);
        factory = await ethers.getContractAt('IDefaultFactory', diamond.address);
        await factory.initialize(diamondCut);

        return factory;
    },
    MEMBER_ROLE: '0x829b824e2329e205435d941c9f13baf578548505283d29261236d8e6596d4636',
    // keccak256("MANAGER_ROLE")
    MANAGER_ROLE: '0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08',
    ADMIN_ROLE: constants.HashZero,
    ENABLE_REWARD: ethers.BigNumber.from('2').pow(250),
    DISABLE_REWARD: ethers.BigNumber.from('2').pow(251),
};
