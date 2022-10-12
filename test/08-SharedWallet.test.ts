import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { ethers, upgrades } from 'hardhat';
import { MANAGER_ROLE } from './utils';

describe('SharedWallet TEST', function () {
    let owner,
        user: Signer,
        user2: Signer,
        user3: Signer,
        erc20: Contract,
        erc721: Contract,
        sharedWalletProxy: Contract,
        contractOwnerAddress: string;

    before(async function () {
        [owner, user, user2, user3] = await ethers.getSigners();

        const MockERC20TokenContract = await ethers.getContractFactory('LimitedSupplyToken');
        erc20 = await MockERC20TokenContract.deploy(
            'ExampleERC20',
            'EX20',
            await owner.getAddress(),
            ethers.utils.parseEther('10'),
        );
        await erc20.deployed();
        console.log('MockERC20TokenContract DEPLOYED');
        contractOwnerAddress = getAddress(await owner.getAddress());
        const MockERC721Contract = await ethers.getContractFactory('NonFungibleToken');
        erc721 = await MockERC721Contract.deploy('ExampleERC721', 'EX721', 'baseURI', contractOwnerAddress);
        await erc721.deployed();
        console.log('MockERC721Contract DEPLOYED');

        const SharedWalletContract = await ethers.getContractFactory('SharedWallet');
        sharedWalletProxy = await upgrades.deployProxy(SharedWalletContract, [contractOwnerAddress]);
        await sharedWalletProxy.deployed();
        console.log('SharedWallet DEPLOYED');
    });

    it('Should approveERC20', async function () {
        const amount = ethers.utils.parseEther('1');
        const receiverAddress = await user.getAddress();

        const tx = await sharedWalletProxy.approveERC20(erc20.address, receiverAddress, amount);
        await tx.wait();

        expect(await erc20.allowance(sharedWalletProxy.address, receiverAddress)).to.equal(amount);
    });

    it('Should transferERC20', async function () {
        const amount = ethers.utils.parseEther('1');
        const receiverAddress = await user.getAddress();
        let tx = await erc20.approve(sharedWalletProxy.address, amount);
        await tx.wait();
        tx = await sharedWalletProxy.transferERC20(erc20.address, receiverAddress, amount);
        await tx.wait();

        expect(await erc20.balanceOf(receiverAddress)).to.equal(amount);
    });

    it('Should NOT transferERC20', async function () {
        const amount = ethers.utils.parseEther('1');
        const receiverAddress = await user.getAddress();

        expect(
            sharedWalletProxy.connect(user3).transferERC20(erc20.address, receiverAddress, amount),
        ).to.be.revertedWith('Caller is not a manager');

        await sharedWalletProxy.grantRole(MANAGER_ROLE, await user2.getAddress());

        expect(
            sharedWalletProxy.connect(user2).transferERC20(erc20.address, receiverAddress, amount),
        ).to.be.revertedWith('INSUFFICIENT BALANCE');
    });

    it('Should approveERC721', async function () {
        const tokenId = 1;
        const receiverAddress = await user.getAddress();

        let tx = await erc721.mint(contractOwnerAddress, 'tokenURI');
        await tx.wait();

        console.log('ownerOf', await erc721.ownerOf(tokenId));
        tx = await sharedWalletProxy.approveERC721(erc721.address, receiverAddress, tokenId);
        await tx.wait();

        expect(await erc721.getApproved(tokenId)).to.equal(receiverAddress);
    });

    it('Should transferERC721', async function () {
        const receiverAddress = await user.getAddress();

        let tx = await erc721.mint(contractOwnerAddress, 'tokenURI');
        await tx.wait();
        const tokenId = 1;
        tx = await erc721.approve(sharedWalletProxy.address, tokenId);
        await tx.wait();
        tx = await sharedWalletProxy.transferERC721(erc721.address, receiverAddress, tokenId);
        await tx.wait();

        expect(await erc721.ownerOf(tokenId)).to.equal(receiverAddress);
    });

    it('Should NOT transferERC721', async function () {
        const receiverAddress = await user.getAddress();

        let tx = await erc721.mint(contractOwnerAddress, 'tokenURI');
        await tx.wait();
        const tokenId = 1;

        expect(
            sharedWalletProxy.connect(user3).transferERC721(erc721.address, receiverAddress, tokenId),
        ).to.be.revertedWith('Caller is not a manager');

        expect(await erc721.ownerOf(tokenId)).to.equal(receiverAddress);
    });

    it('Should grant a Manager Role', async function () {
        const receiverAddress = await user.getAddress();
        await sharedWalletProxy.grantRole(MANAGER_ROLE, receiverAddress);

        expect(await sharedWalletProxy.hasRole(MANAGER_ROLE, receiverAddress)).to.equal(true);
    });

    it('Should NOT grant a Manager Role', async function () {
        const receiverAddress = await user.getAddress();
        await sharedWalletProxy.grantRole(MANAGER_ROLE, receiverAddress);

        expect(sharedWalletProxy.connect(user).grantRole(MANAGER_ROLE, receiverAddress)).to.be.revertedWith(
            'Ownable: caller is not the owner',
        );
    });

    it('Should revoke a Manager Role', async function () {
        const receiverAddress = await user.getAddress();
        await sharedWalletProxy.revokeRole(MANAGER_ROLE, receiverAddress);

        expect(await sharedWalletProxy.hasRole(MANAGER_ROLE, receiverAddress)).to.equal(false);
    });

    it('Should NOT revoke a Manager Role', async function () {
        const receiverAddress = await user.getAddress();
        await sharedWalletProxy.grantRole(MANAGER_ROLE, receiverAddress);

        expect(sharedWalletProxy.connect(user).revokeRole(MANAGER_ROLE, receiverAddress)).to.be.revertedWith(
            'Ownable: caller is not the owner',
        );
    });

    it('Should upgrade the contract to Version 2', async function () {
        const SharedWalletContractV2 = await ethers.getContractFactory('SharedWalletV2');
        sharedWalletProxy = await upgrades.upgradeProxy(sharedWalletProxy, SharedWalletContractV2);
        expect(await sharedWalletProxy.isContractUpgraded()).to.equal(true);
    });
});
