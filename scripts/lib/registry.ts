import { ethers } from 'hardhat';

const COLLECTOR = '0x960911a62FdDf7BA84D0d3aD016EF7D15966F7Dc';

export async function deployRegistry() {
    const factory = await ethers.getContractFactory('PoolRegistry');
    const registry = await factory.deploy(COLLECTOR, 0);

    return registry.address;
}
