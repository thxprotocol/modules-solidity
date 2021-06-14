// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Withdraw Poll
* @author Evert Kors <evert@thx.network>
* @notice Extends base polls with withdrawal information.
* 
* Dependencies:
* TMP-3 Member ID: https://github.com/thxprotocol/modules/issues/2
* TMP-5 Token: https://github.com/thxprotocol/modules/issues/5
* 
* Implementations:
* TMP-6 Base poll: https://github.com/thxprotocol/modules/issues/6
* TMP-7 Withdrawals: https://github.com/thxprotocol/modules/issues/7
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';

// Implements
import '../util/BasePoll.sol'; // TMP1, TMP 6
import '../TMP/TMP6/LibBasePollStorage.sol';
import '../TMP/TMP7/IWithdrawPoll.sol';
import '../TMP/TMP7/LibWithdrawPollStorage.sol';

// depends on
import '../TMP/TMP5/LibTokenStorage.sol';
import '../TMP/TMP2/LibMemberAccessStorage.sol';

contract WithdrawPoll is BasePoll, IWithdrawPoll {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /**
     * @dev used to check if poll is a withdrawPoll
     */
    modifier isWithdraw {
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

            if (s.balance >= wpPollData.amount) {
                s.balance = s.balance.sub(wpPollData.amount);
            } else {
                revert('Insufficient funds');
            }

            address benef = LibMemberAccessStorage.memberStorage().memberToAddress[wpPollData.beneficiary];
            if (wpPollData.amount > 0) {
                s.token.safeTransfer(benef, wpPollData.amount);
            }
            emit Withdrawn(_id, benef, wpPollData.amount);
        }

        emit WithdrawPollFinalized(_id, approved);
        delete wpPollData.beneficiary;
        delete wpPollData.amount;
    }

    /**
     * @param _agree boolean representing yes or no vote.
     * @param _voter Address of the manager account that casts the vote.
     * @dev Only managers can vote for withdrawPolls.
     */
    function voteValidate(bool _agree, address _voter) internal override {
        require(_isManager(_voter), 'NO_MANAGER');
    }

    /**
     * @param _id ID of the withdrawPoll to get the beneficiary for.
     * @return address of the beneficicary of the reward.
     */
    function getBeneficiary(uint256 _id) public view override returns (uint256) {
        return LibWithdrawPollStorage.withdrawPollStorageId(_id).beneficiary;
    }

    /**
     * @param _id ID of the withdrawPoll to get the reward size for.
     * @return size of the withdrawal.
     */
    function getAmount(uint256 _id) public view override returns (uint256) {
        return LibWithdrawPollStorage.withdrawPollStorageId(_id).amount;
    }

    function _withdrawPollVote(bool _agree) external override isWithdraw {
        vote(_agree);
        emit WithdrawPollVoted(baseData().id, _msgSender(), _agree);
    }

    function _withdrawPollRevokeVote() external override isWithdraw {
        revokeVote();
        emit WithdrawPollRevokedVote(baseData().id, _msgSender());
    }

    function _withdrawPollFinalize() external override isWithdraw {
        finalize();
    }

    function _withdrawPollApprovalState() public view virtual override isWithdraw returns (bool) {
        LibBasePollStorage.BasePollStorage storage bData = baseData();
        return bData.yesCounter > bData.noCounter;
    }
}
