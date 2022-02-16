import { ethers } from 'hardhat';

import { deployFacets } from './lib/facets';
import { deployFactory } from './lib/factory';
import { deployRegistry } from './lib/registry';

export async function exec() {
    console.log('Facets:', await deployFacets());
    console.log('Factory:', await deployFactory());
    console.log('Registry:', await deployRegistry());
}

exec()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
