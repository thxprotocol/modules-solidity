import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';

describe('SharedWallet TEST', function () {
    let owner: Signer, user: Signer, user2: Signer, erc20: Contract, erc721: Contract, sharedWallet: Contract;

    before(async function () {
        [owner, user, user2] = await ethers.getSigners();

        const MockTokenContract = await ethers.getContractFactory('LimitedSupplyToken');
        erc20 = await MockTokenContract.deploy(
            'ExampleERC20',
            'EX20',
            await user.getAddress(),
            ethers.utils.parseEther('10'),
        );
        await erc20.deployed();
        console.log('MockTokenContract DEPLOYED');

        const MockERC721Contract = await ethers.getContractFactory('NonFungibleToken');
        erc721 = await MockERC721Contract.deploy('ExampleERC721', 'EX721', 'baseURI', await user.getAddress());
        await erc721.deployed();
        console.log('MockERC721Contract DEPLOYED');

        const SharedWalletContract = await ethers.getContractFactory('SharedWallet');
        sharedWallet = await SharedWalletContract.deploy(await owner.getAddress());
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
        const receiverAddress = await user.getAddress();
        let tx = await erc20.connect(user).approve(sharedWallet.address, amount);
        await tx.wait();
        tx = await sharedWallet.transferERC20(erc721.address, receiverAddress, amount);
        await tx.wait();

        expect(await erc20.balanceOf(receiverAddress)).to.equal(amount);
    });

    it('Should approveERC721', async function () {
        const ownerAddress = await owner.getAddress();
        const receiverAddress = await user.getAddress();
        let tx = await erc721.mint(ownerAddress, 'tokenURI');
        await tx.wait();
        const tokenId = 1;
        tx = await sharedWallet.approveERC721(erc721.address, receiverAddress, tokenId);
        await tx.wait();

        expect(await erc721.getApproved(tokenId)).to.equal(receiverAddress);
    });
});
