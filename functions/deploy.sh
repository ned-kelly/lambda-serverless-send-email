#!/bin/sh

if [ "$REGION" == "" ]; then
    echo "REGION env not found"
    exit 1
fi

if [ "$STAGE" == "" ]; then
    echo "STAGE env not found"
    exit 1
fi

if [ "$AWS_PROFILE" == "" ]; then
    echo "AWS_PROFILE env not found"
    exit 1
fi

# npm install on all functions
echo "Installing packages"
npm install
OUT=$?

if [ $OUT -eq 0 ];then
   echo "Package install complete"
else
   echo "npm install failed"
   exit $OUT
fi

echo "Building webpack"
gulp compile-deploy
OUT=$?

if [ $OUT -eq 0 ];then
   echo "Webpack build complete"
else
   echo "Webpack failed"
   exit $OUT
fi

echo "Deploying serverless stage ${STAGE} to region ${REGION}. Using AWS PROFILE ${AWS_PROFILE}"
serverless deploy --region $REGION --stage $STAGE --verbose
OUT=$?

if [ $OUT -eq 0 ];then
   echo "Deploy complete"
   exit 0
else
   echo "Deploy failed"
   exit $OUT
fi