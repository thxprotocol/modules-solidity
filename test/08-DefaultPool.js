const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { getDiamondCuts, deployPoolRegistry, deployDefaultPool } = require('./utils.js');

describe('DefaultPool Deploy implements ERC721Facet', function () {
    let owner, voter;
    let pool, registry, diamondCuts, erc20, erc721;
    const onePercent = ethers.BigNumber.from('10').pow(16);
    before(async function () {
        [owner, collector, recipient, voter] = await ethers.getSigners();
        registry = await deployPoolRegistry(await collector.getAddress(), onePercent);
        diamondCuts = await getDiamondCuts([
            'MemberAccessFacet',
            'ERC20Facet',
            'ERC721Facet',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);
        const ownerAddress = await owner.getAddress();

        const ERC20ExampleToken = await ethers.getContractFactory('ExampleToken');
        erc20 = await ERC20ExampleToken.deploy(ownerAddress, parseEther('1000000'));
        
        const ERC721ExampleToken = await ethers.getContractFactory('NonFungibleToken');
        erc721 = await ERC721ExampleToken.deploy('Planets of the Galaxy', 'NFT', 'https://api.thx.network/v1/metadata/', ownerAddress);
        
        pool = await deployDefaultPool(diamondCuts, registry.address, erc20.address, erc721.address);
    });
    it('should get the ERC20 Token', async function () {
        expect(await pool.getERC20()).to.eq(erc20.address);
    });
    it('should get the ERC721 Token', async function () {
        expect(await pool.getERC721()).to.eq(erc721.address);
    });
    
});
