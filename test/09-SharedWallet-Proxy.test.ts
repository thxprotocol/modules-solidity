import { expect } from 'chai';
import { BigNumber, Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';

describe('SharedWallet TEST MANUALLY DEPLOY PROXY', function () {
    let owner: any,
        user: Signer,
        user2: Signer,
        user3: Signer,
        contractOwnerAddress: string,
        receiverAddress: string,
        transferAmount: BigNumber,
        tokenId: number,
        sharedWallet: Contract;

    before(async function () {
        [owner, user, user2, user3] = await ethers.getSigners();

        contractOwnerAddress = await owner.getAddress();
        receiverAddress = await user.getAddress();
        transferAmount = ethers.utils.parseEther('1');
        tokenId = 1;

        // DEPLOY THE IMPLEMENTATION
        const SharedWalletContract = await ethers.getContractFactory('SharedWallet');
        const implementation = await SharedWalletContract.deploy();
        await implementation.deployed();

        // DEPLOY THE PROXY
        const SharedWalletProxyContract = await ethers.getContractFactory('SharedWalletProxy');
        const proxy = await SharedWalletProxyContract.deploy();
        await proxy.deployed();

        // // DEPLOY THE FACTORY
        // const SharedWalletProxyFactoryContract = await ethers.getContractFactory('SharedWalletProxyFactory');
        // const factory = await SharedWalletProxyFactoryContract.deploy();
        // await factory.deployed();

        // CALL INITIALIZAION ON BOTH CONTRACTS
        await implementation.initialize(contractOwnerAddress);
        await proxy.initialize(implementation.address);

        // EXPOSE THE SHAREDWALLET FUNCTIONS
        sharedWallet = SharedWalletContract.attach(proxy.address); //SharedWalletContract.attach(await factory.createProxy());

        console.log('sharedWallet', sharedWallet);
        console.log('OWNER', await sharedWallet.owner());
    });
    it('Should deploy', async function () {
        expect(await sharedWallet.owner()).to.equal(contractOwnerAddress);
    });
});
