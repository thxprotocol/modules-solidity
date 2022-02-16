import { ethers } from 'hardhat';

async function main() {
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
    console.log(facets);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
