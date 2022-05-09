// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Withdraw Poll
* @author Evert Kors <evert@thx.network>
* @notice Extends base polls with withdrawal information.
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import './lib/LibWithdrawPollStorage.sol';
import '../../utils/BasePoll.sol';
import '../PoolRegistry/interfaces/IPoolRegistryFacet.sol';
import '../BasePoll/lib/LibBasePollStorage.sol';
import '../Withdraw/interfaces/IWithdrawPollFacet.sol';
import '../ERC20/lib/LibTokenStorage.sol';
import '../MemberAccess/lib/LibMemberAccessStorage.sol';

contract WithdrawPollFacet is BasePoll, IWithdrawPollFacet {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /**
     * @dev used to check if poll is a withdrawPoll
     */
    modifier isWithdraw() {
        LibBasePollStorage.BasePollStorage storage bData = baseData();

        LibWithdrawPollStorage.WithdrawPollStorage storage wpPollData =
            LibWithdrawPollStorage.withdrawPollStorageId(bData.id);
        require(wpPollData.beneficiary != 0, 'NOT_WITHDRAW_POLL');
        _;
    }

    /**
     * @param _id The ID of the poll that should be finished.
     * @dev callback called after poll finalization
     */
    function onPollFinish(uint256 _id) internal override {
        bool approved = _withdrawPollApprovalState();

        LibWithdrawPollStorage.WithdrawPollStorage storage wpPollData =
            LibWithdrawPollStorage.withdrawPollStorageId(_id);

        if (approved) {
            LibTokenStorage.TokenStorage storage s = LibTokenStorage.tokenStorage();

            IPoolRegistryFacet registry = IPoolRegistryFacet(s.registry);
            uint256 fee = wpPollData.amount.mul(registry.feePercentage()).div(10**18);
            if (fee > 0) {
                // When balance is insufficient, safeTransfer will fail
                // according to its design.
                s.token.safeTransfer(registry.feeCollector(), fee);
                // Skip this check for pools with 0 balance, since these
                // might have connected an TokenUnlimitedAccount.
                if (s.balance != 0 && s.balance >= fee) {
                    s.balance = s.balance.sub(fee);
                }
                emit WithdrawFeeCollected(fee);
            }

            address benef = LibMemberAccessStorage.memberStorage().memberToAddress[wpPollData.beneficiary];
            if (wpPollData.amount > 0) {
                s.token.safeTransfer(benef, wpPollData.amount);
                if (s.balance != 0 && s.balance >= wpPollData.amount) {
                    s.balance = s.balance.sub(wpPollData.amount);
                }
                emit Withdrawn(_id, benef, wpPollData.amount);
            }
        }

        emit WithdrawPollFinalized(_id, approved);
        delete wpPollData.beneficiary;
        delete wpPollData.amount;
        delete wpPollData.unlockDate;
    }

    /**
     * @param _voter Address of the manager account that casts the vote.
     * @dev Only managers can vote for withdrawPolls.
     */
    function voteValidate(address _voter) internal view override {
        require(_isManager(_voter), 'NO_MANAGER');
    }

    /**
     * @param _id ID of the withdrawPoll to get the beneficiary for.
     * @return address of the beneficicary of the reward.
     */
    function getBeneficiary(uint256 _id) external view override returns (uint256) {
        return LibWithdrawPollStorage.withdrawPollStorageId(_id).beneficiary;
    }

    /**
     * @param _id ID of the withdrawPoll to get the reward size for.
     * @return size of the withdrawal.
     */
    function getAmount(uint256 _id) external view override returns (uint256) {
        return LibWithdrawPollStorage.withdrawPollStorageId(_id).amount;
    }

    /**
     * @param _id ID of the withdrawPoll to get the reward size for.
     * @return unlockDate of the withdrawal.
     */
    function getUnlockDate(uint256 _id) external view override returns (uint256) {
        return LibWithdrawPollStorage.withdrawPollStorageId(_id).unlockDate;
    }

    function _withdrawPollVote(bool _agree) external override isWithdraw isSelf {
        vote(_agree);
        emit WithdrawPollVoted(baseData().id, _msgSender(), _agree);
    }

    function _withdrawPollRevokeVote() external override isWithdraw isSelf {
        revokeVote();
        emit WithdrawPollRevokedVote(baseData().id, _msgSender());
    }

    function _withdrawPollFinalize() external override isWithdraw isSelf {
        LibBasePollStorage.BasePollStorage storage bData = baseData();
        LibWithdrawPollStorage.WithdrawPollStorage storage wpPollData =
            LibWithdrawPollStorage.withdrawPollStorageId(bData.id);
        require(block.timestamp > wpPollData.unlockDate, 'TOO_SOON_TO_FINALIZE_THE_POLL');
        finalize();
    }

    function _withdrawPollApprovalState() public view virtual override isWithdraw isSelf returns (bool) {
        LibBasePollStorage.BasePollStorage storage bData = baseData();
        return bData.yesCounter > bData.noCounter;
    }
}
