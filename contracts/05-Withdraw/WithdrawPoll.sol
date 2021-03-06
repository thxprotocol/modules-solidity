//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "diamond-2/contracts/libraries/LibDiamond.sol";

// Implements
import "../util/BasePoll.sol"; // TMP1, TMP 6
import "../TMP/TMP6/LibBasePollStorage.sol";
import "../TMP/TMP7/IWithdrawPoll.sol";
import "../TMP/TMP7/LibWithdrawPollStorage.sol";

// depends on
import "../TMP/TMP5/LibTokenStorage.sol";
import "../TMP/TMP2/LibMemberAccessStorage.sol";

contract WithdrawPoll is BasePoll, IWithdrawPoll {
    modifier isWithdraw {
        LibBasePollStorage.BasePollStorage storage bData = baseData();


            LibWithdrawPollStorage.WithdrawPollStorage storage wpPollData
         = LibWithdrawPollStorage.withdrawPollStorageId(bData.id);

        require(wpPollData.beneficiary != 0, "NOT_WITHDRAW_POLL");
        _;
    }

    /**
     * @dev callback called after poll finalization
     */
    function onPollFinish(uint256 _id) internal override {
        bool approved = _withdrawPollApprovalState();


            LibWithdrawPollStorage.WithdrawPollStorage storage wpPollData
         = LibWithdrawPollStorage.withdrawPollStorageId(_id);

        if (approved) {
            IERC20 token = LibTokenStorage.tokenStorage().token;
            address benef = LibMemberAccessStorage
                .memberStorage()
                .memberToAddress[wpPollData.beneficiary];
            token.transfer(benef, wpPollData.amount);
            emit Withdrawn(_id, benef, wpPollData.amount);
        }

        emit WithdrawPollFinalized(_id, approved);
        delete wpPollData.beneficiary;
        delete wpPollData.amount;
    }

    function voteValidate(bool _agree, address _voter) internal override {
        require(_isManager(_voter), "NO_MANAGER");
    }

    function getBeneficiary(uint256 _id)
        public
        override
        view
        returns (uint256)
    {
        return LibWithdrawPollStorage.withdrawPollStorageId(_id).beneficiary;
    }

    function getAmount(uint256 _id) public override view returns (uint256) {
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

    function _withdrawPollApprovalState()
        public
        virtual
        override
        view
        isWithdraw
        returns (bool)
    {
        LibBasePollStorage.BasePollStorage storage bData = baseData();
        return bData.yesCounter > bData.noCounter;
    }
}
