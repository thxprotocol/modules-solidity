// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import 'diamond-2/contracts/Diamond.sol';

contract DiamondFactory {

    Diamond public _diamond;

    function createDiamond(address owner, IDiamondCut.FacetCut[] memory _facets) public  {
        require(_facets.length > 0, 'facets array must contains at least one facet');
        Diamond diamond = new Diamond(owner, _facets[0].facetAddress);

        // add the remaining facets of the facets array
        if (_facets.length > 1) {
            IDiamondCut.FacetCut[] memory facets2 = new IDiamondCut.FacetCut[](_facets.length - 1);
            for (uint256 i = 1; i < _facets.length; i++) {
                facets2[i - 1] = _facets[i];
            }
            LibDiamond.diamondCut(facets2, address(0), '');
        }
        _diamond = diamond;
    }

    function getDiamond() public view returns(Diamond) {
        return _diamond;
    }
}