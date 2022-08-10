#!/bin/bash
# Exit on any errors.
set -e

BASE_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")/.." ; pwd -P )
VERSION=`echo $(node -e "console.log(require('$BASE_DIR/package.json').version);")`

# Remove compiled artifacts so they are built fresh.
rm -rf $BASE_DIR/artifacts

cd $BASE_DIR

# # Store latest version for hardhat network.
npx hardhat deploy --network hardhat --export exports/hardhat/latest.json --reset

# Deploy and export for all networks.
for NETWORK in mumbaidev maticdev mumbai matic
do
    echo ""
    echo "Deploying to $NETWORK:"
    npx hardhat deploy --network $NETWORK --export $BASE_DIR/exports/$NETWORK/$VERSION.json --reset
done

# Exports the latest versions of abis for direct imports.
npx ts-node $BASE_DIR/scripts/write-abis.ts
npx ts-node $BASE_DIR/scripts/write-bytecodes.ts
