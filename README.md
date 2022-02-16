# THX Asset Pool Modules

Maintainer: [Peter Polman](mailto:peter@thx.network) - [THX Discord](https://discord.gg/6n6QK8Qk) - [THX Slack](https://thx.page.link/slack)

Default Asset Pools are connected to an ERC20 contract. The pool is controlled by a permissioned (OAuth2.0) REST API which is responsible for paying the gas costs used to manage the pool. Access to the pool is managed with a flexible role-based access mechanism. Pools can hold various reward configurations for the connected ERC20 tokent contract and will manage the distribution of those token rewards with a withdrawal system. The poll system used to govern the reward configuration and withdrawals is optional.

## Running localhost network

```
npx hardhat node
```

## Deployemt

Deploy facets, factory and registry on localhost network

```
npm run deploy
```

## Diamonds

Asset Pools are build and managed using the Nick Mudges [Diamonds](https://github.com/ethereum/EIPs/issues/2535) concept. Listen to Nick explain them in [this interview](https://www.youtube.com/watch?v=64VfajtPGJ4). To increase the maintainability of the diamond facets we have grouped facets into modules that indicate the dependencies to one and other. Since we plan on opening up the contract layer to new module proposals we have named them TMP's: THX Module Proposals.

Reasons for diamonds implementation:

-   No contract size limit
-   Stable contract addresses
-   Maintain contract functionality

## Module System

Asset Pool Module implementations follow standards defined in a [TMP (THX Module Proposal)](https://github.com/thxprotocol/modules). This system is used to validate implementations and keep track of the dependencies of modules. Modules contain contractual agreements in terms of interface, storage and events that the implementation should obide to.

## Factory

The asset pool factory is used to deploy asset pools from a single source and keep track of them. IDefaultDiamond.sol contains the full interface the initally deployed asset pool.

## [WIP] Registry

The registry is used to expose settings that go for all asset pools. Future development will make this contract governable.

## [WIP] Fee Collector

The Fee Collector address is set in the registry and will receive the deposit fee as configured in the registry.

## Tests

All the meaningfull logic in the contracts is covered with tests. Run the tests with `npx hardhat test`. Read the test scripts to get more insight into the asset pool features.
