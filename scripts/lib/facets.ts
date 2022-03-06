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

// Dev
// export const Facets: { [faceName: string]: string } = {
//     AccessControl: '0x7f61982fE107cc34D0E28767a9a56e3d356B6507',
//     MemberAccess: '0x95697eD5a0D53F8Bb8cE48A93840f3Cd1Bd32B1C',
//     Token: '0xA80852F8125d74711BD2f4AC243156Bd59514E57',
//     BasePollProxy: '0x606Ff0F9Ed984132E3c2260a5247e4DF4e810D82',
//     RelayHubFacet: '0x98A21c1f8b68Bc582c540B30e71747C7aFF5B99C',
//     UpdateDiamond: '0xD4Bda921Bc99886b9263215B800cE1F8f9A7E722',
//     Withdraw: '0x593be71E2595E417035A948d1462E93200a5eD0F',
//     WithdrawPoll: '0x494D831ffa514539b85F471354d6f503061ba520',
//     WithdrawPollProxy: '0xd3CE94295708ED6B417Ba0e5C3Fd34E8cead6dc5',
//     Reward: '0xe2cA31D2e0b410Ec60f6C55fc6589519587caA3D',
//     RewardPoll: '0xD6339f6Fca7E16114032A57d00Bcf83Be0716E25',
//     RewardPollProxy: '0x84e86902Bf8bEE63F37eCe5D64e8d8ae6076d0E6',
//     WithdrawBy: '0x202018d873B2C0cfEFcFc837dEeAedeEb655FeBD',
//     WithdrawByPoll: '0xf31f737573E35609310B2f550947DF3F68F6F8fd',
//     WithdrawByPollProxy: '0x9Cd8A8ae542596453b9ffB132a31d45bF7EAe0Ab',
//     RewardBy: '0x15B91224Cf8EB7119379103dd1d6DEB115a3c896',
//     RewardByPoll: '0x0E32321883424AE19C0e3E15Bc6bEC14eB84A1c1',
//     RewardByPollProxy: '0x5176B3e60FE1B3c696e56099A5Fa38a2880892c0',
//     DiamondCutFacet: '0x5aEcd0A38262276fC76d7f120CCCb3e0AD099C57',
//     DiamondLoupeFacet: '0x3F6123Af171B2E42242caE7e6Dd632074E5F3aa2',
//     OwnershipFacet: '0x3e9cb89eD9AcB7e8B2203c01D09f13CCE07F8fA6',
//     AssetPoolFactoryFacet: '0xdFbd4B46D75299b71c7A9f6cD9D1C6403A40d225',
// };

// Prod
// export const Facets: { [faceName: string]: string } = {
//     AccessControl: '0x8A2Dd7Bf4Bc354554DC7474d2228b38F9642262b',
//     MemberAccess: '0x30adfA805176F9f5a308772cbac596712E585707',
//     Token: '0xC65FAEEe04DC37653C63389D46a92088235A7AfD',
//     BasePollProxy: '0xCed163D510121cA6aCBc226bCE684C2D70FCa084',
//     RelayHubFacet: '0x0b2084E36B2aa78c48881Fa9006a820b9e01A5E1',
//     UpdateDiamond: '0xC6A61D3A6eF3d0aE286dc9B65B039bad0BeAf17A',
//     Withdraw: '0x126E72e91fD489dbc3654b730129D4d50fC0f406',
//     WithdrawPoll: '0x3169101010Ef675ab060299831c3886E9f38E42D',
//     WithdrawPollProxy: '0xa1a42D2dA67148CBD451Ba4a8ff5783F099F7D97',
//     Reward: '0xf216cFd9f94D9B23092E8981a1525167b37E8Ac5',
//     RewardPoll: '0xE6398498652e4C7d49954b540DAfa786d86675ea',
//     RewardPollProxy: '0x89d465FBf25DbdBa19106BeE5bc93195158f6721',
//     WithdrawBy: '0x343014b6B463cE64395d1CDC6891CaC889A5d2A8',
//     WithdrawByPoll: '0x7aAD191Cba3bb78421E2176e00912C17b8FE1381',
//     WithdrawByPollProxy: '0xA09dD80e80361004234AF0Ea82163a2C0bbc614d',
//     RewardBy: '0x5B32F2006D150Ea49Fd1Dd5bcbD49D9317c9935A',
//     RewardByPoll: '0xBA420Dd690fE5113911D4EebB166E8632e196603',
//     RewardByPollProxy: '0xdfA24D0F0837226fDAb559650782453a69cB4Fb3',
//     DiamondCutFacet: '0x6f45aCf5b28A15137c15c0e7741593BbdECd8E5b',
//     DiamondLoupeFacet: '0x942833e40EA048Ed6cC5dF5aB520734195ddFa37',
//     OwnershipFacet: '0x80418EB58982708d4aAEad4D59c436a2c4eC52a5',
//     AssetPoolFactoryFacet: '0xEf7fFAC11AbdD02266478F5D00c391F2ae133b3d',
// };

export async function deployFacets() {
    const artifacts = [
        Artifacts.AccessControl,
        Artifacts.MemberAccess,
        Artifacts.Token,
        Artifacts.BasePollProxy,
        Artifacts.RelayHubFacet,
        Artifacts.UpdateDiamond,
        Artifacts.Withdraw,
        Artifacts.WithdrawPoll,
        Artifacts.WithdrawPollProxy,
        Artifacts.Reward,
        Artifacts.RewardPoll,
        Artifacts.RewardPollProxy,
        Artifacts.WithdrawBy,
        Artifacts.WithdrawByPoll,
        Artifacts.WithdrawByPollProxy,
        Artifacts.RewardBy,
        Artifacts.RewardByPoll,
        Artifacts.RewardByPollProxy,
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
