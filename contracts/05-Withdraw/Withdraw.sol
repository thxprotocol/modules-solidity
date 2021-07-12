// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Withdraw Proposal
* @author Evert Kors <evert@thx.network>
* @notice Create and propose withdrawals.
* 
* Implementations: 
* TMP-7 Withdrawals: https://github.com/thxprotocol/modules/issues/7
* 
* Dependencies:
* TMP-6 Base Poll: https://github.com/thxprotocol/modules/issues/6
* TMP-2 Member Control: https://github.com/thxprotocol/modules/issues/2
/******************************************************************************/

import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';

// Implements
import '../TMP/TMP7/IWithdraw.sol';
import '../TMP/TMP7/LibWithdrawPollStorage.sol';

// Depends on
import '../TMP/TMP6/LibBasePollStorage.sol';
import '../TMP/TMP2/LibMemberAccessStorage.sol';
import '../util/Access.sol'; // TMP 1

contract Withdraw is Access, IWithdraw {
    /**
     * @notice Proposes a withdraw poll with the default withdrawPollDuration.
     * @param _amount Size of the proposed withdrawal.
     * @param _beneficiary Beneficiary of the reward.
     */
    function proposeWithdraw(uint256 _amount, address _beneficiary) external override {
        // TODO verify amount
        require(_isMember(_msgSender()), 'NOT_MEMBER');
        require(_isMember(_beneficiary), 'NOT_MEMBER');

        _createWithdrawPoll(
            _amount,
            LibWithdrawPollStorage.withdrawStorage().proposeWithdrawPollDuration,
            _beneficiary
        );
    }

    /**
     * @notice Starts a withdraw poll.
     * @param _amount Size of the withdrawal.
     * @param _duration The duration the withdraw poll.
     * @param _beneficiary Beneficiary of the reward.
     */
    function _createWithdrawPoll(
        uint256 _amount,
        uint256 _duration,
        address _beneficiary
    ) internal returns (uint256) {
        LibBasePollStorage.BaseStorage storage bst = LibBasePollStorage.baseStorage();
        bst.pollCounter = bst.pollCounter + 1;

        LibBasePollStorage.BasePollStorage storage baseStorage = LibBasePollStorage.basePollStorageId(bst.pollCounter);

        baseStorage.id = bst.pollCounter;
        baseStorage.startTime = block.timestamp;
        baseStorage.endTime = block.timestamp + _duration;

        LibWithdrawPollStorage.WithdrawPollStorage storage wpStorage = LibWithdrawPollStorage.withdrawPollStorageId(
            bst.pollCounter
        );

        wpStorage.amount = _amount;
        wpStorage.beneficiary = LibMemberAccessStorage.memberStorage().addressToMember[_beneficiary];

        emit WithdrawPollCreated(bst.pollCounter, wpStorage.beneficiary);
        return baseStorage.id;
    }

    /**
     * @param _duration Default duration of the poll for proposed withdrawals.
     */
    function setProposeWithdrawPollDuration(uint256 _duration) external override onlyManager {
        LibWithdrawPollStorage.withdrawStorage().proposeWithdrawPollDuration = _duration;
    }

    /**
     * @return default duration in seconds for polls for proposed withdrawals.
     */
    function getProposeWithdrawPollDuration() external view override returns (uint256) {
        return LibWithdrawPollStorage.withdrawStorage().proposeWithdrawPollDuration;
    }
}
