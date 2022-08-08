import { contractConfig, contractNames, diamondAbi, diamondVariants } from '../exports';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

const dir = path.resolve(__dirname, '..', 'exports', 'abis');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
rimraf.sync(path.join(dir, '*'));

for (const contractName of contractNames) {
    const config = contractConfig('hardhat', contractName);
    if (config) {
        fs.writeFileSync(path.resolve(dir, `${contractName}.json`), JSON.stringify(config.abi, null, 2));
    }
}

fs.writeFileSync(
    path.resolve(dir, `ERC20.json`),
    JSON.stringify(contractConfig('hardhat', 'LimitedSupplyToken'), null, 2),
);
fs.writeFileSync(
    path.resolve(dir, `LimitedSupplyToken.json`),
    JSON.stringify(contractConfig('hardhat', 'LimitedSupplyToken'), null, 2),
);
fs.writeFileSync(
    path.resolve(dir, `UnlimitedSupplyToken.json`),
    JSON.stringify(contractConfig('hardhat', 'UnlimitedSupplyToken'), null, 2),
);
fs.writeFileSync(
    path.resolve(dir, `NonFungibleToken.json`),
    JSON.stringify(contractConfig('hardhat', 'NonFungibleToken'), null, 2),
);

for (const diamondVariant of diamondVariants) {
    const abi = diamondAbi('hardhat', diamondVariant);
    fs.writeFileSync(path.resolve(dir, `${diamondVariant}Diamond.json`), JSON.stringify(abi, null, 2));
}

console.log('Abis extracted and stored.');
