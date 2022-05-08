// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/interfaces/IERC173.sol';
import 'diamond-2/contracts/interfaces/IDiamondLoupe.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';
import '../modules/AccessControl/interfaces/IAccessControlFacet.sol';
import '../modules/MemberAccess/interfaces/IMemberID.sol';
import '../modules/BasePoll/interfaces/IBasePollProxyFacet.sol';
import '../modules/ERC20/interfaces/IERC20Facet.sol';
import '../modules/ERC721/interfaces/IERC721Facet.sol';
import '../modules/RelayHub/interfaces/IRelayHubFacet.sol';
import '../modules/Withdraw/interfaces/IWithdrawFacet.sol';
import '../modules/Withdraw/interfaces/IWithdrawPollFacet.sol';
import '../modules/Withdraw/interfaces/IWithdrawPollProxyFacet.sol';
import './IAccessControlEvents.sol';
import './IPoolRoles.sol';

interface IDefaultDiamond is
    IERC173,
    IDiamondLoupe,
    IDiamondCut,
    IAccessControlFacet,
    IAccessControlEvents,
    IMemberID,
    IPoolRoles,
    IERC20Facet,
    IERC721Facet,
    IBasePollProxyFacet,
    IWithdrawFacet,
    IWithdrawPollFacet,
    IWithdrawPollProxyFacet,
    IRelayHubFacet
{
    function setupMockAccess(bytes32[] memory roles, address[] memory addr) external;
}
