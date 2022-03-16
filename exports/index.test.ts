import { contractConfig, availableVersions } from '.';

console.log(contractConfig('mumbai', 'AccessControl', '1.0.9'));
console.log(availableVersions('mumbai'));
