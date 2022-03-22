import { currentVersion, networkNames, TNetworkName } from '../exports';
import * as fs from 'fs';
import * as path from 'path';

const availableVersions = (network: TNetworkName): string[] => {
    if (network === 'hardhat') return [currentVersion];
    const list = fs.readdirSync(path.resolve(__dirname, '../exports', network));
    return list.map((filename: any) => filename.substring(0, filename.length - 5)).filter((v) => v !== 'versions');
};

for (const networkName of networkNames) {
    const versions = availableVersions(networkName as TNetworkName);
    fs.writeFileSync(path.resolve(__dirname, '../exports', networkName, 'versions.json'), JSON.stringify(versions));
}
