import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const facets = [
    'AccessControlFacet',
    'MemberAccessFacet',
    'BasePollProxyFacet',
    'RelayHubFacet',
    'ERC20Facet',
    'ERC721Facet',
    'WithdrawFacet',
    'WithdrawPollFacet',
    'WithdrawPollProxyFacet',
    'WithdrawByFacet',
    'WithdrawByPollFacet',
    'WithdrawByPollProxyFacet',
    'DiamondCutFacet',
    'DiamondLoupeFacet',
    'OwnershipFacet',
    'PoolFactoryFacet',
    'PoolRegistryFacet',
    'TokenFactoryFacet',
    'FeeCollector',
];
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    for (const facet of facets) {
        await deploy(facet, {
            from: deployer,
            args: [],
            log: true,
            autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
            waitConfirmations: network.live ? 3 : 0,
        });
    }
};
export default func;
func.tags = facets;
