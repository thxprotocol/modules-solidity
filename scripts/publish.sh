#!/bin/bash
# Exit on any errors.
set -e

BUMP=${1:-patch} 
if [ "$BUMP" != "none" ]
then
    npm version --no-git-tag --silent $BUMP
fi

`dirname $BASH_SOURCE`/deploy-export.sh

git add . 
git commit --allow-empty -m"Publish: Deployed and exported version $VERSION"

TAG=v$VERSION
git tag $TAG
git push $TAG

npm run build
npm run compile
npm publish
