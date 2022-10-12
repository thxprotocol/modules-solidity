import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { ethers, upgrades } from 'hardhat';
import { MANAGER_ROLE } from './utils';

describe('SharedWallet TEST', function () {
    let owner,
        user: Signer,
        user2: Signer,
        erc20: Contract,
        erc721: Contract,
        sharedWallet: Contract,
        contractOwnerAddress: string;

    before(async function () {
        [owner, user2] = await ethers.getSigners();

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
        sharedWallet = await upgrades.deployProxy(SharedWalletContract, [contractOwnerAddress]);
        await sharedWallet.deployed();
        console.log('SharedWallet DEPLOYED');
    });

    it('Should approveERC20', async function () {
        const amount = ethers.utils.parseEther('1');
        const receiverAddress = await user2.getAddress();

        const tx = await sharedWallet.approveERC20(erc20.address, receiverAddress, amount);
        await tx.wait();

        expect(await erc20.allowance(sharedWallet.address, receiverAddress)).to.equal(amount);
    });

    it('Should transferERC20', async function () {
        const amount = ethers.utils.parseEther('1');
        const receiverAddress = await user2.getAddress();
        let tx = await erc20.approve(sharedWallet.address, amount);
        await tx.wait();
        tx = await sharedWallet.transferERC20(erc20.address, receiverAddress, amount);
        await tx.wait();

        expect(await erc20.balanceOf(receiverAddress)).to.equal(amount);
    });

    it('Should approveERC721', async function () {
        const tokenId = 1;
        const receiverAddress = await user2.getAddress();

        let tx = await erc721.mint(contractOwnerAddress, 'tokenURI');
        await tx.wait();

        console.log('ownerOf', await erc721.ownerOf(tokenId));
        tx = await sharedWallet.approveERC721(erc721.address, receiverAddress, tokenId);
        await tx.wait();

        expect(await erc721.getApproved(tokenId)).to.equal(receiverAddress);
    });

    it('Should transferERC721', async function () {
        const receiverAddress = await user2.getAddress();

        let tx = await erc721.mint(contractOwnerAddress, 'tokenURI');
        await tx.wait();
        const tokenId = 1;
        tx = await erc721.approve(sharedWallet.address, tokenId);
        await tx.wait();
        tx = await sharedWallet.transferERC721(erc721.address, receiverAddress, tokenId);
        await tx.wait();

        expect(await erc721.ownerOf(tokenId)).to.equal(receiverAddress);
    });

    it('Should grant a Manager Role', async function () {
        const receiverAddress = await user2.getAddress();
        await sharedWallet.grantRole(MANAGER_ROLE, receiverAddress);

        expect(await sharedWallet.hasRole(MANAGER_ROLE, receiverAddress)).to.equal(true);
    });

    it('Should revoke a Manager Role', async function () {
        const receiverAddress = await user2.getAddress();
        await sharedWallet.revokeRole(MANAGER_ROLE, receiverAddress);

        expect(await sharedWallet.hasRole(MANAGER_ROLE, receiverAddress)).to.equal(false);
    });
});
