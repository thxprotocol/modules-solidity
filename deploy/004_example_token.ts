import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { parseUnits } from 'ethers/lib/utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    const feeCollector = '0x3eF13AcF26776BfEd682732ae34cBC86bb355862';

    await deploy('LimitedSupplyToken', {
        from: deployer,
        args: ['THX Limited Supply Token', 'LIM-THX', deployer, parseUnits('10000000', 'ether')],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    await deploy('LimitedSupplyToken', {
        from: deployer,
        args: ['ExampleToken1', 'thx1', feeCollector, parseUnits('1000', 'ether')],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });
    await deploy('LimitedSupplyToken', {
        from: deployer,
        args: ['ExampleToken2', 'thx2', feeCollector, parseUnits('1000', 'ether')],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });
    await deploy('LimitedSupplyToken', {
        from: deployer,
        args: ['ExampleToken3', 'thx3', feeCollector, parseUnits('1000', 'ether')],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });
    await deploy('LimitedSupplyToken', {
        from: deployer,
        args: ['ExampleToken4', 'thx4', feeCollector, parseUnits('1000', 'ether')],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    await deploy('UnlimitedSupplyToken', {
        from: deployer,
        args: ['THX Unlimited Supply Token', 'UNL-THX', [deployer], deployer],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    await deploy('StTHX', {
        from: deployer,
        args: ['Staked THX Token', 'stTHX', [deployer], deployer],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    await deploy('TokenTimeLock', {
        from: deployer,
        args: ['0x8B219D3d1FC64e03F6cF3491E7C7A732bF253EC8', '0xB952d9b5de7804691e7936E88915A669B15822ef'],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    await deploy('NonFungibleToken', {
        from: deployer,
        args: ['THX Non Fungible Token', 'NFT-THX', deployer, 'https://api.thx.network/metadata/'],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    return network.live; // Makes sure we don't redeploy on live networks
};
export default func;
func.id = '004_example_token';
func.tags = ['LimitedSupplyToken'];
