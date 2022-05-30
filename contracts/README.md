# Staking Contract

##### Maintainers

[Almar Gemmel](mailto: Almar.gemmel@hva.nl)
[Mert Gokseli](mailto: mert.gokseli@hva.nl)
[Juriaan de Nijs](mailto: juriaan.de.nijs@hva.nl)
[Davey Zaal](mailto: davey.zaal@hva.nl)
[Daniël van Apeldoorn](mailto: daniel.van.apeldoorn@hva.nl)

StTHX.sol & TokenTimeLock.sol are the contracts that are used for creating a staking mechanism within THX. They make use of ERC20 imports to ensure that an user has the option to stake and receive staked THX(stTHX) which represents the number of tokens invested. The user can choose the duration of the staking which makes the amount invested locked for a given time period. After the staking period the user gets rewarded with fees which are calculated respectfully.

## TokenTimeLock.sol

### Constructor

In the constructor there are 2 parameters given which represent the THX token and stTHX token. An address has to be defined for admin privileges.

### Modifier

For certain functions it is only permissible for the admin to make changes & interactions. You can define this by giving onlyAdmin.

### Deposit

This function is responsible for depositing THX tokens to stake. You give the amount you want to stake and how long these tokens should be locked. The duration has to be in weeks and the amount should be atleast 10 THX or above. When the user stakes, the address of the user is stored in the mapping getAddress.

### Withdraw

The withdraw function is responsible for withdrawing the amount staked THX tokens. This function checks first if the lock period is expired before the user can withdraw the staked amount.

### getAddress

This function is used to get all the people who staked from the list of addresses. This function is not directly used in the smart contract, but it is used in the api to get all addresses of people who staked.

### Allocate

This function is responsible for saving rewards for people who staked. After the calculation of how many rewards a person can get it will be saved with this function so it can be paid out later.

### Payout

This function is used to payout users in the rewardtokens that are available. You have to give the address that will receive the tokens and the address of the token that will be paid out. The value that will be given is the value that has been allocated.

### Events

After the 3 main functions: Deposit, Withdraw and Allocate we also emit events, these events are used to log the transaction on the blockchain and this is also used in our test script to see if it works.

## StTHX.sol

With this contract a user can mint Staked THX (StTHX) which represents the invested amount. With StTHX a user can trade with other users.

### Minters

To be able to mint it is required that the user is allowed to mint StTHX. To get these permissions the contract address of TokenTimeLock must be placed in the minter list. You can also remove addresses from the minter list.

### Burn

After the staking period the StTHX should be burned and converted back to the original invested tokens + gained fees. The burn function should burn an indicated amount.
