#!/bin/bash
# Exit on any errors.
set -e

VERSION=`echo $(node -e "console.log(require('./package.json').version);")`

# Store latest version for hardhat network.
npx hardhat deploy --export exports/hardhat/latest.json

# Deploy and export for all networks.
for NETWORK in mumbaidev maticdev mumbai matic
do
    echo ""
    echo "Deploying to $NETWORK:"
    npx hardhat deploy --network $NETWORK --export exports/$NETWORK/$VERSION.json
done

