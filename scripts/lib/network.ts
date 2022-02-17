import { web3 } from 'hardhat';
import { utils } from 'ethers/lib';

const PRIVATE_KEY = '0x873c254263b17925b686f971d7724267710895f1585bb0533db8e693a2af32ff';
const MINIMUM_GAS_LIMIT = 54680;

export const COLLECTOR = '0x960911a62FdDf7BA84D0d3aD016EF7D15966F7Dc';
export const admin = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

export enum FacetCutAction {
    Add = 0,
    Replace = 1,
    Remove = 2,
}

export function getSelectors(contract: any) {
    const signatures = [];
    for (const key of Object.keys(contract.methods)) {
        signatures.push(utils.keccak256(utils.toUtf8Bytes(key)).substr(0, 10));
    }
    return signatures;
}

export async function deployContract(abi: any, bytecode: any, arg: any[]) {
    const contract = new web3.eth.Contract(abi);
    const gas = await contract
        .deploy({
            data: bytecode,
            arguments: arg,
        })
        .estimateGas();
    const data = contract
        .deploy({
            data: bytecode,
            arguments: arg,
        })
        .encodeABI();
    const nonce = await web3.eth.getTransactionCount(admin.address, 'pending');
    const sig = await web3.eth.accounts.signTransaction(
        {
            gas,
            data,
            nonce,
        },
        PRIVATE_KEY,
    );
    const receipt = await web3.eth.sendSignedTransaction(sig.rawTransaction as string);

    contract.options.address = receipt.contractAddress as string;

    return contract;
}

export async function sendTransaction(to: string, fn: any) {
    const from = admin.address;
    const data = fn.encodeABI();
    const estimate = await fn.estimateGas({ from: admin.address });
    const gas = estimate < MINIMUM_GAS_LIMIT ? MINIMUM_GAS_LIMIT : estimate;
    const nonce = await web3.eth.getTransactionCount(admin.address, 'pending');
    const sig = await web3.eth.accounts.signTransaction(
        {
            gas,
            to,
            from,
            data,
            nonce,
        },
        PRIVATE_KEY,
    );

    return await web3.eth.sendSignedTransaction(sig.rawTransaction as string);
}
