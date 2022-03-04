import dotenv from 'dotenv';
import { extendEnvironment, task } from 'hardhat/config';

import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-web3';
import { parseUnits } from 'ethers/lib/utils';

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go o
// https://hardhat.org/guides/create-task.html
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || '';
const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY || '';
const ETHERSCAN_API = process.env.ETHERSCAN_API || '';

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

extendEnvironment((hre) => {
    const Web3 = require('web3');
    hre.Web3 = Web3;

    // hre.network.provider is an EIP1193-compatible provider.
    hre.web3 = new Web3(hre.network.provider);
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    defaultNetwork: 'hardhat',
    solidity: {
        version: '0.7.4',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {
            accounts: [
                {
                    balance: '100000000000000000000',
                    privateKey: '873c254263b17925b686f971d7724267710895f1585bb0533db8e693a2af32ff',
                },
                {
                    balance: '100000000000000000000',
                    privateKey: '0x97093724e1748ebfa6aa2d2ec4ec68df8678423ab9a12eb2d27ddc74e35e5db9',
                },
                {
                    balance: '100000000000000000000',
                    privateKey: '5a05e38394194379795422d2e8c1d33e90033d90defec4880174c39198f707e3',
                },
                {
                    balance: '100000000000000000000',
                    privateKey: 'eea0247bd059ac4d2528adb36bb0de003d62ba568e3197984b61c41d9a132df0',
                },
            ],
        },
        fork: {
            url: `http://127.0.0.1:8545/`,
            accounts: ['eea0247bd059ac4d2528adb36bb0de003d62ba568e3197984b61c41d9a132df0'],
            timeout: 2483647,
        },
        maticmum: {
            url: `https://polygon-mumbai.infura.io/v3/${INFURA_PROJECT_ID}`,
            accounts: [POLYGON_PRIVATE_KEY],
            timeout: 2483647,
        },
        matic: {
            url: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
            accounts: [POLYGON_PRIVATE_KEY],
            timeout: 2483647,
        },
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: ETHERSCAN_API,
    },
};
