import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;

    const deployer = (await hre.getUnnamedAccounts())[0];

    await deploy('PoolRegistry', {
        from: deployer,
        args: ['0x960911a62FdDf7BA84D0d3aD016EF7D15966F7Dc', 0],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    });
};
export default func;
func.tags = ['PoolRegistry'];
