#!/bin/bash
# Exit on any errors.
set -e

npm version --no-git-tag --silent ${1:-patch} 

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

git add . 
git commit -m"Publish: Deployed and exported version $VERSION"

TAG=v$VERSION
git tag $TAG
git push $TAG

echo "Ready to package and push to NPM"

