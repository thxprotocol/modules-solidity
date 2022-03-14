import { Artifacts } from './artifacts';
import { deployContract } from './network';

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
        Artifacts.TokenFactoryFacet,
    ];
    const facets: any = {};

    for (const artifact of artifacts) {
        const facet = await deployContract(artifact.abi, artifact.bytecode, []);
        facets[artifact.contractName] = facet.options.address;
    }

    return facets;
}
