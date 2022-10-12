import { Contract } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
enum FacetCutAction {
    Add,
    Replace,
    Remove,
}

const getSelectors = function (contract: Contract) {
    const signatures = [];
    for (const key of Object.keys(contract.functions)) {
        signatures.push(keccak256(toUtf8Bytes(key)).substr(0, 10));
    }
    return signatures;
};

export default async function deployDiamond() {
    const accounts = await ethers.getSigners();
    const contractOwner = accounts[0];

    // deploy DiamondCutFacet
    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
    const diamondCutFacet = await DiamondCutFacet.deploy();
    await diamondCutFacet.deployed();
    console.log('DiamondCutFacet deployed:', diamondCutFacet.address);

    // deploy Diamond
    const Diamond = await ethers.getContractFactory('Diamond');
    const diamond = await Diamond.deploy(contractOwner.address, diamondCutFacet.address);
    await diamond.deployed();
    console.log('Diamond deployed:', diamond.address);

    // deploy DiamondInit
    // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
    // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
    const DiamondInit = await ethers.getContractFactory('DiamondInit');
    const diamondInit = await DiamondInit.deploy();
    await diamondInit.deployed();
    console.log('DiamondInit deployed:', diamondInit.address);

    // deploy facets
    console.log('');
    console.log('Deploying facets');
    const FacetNames = ['DiamondLoupeFacet', 'OwnershipFacet'];
    const cut = [];
    for (const FacetName of FacetNames) {
        const Facet = await ethers.getContractFactory(FacetName);
        const facet = await Facet.deploy();
        await facet.deployed();
        console.log(`${FacetName} deployed: ${facet.address}`);
        cut.push({
            facetAddress: facet.address,
            action: FacetCutAction.Add,
            functionSelectors: getSelectors(facet),
        });
    }

    // upgrade diamond with facets
    console.log('');
    console.log('Diamond Cut:', cut);
    const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address);
    let tx;
    let receipt;
    // call to init function
    let functionCall = diamondInit.interface.encodeFunctionData('init');
    tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall);
    console.log('Diamond cut tx: ', tx.hash);
    receipt = await tx.wait();
    if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    console.log('Completed diamond cut');
    return diamond.address;
}
