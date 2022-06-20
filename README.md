# Diamond Facets &amp; Factories

Maintainer:
[Peter Polman](mailto:peter@thx.network)

Support:
[THX Discord](https://discord.com/invite/TzbbSmkE7Y)
[THX Slack](https://thx.page.link/slack)

Default Asset Pools are connected to an ERC20 contract. The pool is controlled by a permissioned (OAuth2.0) REST API which is responsible for paying the gas costs used to manage the pool. Access to the pool is managed with a flexible role-based access mechanism. Pools can hold various reward configurations for the connected ERC20 tokent contract and will manage the distribution of those token rewards with a withdrawal system. The poll system used to govern the reward configuration and withdrawals is optional.

## Running network localhost

```
npx hardhat node
```

## Deployment

Deploy facets, factory and registry on localhost network.

```
sh ./scripts/publish.sh [major, minor, nonce] (default=patch)
```

## Diamonds

Pools are build and managed using the Nick Mudges [Diamonds](https://github.com/ethereum/EIPs/issues/2535) concept. Listen to Nick explain them in [this interview](https://www.youtube.com/watch?v=64VfajtPGJ4). 

Reasons for diamonds implementation:

-   No contract size limit
-   Deterministic contract addresses
-   Maintain contract functionality after upgrade

## Pool Factory

The pool factory is used to deploy asset pools from a single source and keep track of them. IDefaultDiamond.sol contains the full interface the initally deployed asset pool.

## Pool Registry

The registry is used to expose settings that go for all asset pools. Future development will make this contract governable.

## Fee Collector

The Fee Collector address is set in the registry and will receive the deposit fee as configured in the registry.

## Tests

All the meaningfull logic in the contracts is and should be covered with tests. Run the tests with `npm test`. Read the test scripts to get more insight into the facet features.
