import { Artifacts } from './artifacts';
import { COLLECTOR, deployContract } from './network';

export async function deployRegistry() {
    const registry = await deployContract(Artifacts.PoolRegistry.abi, Artifacts.PoolRegistry.bytecode, [COLLECTOR, 0]);
    return registry.options.address;
}
