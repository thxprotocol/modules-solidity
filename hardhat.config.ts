import dotenv from 'dotenv';
import Web3 from 'web3';
import { extendEnvironment } from 'hardhat/config';

import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-web3';

import 'hardhat-deploy';

dotenv.config();

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || '';
const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY || '';
const ETHERSCAN_API = process.env.ETHERSCAN_API || '';

extendEnvironment((hre) => {
    hre.Web3 = Web3;
    hre.web3 = new Web3(hre.network.provider as any);
});

const config: any = {
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
        localtest: {
            url: `http://127.0.0.1:8545/`,
        },
        localtest2: {
            url: `http://127.0.0.1:8545/`,
        },
        fork: {
            url: `http://127.0.0.1:8545/`,
            accounts: ['eea0247bd059ac4d2528adb36bb0de003d62ba568e3197984b61c41d9a132df0'],
            timeout: 2483647,
        },
    },
    paths: {
        sources: 'contracts',
    },
};

if (POLYGON_PRIVATE_KEY && INFURA_PROJECT_ID) {
    config.networks.maticmum = {
        url: `https://polygon-mumbai.infura.io/v3/${INFURA_PROJECT_ID}`,
        accounts: [POLYGON_PRIVATE_KEY],
        timeout: 2483647,
    };
    config.networks.matic = {
        url: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        accounts: [POLYGON_PRIVATE_KEY],
        timeout: 2483647,
    };
}

if (ETHERSCAN_API) {
    config.etherscan = {
        apiKey: ETHERSCAN_API,
    };
}

module.exports = config;
