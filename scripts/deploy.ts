import { deployFacets } from './lib/facets';
import { deployAssetPoolFactory } from './lib/assetPoolFactory';
import { deployRegistry } from './lib/registry';
import { deployTokenFactory } from './lib/tokenfactory';

export async function exec() {
    const facets = await deployFacets();
    console.log('Facets:', facets);
    console.log('AssetPoolFactory:', await deployAssetPoolFactory(facets));
    console.log('TokenFactory:', await deployTokenFactory(facets));
    console.log('Registry:', await deployRegistry());
}

exec()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
