// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Withdraw Proposal
* @author Evert Kors <evert@thx.network>
* @notice Create and propose withdrawals.
/******************************************************************************/

import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import './interfaces/IWithdrawFacet.sol';
import './lib/LibWithdrawPollStorage.sol';
import '../../utils/Access.sol';
import '../BasePoll/lib/LibBasePollStorage.sol';
import '../MemberAccess/lib/LibMemberAccessStorage.sol';


contract WithdrawFacet is Access, IWithdrawFacet {
    /**
     * @notice Proposes a withdraw poll with the default withdrawPollDuration.
     * @param _amount Size of the proposed withdrawal.
     * @param _beneficiary Beneficiary of the reward.
     * @param _unlockDate Date beyond which it will be possible to withdraw
     */
    function proposeWithdraw(
        uint256 _amount,
        address _beneficiary,
        uint256 _unlockDate
    ) external override onlyOwner {
        require(_amount != 0, 'NOT_VALID');

        _createWithdrawPoll(
            _amount,
            LibWithdrawPollStorage.withdrawStorage().proposeWithdrawPollDuration,
            _beneficiary,
            _unlockDate
        );
    }

    /**
     * @notice Proposes a withdraw poll with the default withdrawPollDuration in bulk.
     * @param _amounts Sizes of the proposed withdrawal.
     * @param _beneficiaries Beneficiaries of the reward.
     * @param _unlockDates Dates beyond which it will be possible to withdraw
     */
    function proposeBulkWithdraw(
        uint256[] memory _amounts,
        address[] memory _beneficiaries,
        uint256[] memory _unlockDates
    ) external override onlyOwner {
        require(_amounts.length != 0, 'INVALID_INPUT');
        require(_beneficiaries.length != 0, 'INVALID_INPUT');
        require(_amounts.length == _beneficiaries.length, 'INVALID_INPUT');

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            require(_amounts[i] != 0, 'NOT_VALID');
            require(_beneficiaries[i] != address(0), 'NOT_VALID');
            _createWithdrawPoll(
                _amounts[i],
                LibWithdrawPollStorage.withdrawStorage().proposeWithdrawPollDuration,
                _beneficiaries[i],
                _unlockDates[i]
            );
        }
    }

    /**
     * @notice Starts a withdraw poll.
     * @param _amount Size of the withdrawal.
     * @param _duration The duration the withdraw poll.
     * @param _beneficiary Beneficiary of the reward.
     * @param _unlockDate Date beyond which it will be possible to withdraw
     */
    function _createWithdrawPoll(
        uint256 _amount,
        uint256 _duration,
        address _beneficiary,
        uint256 _unlockDate
    ) internal returns (uint256) {
        LibBasePollStorage.BaseStorage storage bst = LibBasePollStorage.baseStorage();
        bst.pollCounter = bst.pollCounter + 1;

        LibBasePollStorage.BasePollStorage storage baseStorage = LibBasePollStorage.basePollStorageId(bst.pollCounter);
        baseStorage.id = bst.pollCounter;
        baseStorage.startTime = block.timestamp;
        baseStorage.endTime = block.timestamp + _duration;

        LibWithdrawPollStorage.WithdrawPollStorage storage wpStorage =
            LibWithdrawPollStorage.withdrawPollStorageId(bst.pollCounter);

        LibMemberAccessStorage.MemberStorage storage ms = LibMemberAccessStorage.memberStorage();
        if (!_hasRole(MEMBER_ROLE, _beneficiary)) {
            ms.memberCounter += 1;
            ms.addressToMember[_beneficiary] = ms.memberCounter;
            ms.memberToAddress[ms.memberCounter] = _beneficiary;
            _grantRole(MEMBER_ROLE, _beneficiary);
        }

        wpStorage.beneficiary = ms.addressToMember[_beneficiary];
        wpStorage.amount = _amount;
        wpStorage.unlockDate = _unlockDate;

        emit WithdrawPollCreated(bst.pollCounter, wpStorage.beneficiary);
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
