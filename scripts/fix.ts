import { TransactionRequest } from '@ethersproject/abstract-provider';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

const PRICE_OVERRIDE = '500';

async function main() {
    console.log('Start!');
    const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY_DEV || '', ethers.provider);
    const nonce = await ethers.provider.getTransactionCount(await wallet.getAddress());
    const tx: TransactionRequest = {
        to: await wallet.getAddress(),
        value: 0,
        gasPrice: ethers.utils.parseUnits(PRICE_OVERRIDE, 'gwei'),
        gasLimit: BigNumber.from('21000'),
        nonce,
        chainId: 137,
    };
    const signedTX = await wallet.signTransaction(tx);
    const receipt = await ethers.provider.sendTransaction(signedTX);
    console.log(receipt);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
