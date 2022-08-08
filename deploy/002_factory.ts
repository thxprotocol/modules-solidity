import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ADDRESS_ZERO } from '../test/utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { diamond } = deployments;

    const { deployer } = await getNamedAccounts();

    await diamond.deploy('Factory', {
        from: deployer,
        log: true,
        facets: ['FactoryFacet'],
        execute: {
            methodName: 'initialize',
            args: [deployer, ADDRESS_ZERO],
        },
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    return network.live; // Makes sure we don't redeploy on live networks
};
export default func;
func.id = '002_factory';
func.tags = ['Factory'];
