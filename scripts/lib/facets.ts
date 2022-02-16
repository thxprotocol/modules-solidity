import { ethers } from 'hardhat';

export async function deployFacets() {
    const artifacts = [
        'AccessControl',
        'MemberAccess',
        'Token',
        'BasePollProxy',
        'GasStationFacet',
        'UpdateDiamond',
        'Withdraw',
        'WithdrawPoll',
        'WithdrawPollProxy',
        'Reward',
        'RewardPoll',
        'RewardPollProxy',
        'WithdrawBy',
        'WithdrawByPoll',
        'WithdrawByPollProxy',
        'RewardBy',
        'RewardByPoll',
        'RewardByPollProxy',
        'DiamondCutFacet',
        'DiamondLoupeFacet',
        'OwnershipFacet',
        'AssetPoolFactoryFacet',
    ];
    const facets: any = {};

    for (const artifact of artifacts) {
        const factory = await ethers.getContractFactory(artifact);
        const facet = await factory.deploy();

        facets[artifact] = facet.address;
    }

    return facets;
}
