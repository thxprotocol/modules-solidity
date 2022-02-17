import { ethers } from 'hardhat';
import { Contract, utils } from 'ethers';

const getSelectors = function (contract: Contract) {
    const signatures = [];
    for (const key of Object.keys(contract.functions)) {
        signatures.push(utils.keccak256(utils.toUtf8Bytes(key)).substr(0, 10));
    }
    return signatures;
};

enum FacetCutAction {
    Add = 0,
    Replace = 1,
    Remove = 2,
}

export async function deployFactory() {
    const [owner] = await ethers.getSigners();
    const networks = {
        localhost: {
            AccessControl: '0x278Ff6d33826D906070eE938CDc9788003749e93',
            MemberAccess: '0xEAB9a65eB0F098f822033192802B53EE159De5F0',
            Token: '0x055cBfeD6df4AFE2452b18fd3D2592D1795592b4',
            BasePollProxy: '0xb63564A81D5d4004F4f22E9aB074cE25540B0C26',
            GasStationFacet: '0x50aF0922d65D04D87d810048Dc640E2474eBfbd9',
            UpdateDiamond: '0x15FC0878406CcF4d2963235A5B1EF68C67F17Ee5',
            Withdraw: '0xa4E84979c95cD4f12C53E73d63E0A8634A1f44Ae',
            WithdrawPoll: '0xd916a690676e925Ac9Faf2d01869c13Fd9757ef2',
            WithdrawPollProxy: '0xB952d9b5de7804691e7936E88915A669B15822ef',
            Reward: '0x7150A3CC09429583471020A6CE5228A57736180a',
            RewardPoll: '0xe1c01805a21ee0DC535afa93172a5F21CE160649',
            RewardPollProxy: '0xf228ADAa4c3D07C8285C1025421afe2c4F320C59',
            WithdrawBy: '0x8613B8E442219e4349fa5602C69431131a7ED114',
            WithdrawByPoll: '0x8B219D3d1FC64e03F6cF3491E7C7A732bF253EC8',
            WithdrawByPollProxy: '0xeDdBA2bDeE7c9006944aCF9379Daa64478E02290',
            RewardBy: '0x3eF13AcF26776BfEd682732ae34cBC86bb355862',
            RewardByPoll: '0xB1456cF726D8D2A2b10dD4db417674A49dB94998',
            RewardByPollProxy: '0xc368fA6A4057BcFD9E49221d8354d5fA6B88945a',
            DiamondCutFacet: '0x439F0128d07f005e0703602f366599ACaaBfEA18',
            DiamondLoupeFacet: '0x24E91C3a2822bDc4bc73512872ab07fD93c8101b',
            OwnershipFacet: '0x76aBe9ec9b15947ba1Ca910695B8b6CffeD8E6CA',
            AssetPoolFactoryFacet: '0x7Cb8d1EAd6303C079c501e93F3ba28C227cd7000',
        },
    };

    const AccessControl = await ethers.getContractAt('AccessControl', networks.localhost.AccessControl);
    const MemberAccess = await ethers.getContractAt('MemberAccess', networks.localhost.MemberAccess);
    const Token = await ethers.getContractAt('Token', networks.localhost.Token);
    const BasePollProxy = await ethers.getContractAt('BasePollProxy', networks.localhost.BasePollProxy);
    const GasStation = await ethers.getContractAt('GasStationFacet', networks.localhost.BasePollProxy);
    const Withdraw = await ethers.getContractAt('Withdraw', networks.localhost.Withdraw);
    const WithdrawPoll = await ethers.getContractAt('WithdrawPoll', networks.localhost.WithdrawPoll);
    const WithdrawPollProxy = await ethers.getContractAt('WithdrawPollProxy', networks.localhost.WithdrawPollProxy);
    const WithdrawBy = await ethers.getContractAt('WithdrawBy', networks.localhost.WithdrawBy);
    const WithdrawByPoll = await ethers.getContractAt('WithdrawByPoll', networks.localhost.WithdrawByPoll);
    const WithdrawByPollProxy = await ethers.getContractAt(
        'WithdrawByPollProxy',
        networks.localhost.WithdrawByPollProxy,
    );
    const Reward = await ethers.getContractAt('Reward', networks.localhost.Reward);
    const RewardPoll = await ethers.getContractAt('RewardPoll', networks.localhost.RewardPoll);
    const RewardPollProxy = await ethers.getContractAt('RewardPollProxy', networks.localhost.RewardPollProxy);
    const RewardBy = await ethers.getContractAt('RewardBy', networks.localhost.RewardBy);
    const RewardByPoll = await ethers.getContractAt('RewardByPoll', networks.localhost.RewardByPoll);
    const RewardByPollProxy = await ethers.getContractAt('RewardByPollProxy', networks.localhost.RewardByPollProxy);
    const DiamondCutFacet = await ethers.getContractAt('DiamondCutFacet', networks.localhost.DiamondCutFacet);
    const DiamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', networks.localhost.DiamondLoupeFacet);
    const OwnershipFacet = await ethers.getContractAt('OwnershipFacet', networks.localhost.OwnershipFacet);
    const AssetPoolFactoryFacet = await ethers.getContractAt(
        'AssetPoolFactoryFacet',
        networks.localhost.AssetPoolFactoryFacet,
    );

    let defaultDiamond: any[] = [
        AccessControl,
        MemberAccess,
        Token,
        BasePollProxy,
        GasStation,
        WithdrawBy,
        WithdrawByPoll,
        WithdrawByPollProxy,
        RewardBy,
        RewardByPoll,
        RewardByPollProxy,
        DiamondCutFacet,
        DiamondLoupeFacet,
        OwnershipFacet,
    ];
    let factoryDiamond: any[] = [DiamondCutFacet, DiamondLoupeFacet, OwnershipFacet, AssetPoolFactoryFacet];

    defaultDiamond = defaultDiamond.map((facet) => {
        return {
            action: FacetCutAction.Add,
            facetAddress: facet.address,
            functionSelectors: getSelectors(facet),
        };
    });

    factoryDiamond = factoryDiamond.map((facet) => {
        return {
            action: FacetCutAction.Add,
            facetAddress: facet.address,
            functionSelectors: getSelectors(facet),
        };
    });

    const DiamondFactory = await ethers.getContractFactory('Diamond');
    const diamond = await DiamondFactory.deploy(factoryDiamond, [await owner.getAddress()]);
    const factory = await ethers.getContractAt('IAssetPoolFactory', diamond.address);

    await factory.initialize(defaultDiamond);

    return factory.address;
}
