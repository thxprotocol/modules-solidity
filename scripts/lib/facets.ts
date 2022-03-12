import { Artifacts } from './artifacts';
import { deployContract } from './network';

// Local
export const Facets: { [faceName: string]: string } = {
    AccessControl: '0x278Ff6d33826D906070eE938CDc9788003749e93',
    MemberAccess: '0xEAB9a65eB0F098f822033192802B53EE159De5F0',
    Token: '0x055cBfeD6df4AFE2452b18fd3D2592D1795592b4',
    BasePollProxy: '0xb63564A81D5d4004F4f22E9aB074cE25540B0C26',
    RelayHubFacet: '0x50aF0922d65D04D87d810048Dc640E2474eBfbd9',
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
};

// Testnet
// export const Facets: { [faceName: string]: string } = {
// AccessControl: '0xEe2b6c529245D9008977426c2681fCFAA6daa7d8',
// MemberAccess: '0x11FbAb4e9fE278ECD2CdcC152bbF39346BAC32EC',
// Token: '0xf9c078EAAE1Bc722A4c834E2254FeD60C7c67DA3',
// BasePollProxy: '0xd8071728A9ED439eC4F19b3E2434F99f7CCea532',
// RelayHubFacet: '0xBAFc524f9F5Db9B7A88C7864a6838E23feDb2706',
// Withdraw: '0x451Cb437B3A7bD087d10f89E75d47028fC93b8Ec',
// WithdrawPoll: '0xf458a56F1ACCfadaf5e7B5dc87042CEBf4e7D169',
// WithdrawPollProxy: '0x10AFF3293B83aE8b823490DFC85809fc04C27b88',
// WithdrawBy: '0x97244aB8CB68605AB3fA8c38930197257BD0bC15',
// WithdrawByPoll: '0x703140D48bF434F7A25690bE63E9dc4C7b29991a',
// WithdrawByPollProxy: '0x4c1CA2382ED4A13379EA942Ac17e0BEB89791ca5',
// DiamondCutFacet: '0xa1F48Ad5E3a842AcD6c017C2835646e2816CBa46',
// DiamondLoupeFacet: '0x48ed51f36c73187E886Aaa469370257b799F4FF6',
// OwnershipFacet: '0x614A4161B9a597542b8921BAF55b7fE1e080ed1d',
// AssetPoolFactoryFacet: '0x7bC0694a7a1A8938BCA1477E04114cc3b3aE2ccC'
// };

// Mainnet
// export const Facets: { [faceName: string]: string } = {
// AccessControl: '0x5Bbf13fD09e1697Ed3B87216774420BaCF98484b',
// MemberAccess: '0xfBe47f27976044949f4B1F4B17B73a8f4EAc940D',
// Token: '0xDeb871B3E37AA187918872C24EBC3B1400947307',
// BasePollProxy: '0x23DaFa4DFB5cebaA244658a622a921a78a933d6D',
// RelayHubFacet: '0xd1EF976C40e06EA3dcCC4BE400F6438363c335a1',
// Withdraw: '0x246d32e448d109B14633Ca9a586AdcEe39aeDC14',
// WithdrawPoll: '0x5a73225bd798D2214cc4Be15FD80407586FAEc3A',
// WithdrawPollProxy: '0xf8dE9C122f68db9877F420b6f0ECDc77F18aaEa4',
// WithdrawBy: '0x97867F2721E88Bb15ABA01D181c1D4879bAE9191',
// WithdrawByPoll: '0xd1eecC175361Ff5aAd22ed7C3c31FAE022f5a5fB',
// WithdrawByPollProxy: '0x68B224ca0390C3677ddF17e8A0cf2962bda7f7f3',
// DiamondCutFacet: '0x9a3A79f6dbF8Ed5DeABb1967ED275AC3Bd903A7F',
// DiamondLoupeFacet: '0xdd6e810B2446bEaAB32f164B95B441aD57fa3BF3',
// OwnershipFacet: '0xAEcCe70F870eC3a7C01FcD707cA4b89329A2960a',
// AssetPoolFactoryFacet: '0xd4873DD21dCEADE1e6bB859014094A36fD514cb1'
// };

export async function deployFacets() {
    const artifacts = [
        Artifacts.AccessControl,
        Artifacts.MemberAccess,
        Artifacts.Token,
        Artifacts.BasePollProxy,
        Artifacts.RelayHubFacet,
        Artifacts.Withdraw,
        Artifacts.WithdrawPoll,
        Artifacts.WithdrawPollProxy,
        Artifacts.WithdrawBy,
        Artifacts.WithdrawByPoll,
        Artifacts.WithdrawByPollProxy,
        Artifacts.DiamondCutFacet,
        Artifacts.DiamondLoupeFacet,
        Artifacts.OwnershipFacet,
        Artifacts.AssetPoolFactoryFacet,
    ];
    const facets: any = {};

    for (const artifact of artifacts) {
        const facet = await deployContract(artifact.abi, artifact.bytecode, []);
        console.log(`${artifact.contractName}:`, facet.options.address);
        facets[artifact.contractName] = facet.options.address;
    }

    return facets;
}
