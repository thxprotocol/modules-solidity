import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { diamond } = deployments;

    const deployer = (await hre.getUnnamedAccounts())[0];

    await diamond.deploy('IAssetPoolFactory', {
        from: deployer,
        log: true,
        facets: ['AssetPoolFactoryFacet'],
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    });
};
export default func;
func.tags = ['IAssetPoolFactory'];
