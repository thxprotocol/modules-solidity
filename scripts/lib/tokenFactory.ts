import { web3 } from 'hardhat';
import { admin, FacetCutAction, deployContract, getSelectors, sendTransaction } from './network';
import { Artifacts } from './artifacts';

export async function deployTokenFactory(facetAddresses: any) {
    let factoryDiamond: any[] = [
        Artifacts.DiamondCutFacet,
        Artifacts.DiamondLoupeFacet,
        Artifacts.OwnershipFacet,
        Artifacts.TokenFactoryFacet,
    ];

    factoryDiamond = factoryDiamond.map((artifact) => {
        const facetAddress = facetAddresses[artifact.contractName];
        const facet = new web3.eth.Contract(artifact.abi, facetAddress);

        return {
            action: FacetCutAction.Add,
            facetAddress,
            functionSelectors: getSelectors(facet),
        };
    });
    const diamond = await deployContract(Artifacts.Diamond.abi, Artifacts.Diamond.bytecode, [
        factoryDiamond,
        [admin.address],
    ]);

    return diamond.options.address;
}
