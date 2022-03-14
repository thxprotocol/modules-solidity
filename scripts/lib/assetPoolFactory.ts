import { web3 } from 'hardhat';
import { admin, FacetCutAction, deployContract, getSelectors, sendTransaction } from './network';
import { Artifacts } from './artifacts';

export async function deployAssetPoolFactory(facetAddresses: any) {
    let factoryDiamond: any[] = [
        Artifacts.DiamondCutFacet,
        Artifacts.DiamondLoupeFacet,
        Artifacts.OwnershipFacet,
        Artifacts.AssetPoolFactoryFacet,
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
    const abi: any = Artifacts.IAssetPoolFactory.abi;
    const factory = new web3.eth.Contract(abi, diamond.options.address);

    await sendTransaction(factory.options.address, factory.methods.initialize());

    return factory.options.address;
}