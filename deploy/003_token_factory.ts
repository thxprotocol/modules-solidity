import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { diamond } = deployments;

    const { deployer } = await getNamedAccounts();

    await diamond.deploy('TokenFactory', {
        from: deployer,
        log: true,
        facets: ['TokenFactoryFacet'],
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    });

    return hre.network.live; // Makes sure we don't redeploy on live networks
};
export default func;
func.id = '003_token_factory';
func.tags = ['TokenFactory'];
