import { Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import {
    MINTER_ROLE,
    deployFactory,
    deployRegistry,
    deploy,
    getDiamondCuts,
    findEvent,
    deployToken,
    ADDRESS_ZERO,
} from './utils';
import { parseEther } from 'ethers/lib/utils';

describe('FactoryFacet', function () {
    let registry: Contract, factory: Contract, owner: Signer, collector: Signer, recipient: Signer;

    before(async function () {
        [owner, collector, recipient] = await ethers.getSigners();
        registry = await deployRegistry(await collector.getAddress(), '0');
        factory = await deployFactory(await owner.getAddress(), registry.address);
    });

    describe('ERC20 Limited', async function () {
        const name = 'Test Token',
            symbol = 'TEST',
            totalSupply = parseEther('1000');
        let diamond: Contract, erc20: Contract;

        it('deployERC20()', async function () {
            erc20 = await deployToken('LimitedSupplyToken', [name, symbol, await owner.getAddress(), totalSupply]);

            const diamondCuts = await getDiamondCuts(['RegistryProxyFacet', 'ERC20ProxyFacet']);
            await expect(factory.deploy(diamondCuts, erc20.address, ADDRESS_ZERO)).to.emit(factory, 'DiamondDeployed');
        });
    });

    describe('ERC20 Unlimited', async function () {
        let erc20: Contract;

        it('deployERC20()', async function () {
            erc20 = await deployToken('UnlimitedSupplyToken', ['Test Token', 'TEST', await owner.getAddress()]);

            const diamondCuts = await getDiamondCuts(['RegistryProxyFacet', 'ERC20ProxyFacet']);
            await expect(factory.deploy(diamondCuts, erc20.address, ADDRESS_ZERO)).to.emit(factory, 'DiamondDeployed');
        });

        it('recipient should fail if no minter and no balance', async () => {
            await expect(erc20.connect(recipient).transfer(await owner.getAddress(), 1)).to.be.revertedWith(
                'ERC20: transfer amount exceeds balance',
            );
        });

        it('owner should transfer if minter and no balance', async () => {
            await expect(erc20.transfer(await recipient.getAddress(), 1)).to.emit(erc20, 'Transfer');
        });

        it('recipient should transfer balance', async () => {
            await expect(erc20.connect(recipient).transfer(await owner.getAddress(), 1)).to.emit(erc20, 'Transfer');
        });

        it('owner should grant minter role', async () => {
            expect(await erc20.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(false);
            await expect(erc20.grantRole(MINTER_ROLE, await recipient.getAddress())).to.emit(erc20, 'RoleGranted');
            expect(await erc20.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(true);
        });

        it('recipient should transfer and not fail', async () => {
            expect(await erc20.balanceOf(await recipient.getAddress())).to.eq(0);
            expect(await erc20.balanceOf(await owner.getAddress())).to.eq(1);
            await expect(erc20.connect(recipient).transfer(await owner.getAddress(), 1)).to.emit(erc20, 'Transfer');
            expect(await erc20.balanceOf(await recipient.getAddress())).to.eq(0);
            expect(await erc20.balanceOf(await owner.getAddress())).to.eq(2);
        });

        it('owner should revoke minter role', async () => {
            expect(await erc20.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(true);
            await expect(erc20.revokeRole(MINTER_ROLE, await recipient.getAddress())).to.emit(erc20, 'RoleRevoked');
            expect(await erc20.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(false);
            expect(await erc20.balanceOf(await recipient.getAddress())).to.eq(0);
            await expect(erc20.connect(recipient).transfer(await owner.getAddress(), 1)).to.be.revertedWith(
                'ERC20: transfer amount exceeds balance',
            );
        });
    });

    describe('NFT', function () {
        const baseURI = 'https://api.thx.network/v1/metadata',
            name = 'Test Non Fungible Token',
            symbol = 'TST-NFT';
        let erc721: Contract, diamond: Contract;

        before(async function () {
            erc721 = await deployToken('NonFungibleToken', [name, symbol, baseURI, await owner.getAddress()]);
            const diamondCuts = await getDiamondCuts(['RegistryProxyFacet', 'ERC20ProxyFacet']);
            const tx = await factory.deploy(diamondCuts, ADDRESS_ZERO, erc721.address);
            const event = await findEvent(tx, 'DiamondDeployed');
            diamond = await ethers.getContractAt('IDefaultDiamond', event.args.diamond);
        });

        it('Initial state', async () => {
            expect(await diamond.balanceOf(await owner.getAddress())).to.eq(0);
            expect(await diamond.totalSupply()).to.eq(0);
            expect(await diamond.name()).to.eq(name);
            expect(await diamond.symbol()).to.eq(symbol);
        });

        it('mint', async function () {
            const uri = '/123456789123';

            await expect(diamond.connect(recipient).mint(await recipient.getAddress(), uri)).to.revertedWith(
                'NOT_MINTER',
            );
            await expect(diamond.mint(await recipient.getAddress(), uri)).to.emit(diamond, 'Transfer');

            expect(await diamond.balanceOf(await recipient.getAddress())).to.eq(1);
            expect(await diamond.totalSupply()).to.eq(1);
            expect(await diamond.tokenURI(1)).to.eq(baseURI + uri);
        });

        it('transfer', async function () {
            expect(await diamond.balanceOf(await owner.getAddress())).to.eq(0);
            expect(diamond.connect(recipient).approve(await owner.getAddress(), 1)).to.emit(diamond, 'Approval');
            expect(
                diamond.connect(recipient).transferFrom(await recipient.getAddress(), await owner.getAddress(), 1),
            ).to.emit(diamond, 'Transfer');
            expect(await diamond.balanceOf(await owner.getAddress())).to.eq(1);
            expect(await diamond.balanceOf(await recipient.getAddress())).to.eq(0);
        });

        it('owner should grant minter role', async () => {
            expect(await diamond.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(false);
            await expect(diamond.grantRole(MINTER_ROLE, await recipient.getAddress())).to.emit(diamond, 'RoleGranted');
            expect(await diamond.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(true);
        });

        it('recipient should mint and not fail', async () => {
            const uri = '/123456789123';

            expect(await diamond.balanceOf(await recipient.getAddress())).to.eq(0);
            expect(await diamond.balanceOf(await owner.getAddress())).to.eq(1);
            await expect(diamond.connect(recipient).mint(await owner.getAddress(), uri)).to.emit(diamond, 'Transfer');
            expect(await diamond.balanceOf(await recipient.getAddress())).to.eq(0);
            expect(await diamond.balanceOf(await owner.getAddress())).to.eq(2);
        });

        it('owner should revoke minter role', async () => {
            const uri = '/123456789123';

            expect(await diamond.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(true);
            await expect(diamond.revokeRole(MINTER_ROLE, await recipient.getAddress())).to.emit(diamond, 'RoleRevoked');
            expect(await diamond.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(false);
            expect(await diamond.balanceOf(await recipient.getAddress())).to.eq(0);
            await expect(diamond.connect(recipient).mint(await owner.getAddress(), uri)).to.be.revertedWith(
                'NOT_MINTER',
            );
        });
    });
});
