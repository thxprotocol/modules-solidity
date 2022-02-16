import { ethers } from 'hardhat';

const COLLECTOR = '0x960911a62FdDf7BA84D0d3aD016EF7D15966F7Dc';

export async function main() {
    const factory = await ethers.getContractFactory('PoolRegistry');
    const registry = await factory.deploy(COLLECTOR, 0);

    console.log('Registry:', registry.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
