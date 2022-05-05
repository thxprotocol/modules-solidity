const { expect } = require('chai');
const { keccak256, toUtf8Bytes } = require('ethers/lib/utils');
const { createTokenFactory, limitedSupplyTokenContract, unlimitedSupplyTokenContract } = require('./utils');

describe.only('Token Factory', function () {
    let factory, owner, receiver;

    before(async function () {
        [owner, receiver] = await ethers.getSigners();
        factory = await createTokenFactory();
    });

    describe('Limited Supply', async function () {
        const name = 'Test LimitedToken',
            symbol = 'TST-LST';
        let tokenContract;

        before(async function () {
            [owner, receiver] = await ethers.getSigners();
            tokenContract = await limitedSupplyTokenContract(
                factory.deployLimitedSupplyToken(name, symbol, await owner.getAddress(), 1000),
            );
        });

        it('Initial state', async function () {
            expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(1000);
            expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
            expect(await tokenContract.totalSupply()).to.eq(1000);
            expect(await tokenContract.name()).to.eq(name);
            expect(await tokenContract.symbol()).to.eq(symbol);
        });
    });

    describe('Unlimited Supply', async function () {
        const name = 'Test Unlimited Supply Token',
            symbol = 'TST-UST';
        let tokenContract, minterRole;

        before(async function () {
            [owner, user] = await ethers.getSigners();
            tokenContract = await unlimitedSupplyTokenContract(
                factory.deployUnlimitedSupplyToken(name, symbol, await owner.getAddress()),
            );
            minterRole = await tokenContract.MINTER_ROLE();
        });

        it('Initial state', async () => {
            expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(0);
            expect(await tokenContract.totalSupply()).to.eq(0);
            expect(await tokenContract.name()).to.eq(name);
            expect(await tokenContract.symbol()).to.eq(symbol);
        });

        it('user should fail if no minter and no balance', async () => {
            await expect(tokenContract.connect(user).transfer(await owner.getAddress(), 1)).to.be.revertedWith(
                'ERC20: transfer amount exceeds balance',
            );
        });

        it('owner should transfer if minter and no balance', async () => {
            await expect(tokenContract.transfer(await user.getAddress(), 1)).to.emit(tokenContract, 'Transfer');
        });

        it('user should transfer balance', async () => {
            await expect(tokenContract.connect(user).transfer(await owner.getAddress(), 1)).to.emit(
                tokenContract,
                'Transfer',
            );
        });

        it('owner should grant minter role', async () => {
            expect(await tokenContract.hasRole(minterRole, await user.getAddress())).to.eq(false);
            await expect(tokenContract.grantRole(minterRole, await user.getAddress())).to.emit(
                tokenContract,
                'RoleGranted',
            );
            expect(await tokenContract.hasRole(minterRole, await user.getAddress())).to.eq(true);
        });

        it('user should transfer and not fail', async () => {
            expect(await tokenContract.balanceOf(await user.getAddress())).to.eq(0);
            expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(1);
            await expect(tokenContract.connect(user).transfer(await owner.getAddress(), 1)).to.emit(
                tokenContract,
                'Transfer',
            );
            expect(await tokenContract.balanceOf(await user.getAddress())).to.eq(0);
            expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(2);
        });

        it('owner should revoke minter role', async () => {
            expect(await tokenContract.hasRole(minterRole, await user.getAddress())).to.eq(true);
            await expect(tokenContract.revokeRole(minterRole, await user.getAddress())).to.emit(
                tokenContract,
                'RoleRevoked',
            );
            expect(await tokenContract.hasRole(minterRole, await user.getAddress())).to.eq(false);
            expect(await tokenContract.balanceOf(await user.getAddress())).to.eq(0);
            await expect(tokenContract.connect(user).transfer(await owner.getAddress(), 1)).to.be.revertedWith(
                'ERC20: transfer amount exceeds balance',
            );
        });
    });

    // describe('NFT', function () {
    //     const baseURI = 'https://metadata.thx.network';
    //     let tokenContract;

    //     it('deploy', async function () {
    //         tokenContract = await nonFungibleTokenContract(
    //             factory.deployNonFungibleToken('Test NFT', 'NFT', await owner.getAddress(), baseURI),
    //         );

    //         expect(await tokenContract.name()).to.eq('Test NFT');
    //         expect(await tokenContract.symbol()).to.eq('NFT');
    //         expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
    //         expect(await tokenContract.totalSupply()).to.eq(0);
    //         expect(await tokenContract.baseURI()).to.eq(baseURI);
    //     });
    //     it('mint', async function () {
    //         const path = '/tokenuri/0.json';

    //         expect(tokenContract.connect(receiver).mint(await receiver.getAddress(), path)).to.revertedWith(
    //             'ONLY_OWNER',
    //         );
    //         expect(tokenContract.mint(await receiver.getAddress(), path)).to.emit(tokenContract, 'Transfer');

    //         expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(1);
    //         expect(await tokenContract.totalSupply()).to.eq(1);
    //         expect(await tokenContract.tokenURI(1)).to.eq(baseURI + path);
    //     });
    //     it('transfer', async function () {
    //         expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(0);
    //         expect(tokenContract.connect(receiver).approve(await owner.getAddress(), 1)).to.emit(
    //             tokenContract,
    //             'Approval',
    //         );
    //         expect(
    //             tokenContract.connect(receiver).transferFrom(await receiver.getAddress(), await owner.getAddress(), 1),
    //         ).to.emit(tokenContract, 'Transfer');
    //         expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(1);
    //         expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
    //     });
    // });
});
