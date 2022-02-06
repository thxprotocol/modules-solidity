async function main() {
    [owner] = await ethers.getSigners();
    const contractIds = [
        'AccessControl',
        'MemberAccess',
        'Token',
        'BasePollProxy',
        'Withdraw',
        'WithdrawPoll',
        'WithdrawPollProxy',
        'WithdrawBy',
        'WithdrawByPoll',
        'WithdrawByPollProxy',
        'Reward',
        'RewardPoll',
        'RewardPollProxy',
        'RewardBy',
        'RewardByPoll',
        'RewardByPollProxy',
        'DiamondCutFacet',
        'OwnershipFacet',
        'UpdateDiamondFacet',
    ];
    for (const contractId of contractIds) {
        const contract = await ethers.getContractFactory(contractId);
        console.log(contractId, (await contract.deploy()).address);
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
