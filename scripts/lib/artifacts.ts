import AccessControl from '../../artifacts/contracts/01-AccessControl/AccessControl.sol/AccessControl.json';
import MemberID from '../../artifacts/contracts/03-MemberAccess/MemberAccess.sol/MemberAccess.json';
import Token from '../../artifacts/contracts/04-Token/Token.sol/Token.json';
import WithdrawArtifact from '../../artifacts/contracts/05-Withdraw/Withdraw.sol/Withdraw.json';
import WithdrawPollArtifact from '../../artifacts/contracts/05-Withdraw/WithdrawPoll.sol/WithdrawPoll.json';
import WithdrawPollProxyArtifact from '../../artifacts/contracts/05-Withdraw/WithdrawPollProxy.sol/WithdrawPollProxy.json';
import RewardArtifact from '../../artifacts/contracts/06-Reward/Reward.sol/Reward.json';
import RewardPollArtifact from '../../artifacts/contracts/06-Reward/RewardPoll.sol/RewardPoll.json';
import RewardPollProxyArtifact from '../../artifacts/contracts/06-Reward/RewardPollProxy.sol/RewardPollProxy.json';
import GasStation from '../../artifacts/contracts/07-GasStation/GasStation.sol/GasStationFacet.json';
import BasePoll from '../../artifacts/contracts/08-BasePoll/BasePollProxy.sol/BasePollProxy.json';
import WithdrawByArtifact from '../../artifacts/contracts/09-WithdrawBypass/WithdrawBy.sol/WithdrawBy.json';
import WithdrawByPollArtifact from '../../artifacts/contracts/09-WithdrawBypass/WithdrawByPoll.sol/WithdrawByPoll.json';
import WithdrawByPollProxyArtifact from '../../artifacts/contracts/09-WithdrawBypass/WithdrawByPollProxy.sol/WithdrawByPollProxy.json';
import RewardByArtifact from '../../artifacts/contracts/10-RewardBypass/RewardBy.sol/RewardBy.json';
import RewardByPollArtifact from '../../artifacts/contracts/10-RewardBypass/RewardByPoll.sol/RewardByPoll.json';
import RewardByPollProxyArtifact from '../../artifacts/contracts/10-RewardBypass/RewardByPollProxy.sol/RewardByPollProxy.json';
import UpdateDiamond from '../../artifacts/contracts/11-UpdateDiamond/UpdateDiamond.sol/UpdateDiamond.json';

import DiamondCutFacetArtifact from '../../artifacts/diamond-2/contracts/facets/DiamondCutFacet.sol/DiamondCutFacet.json';
import DiamondLoupeFacetArtifact from '../../artifacts/diamond-2/contracts/facets/DiamondLoupeFacet.sol/DiamondLoupeFacet.json';
import OwnershipFacetArtifact from '../../artifacts/diamond-2/contracts/facets/OwnershipFacet.sol/OwnershipFacet.json';
import DiamondArtifact from '../../artifacts/diamond-2/contracts/Diamond.sol/Diamond.json';
import AssetPoolFactoryFacetArtifact from '../../artifacts/contracts/AssetPoolFactory/AssetPoolFactoryFacet.sol/AssetPoolFactoryFacet.json';
import PoolRegistryArtifact from '../../artifacts/contracts/PoolRegistry.sol/PoolRegistry.json';

import ERC20Artifact from '../../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import ERC20LimitedSupplyArtifact from '../../artifacts/contracts/util/TokenLimitedSupply.sol/TokenLimitedSupply.json';
import ERC20UnlimitedSupplyArtifact from '../../artifacts/contracts/util/TokenUnlimitedAccount.sol/TokenUnlimitedAccount.json';
import ExampleTokenArtifact from '../../artifacts/contracts/util/ExampleToken.sol/ExampleToken.json';

// Interfaces
import IAssetPoolFactoryArtifact from '../../artifacts/contracts/AssetPoolFactory/IAssetPoolFactory.sol/IAssetPoolFactory.json';
import IDefaultDiamondArtifact from '../../artifacts/contracts/IDefaultDiamond.sol/IDefaultDiamond.json';

export const Artifacts = {
    AccessControl: AccessControl,
    MemberAccess: MemberID,
    Token: Token,
    GasStationFacet: GasStation,
    BasePollProxy: BasePoll,
    UpdateDiamond: UpdateDiamond,
    Withdraw: WithdrawArtifact,
    WithdrawPoll: WithdrawPollArtifact,
    WithdrawPollProxy: WithdrawPollProxyArtifact,
    Reward: RewardArtifact,
    RewardPoll: RewardPollArtifact,
    RewardPollProxy: RewardPollProxyArtifact,
    WithdrawBy: WithdrawByArtifact,
    WithdrawByPoll: WithdrawByPollArtifact,
    WithdrawByPollProxy: WithdrawByPollProxyArtifact,
    RewardBy: RewardByArtifact,
    RewardByPoll: RewardByPollArtifact,
    RewardByPollProxy: RewardByPollProxyArtifact,

    DiamondCutFacet: DiamondCutFacetArtifact,
    DiamondLoupeFacet: DiamondLoupeFacetArtifact,
    OwnershipFacet: OwnershipFacetArtifact,

    AssetPoolFactoryFacet: AssetPoolFactoryFacetArtifact,
    PoolRegistry: PoolRegistryArtifact,

    Diamond: DiamondArtifact,

    IAssetPoolFactory: IAssetPoolFactoryArtifact,
    IDefaultDiamond: IDefaultDiamondArtifact,

    ERC20: ERC20Artifact,
    ERC20LimitedSupply: ERC20LimitedSupplyArtifact,
    ERC20UnlimitedSupply: ERC20UnlimitedSupplyArtifact,

    ExampleToken: ExampleTokenArtifact,
};
