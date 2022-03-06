// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/libraries/LibDiamond.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';
import '../TMP/TMP10/IUpdateDiamond.sol';
import '../TMP/RelayReceiver.sol';

contract UpdateDiamond is IUpdateDiamond, RelayReceiver {
    /**
     * @notice Used to swap asset pool diamond facets.
     */
    function updateAssetPool(bytes4[] memory _selectors, address _newAddress)
        public
        override
        returns (uint256, bytes32)
    {
        require(LibDiamond.diamondStorage().contractOwner == _msgSender(), 'NOT_OWNER');
        return
            LibDiamond.addReplaceRemoveFacetSelectors(
                0,
                0,
                _newAddress,
                IDiamondCut.FacetCutAction.Replace,
                _selectors
            );
    }
}
