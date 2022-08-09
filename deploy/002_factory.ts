import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { contractConfig, currentVersion } from '../exports';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { diamond } = deployments;
    const { owner } = await getNamedAccounts();
    const { address } = contractConfig('hardhat', 'Registry', currentVersion);

    await diamond.deploy('Factory', {
        from: owner,
        log: true,
        facets: ['FactoryFacet'],
        execute: {
            methodName: 'initialize',
            args: [owner, address],
        },
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    return network.live; // Makes sure we don't redeploy on live networks
};
export default func;
func.id = '002_factory';
func.tags = ['Factory'];
