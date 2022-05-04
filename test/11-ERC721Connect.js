const { expect } = require('chai');
const { diamond, assetPool, getDiamondCuts, createTokenFactory } = require('./utils.js');

describe.only('11 ERC721Connect', function () {
    let owner,
        user,
        erc721,
        factory,
        diamondCuts,
        nftPool,
        baseUrl = 'https://api.thx.network/erc721/0987654321/metadata/';

    before(async function () {
        [owner, user, collector] = await ethers.getSigners();
        factory = await diamond();
        tokenFactory = await createTokenFactory();
        diamondCuts = await getDiamondCuts(['ERC721Connect', 'DiamondCutFacet', 'DiamondLoupeFacet', 'OwnershipFacet']);
        const NonFungibleToken = await ethers.getContractFactory('NonFungibleToken');
        erc721 = await NonFungibleToken.deploy('Planets of the Galaxy', 'NFT', await user.getAddress(), baseUrl);
        nftPool = await assetPool(factory.deployNFTPool(diamondCuts));
    });

    it('can read nft owner', async () => {
        expect(await erc721.owner()).to.eq(await user.getAddress());
    });

    it('can transfer nft ownership', async () => {
        await expect(erc721.connect(user).transferOwnership(nftPool.address)).to.emit(erc721, 'OwnershipTransferred');
    });

    it('can connect erc721 contract', async () => {
        await expect(nftPool.setERC721(erc721.address)).to.emit(nftPool, 'ERC721Updated');
        expect(await nftPool.getERC721()).to.eq(erc721.address);
    });

    it('can mint erc721 from the pool', async () => {
        const uri = '1234567890.json';
        await expect(nftPool.mintFor(await collector.getAddress(), uri)).to.emit(nftPool, 'ERC721Minted');
        expect(await erc721.balanceOf(await collector.getAddress())).to.eq(1);
        expect(await erc721.tokenURI(1)).to.eq(baseUrl + uri);
    });
});
