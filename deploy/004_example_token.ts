import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { parseUnits } from 'ethers/lib/utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    await deploy('LimitedSupplyToken', {
        from: deployer,
        args: ['THX Limited Supply Token', 'LIM-THX', deployer, parseUnits('100000000', 'ether')],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    // await deploy('RewardToken1', {
    //     from: deployer,
    //     args: ['THX Limited Supply Token', 'LIM-THX', deployer, parseUnits('100000000', 'ether')],
    //     log: true,
    //     autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    //     waitConfirmations: network.live ? 3 : 0,
    // });
    // await deploy('RewardToken2', {
    //     from: deployer,
    //     args: ['THX Limited Supply Token', 'LIM-THX', deployer, parseUnits('100000000', 'ether')],
    //     log: true,
    //     autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    //     waitConfirmations: network.live ? 3 : 0,
    // });
    // await deploy('RewardToken3', {
    //     from: deployer,
    //     args: ['THX Limited Supply Token', 'LIM-THX', deployer, parseUnits('100000000', 'ether')],
    //     log: true,
    //     autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    //     waitConfirmations: network.live ? 3 : 0,
    // });
    // await deploy('RewardToken4', {
    //     from: deployer,
    //     args: ['THX Limited Supply Token', 'LIM-THX', deployer, parseUnits('100000000', 'ether')],
    //     log: true,
    //     autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    //     waitConfirmations: network.live ? 3 : 0,
    // });

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
          args: ['0x7150A3CC09429583471020A6CE5228A57736180a', '0xB952d9b5de7804691e7936E88915A669B15822ef'],
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
