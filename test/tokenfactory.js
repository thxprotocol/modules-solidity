const { expect } = require('chai');
const {
    createTokenFactory,
    nonFungibleTokenContract,
    limitedSupplyTokenContract,
    unlimitedSupplyTokenContract,
} = require('./utils');

describe.only('Unlimited Token factory', function () {
    let factory, owner, receiver;

    before(async function () {
        [owner, receiver] = await ethers.getSigners();
        factory = await createTokenFactory();
    });

    it('Limited Supply', async function () {
        const tokenContract = await limitedSupplyTokenContract(
            factory.deployLimitedSupplyToken('Test Token', 'TST', await owner.getAddress(), 1000),
        );

        expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(1000);
        expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
        expect(await tokenContract.totalSupply()).to.eq(1000);
        expect(await tokenContract.symbol()).to.eq('TST');
        expect(await tokenContract.name()).to.eq('Test Token');
    });

    it('Unlimited Supply', async function () {
        const tokenContract = await unlimitedSupplyTokenContract(
            factory.deployUnlimitedSupplyToken('Test Token', 'TST', await owner.getAddress()),
        );

        expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(0);
        expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
        expect(await tokenContract.totalSupply()).to.eq(0);
        expect(await tokenContract.symbol()).to.eq('TST');
        expect(await tokenContract.name()).to.eq('Test Token');
    });

    it('Non Fungible', async function () {
        const tokenUri = 'https://metadata.thx.network/tokenuri/0.json';
        const tokenContract = await nonFungibleTokenContract(
            factory.deployNonFungibleToken('Test NFT', 'NFT', await owner.getAddress()),
        );

        expect(await tokenContract.name()).to.eq('Test NFT');
        expect(await tokenContract.symbol()).to.eq('NFT');
        expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
        expect(await tokenContract.totalSupply()).to.eq(0);

        expect(tokenContract.connect(receiver).mint(await receiver.getAddress(), tokenUri)).to.revertedWith(
            'ONLY_OWNER',
        );
        expect(tokenContract.mint(await receiver.getAddress(), tokenUri)).to.emit(tokenContract, 'Transfer');

        expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(1);
        expect(await tokenContract.totalSupply()).to.eq(1);
        expect(await tokenContract.tokenURI(1)).to.eq(tokenUri);
    });
});
