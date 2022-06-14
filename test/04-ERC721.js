const { expect } = require('chai');
const { deployNFTPool, getDiamondCuts, deployTokenFactory } = require('./utils.js');

describe('ERC721Facet', function () {
    let owner,
        user,
        erc721,
        diamondCuts,
        nftPool,
        baseUrl = 'https://api.thx.network/v1/metadata/';

    before(async function () {
        [owner, user, collector] = await ethers.getSigners();
        tokenFactory = await deployTokenFactory();
        diamondCuts = await getDiamondCuts([
            'MemberAccessFacet',
            'ERC721Facet',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);
        const NonFungibleToken = await ethers.getContractFactory('NonFungibleToken');
        erc721 = await NonFungibleToken.deploy('Planets of the Galaxy', 'NFT', baseUrl, await owner.getAddress());

        nftPool = await deployNFTPool(diamondCuts, erc721.address);
    });

    it('can read nft owner', async () => {
        expect(await erc721.owner()).to.eq(await owner.getAddress());
    });

    it('can not connect erc721 contract again', async () => {
        await expect(nftPool.setERC721(erc721.address)).to.revertedWith('INIT');
        expect(await nftPool.getERC721()).to.eq(erc721.address);
    });

    it('can grant minter role to pool', async () => {
        const role = await erc721.MINTER_ROLE();
        await expect(erc721.connect(owner).grantRole(role, nftPool.address)).to.emit(erc721, 'RoleGranted');
    });

    it('can NOT mint erc721 if not owner', async () => {
        const uri = '1234567890.json';
        await expect(nftPool.connect(collector).mintFor(await collector.getAddress(), uri)).to.revertedWith(
            'NOT_OWNER',
        );
    });

    it('can mint erc721 from the pool', async () => {
        const uri = '1234567890.json';
        await expect(nftPool.mintFor(await collector.getAddress(), uri)).to.emit(nftPool, 'ERC721Minted');
        expect(await erc721.balanceOf(await collector.getAddress())).to.eq(1);
        expect(await erc721.tokenURI(1)).to.eq(baseUrl + uri);
    });

    it('can transfer nft ownership', async () => {
        await expect(erc721.transferOwnership(await user.getAddress())).to.emit(erc721, 'OwnershipTransferred');
    });
});