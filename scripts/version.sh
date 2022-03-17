#!/bin/bash
# Exit on any errors.
set -e

npm version --no-git-tag --silent ${1:-patch} 

./deploy-export.sh

git add . 
git commit -m"Publish: Deployed and exported version $VERSION"

TAG=v$VERSION
git tag $TAG
git push $TAG

npm run build && npm run compile
echo "Ready to package and push to NPM"

