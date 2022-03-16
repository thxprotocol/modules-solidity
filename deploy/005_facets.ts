import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const facets = [
    'AccessControl',
    'MemberAccess',
    'Token',
    'BasePollProxy',
    'RelayHubFacet',
    'Withdraw',
    'WithdrawPoll',
    'WithdrawPollProxy',
    'WithdrawBy',
    'WithdrawByPoll',
    'WithdrawByPollProxy',
    'DiamondCutFacet',
    'DiamondLoupeFacet',
    'OwnershipFacet',
    'AssetPoolFactoryFacet',
    'TokenFactoryFacet',
    'PoolRegistryFacet',
];
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    for (const facet of facets) {
        await deploy(facet, {
            from: deployer,
            args: [],
            log: true,
            autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        });
    }
};
export default func;
func.tags = facets;
