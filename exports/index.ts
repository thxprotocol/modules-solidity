import { version as currentVersion } from '../package.json';
import * as fs from 'fs';
import * as path from 'path';
import { AbiItem } from 'web3-utils';

export type TNetworkName = 'mumbai' | 'matic' | 'mumbaidev' | 'maticdev' | 'hardhat';

export interface ContractConfig {
    address: string;
    abi: AbiItem[];
}

export interface ExportJsonFile {
    name: string;
    chainId: string;
    contracts: { [key: string]: ContractConfig };
}

const cache: { [key in TNetworkName]: { versions: string[]; contracts: { [version: string]: ExportJsonFile } } } = {
    hardhat: { versions: [], contracts: {} },
    matic: { versions: [], contracts: {} },
    mumbai: { versions: [], contracts: {} },
    maticdev: { versions: [], contracts: {} },
    mumbaidev: { versions: [], contracts: {} },
};

const getArtifacts = (network: TNetworkName, version: string) => {
    if (!cache[network].contracts[version]) {
        if (!availableVersions(network).includes(version)) {
            throw new Error(`No contracts for version ${version} available for network ${network}`);
        }

        const v = network === 'hardhat' ? 'latest' : version;
        cache[network].contracts[version] = JSON.parse(
            fs.readFileSync(path.resolve(__dirname, './', network, `${v}.json`)).toString(),
        );
    }

    return cache[network].contracts[version];
};

export const contractConfig = (network: TNetworkName, contractName: string, version?: string | undefined) => {
    const artifacts = getArtifacts(network, version || currentVersion);

    return artifacts.contracts[contractName];
};

export const availableVersions = (network: TNetworkName): string[] => {
    if (network === 'hardhat') return [currentVersion];

    if (cache[network].versions.length === 0) {
        const list = fs.readdirSync(path.resolve(__dirname, './', network));
        cache[network].versions = list.map((filename) => filename.substring(0, filename.length - 5));
    }

    return cache[network].versions;
};

export { currentVersion };
