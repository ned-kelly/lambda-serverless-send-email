#!/usr/bin/env bash

UI_PWD=`pwd`
REGION="us-east-1" #default region
STAGE="prod"
AWS_PROFILE="default"

echo "Deploying to $STAGE using AWS PROFILE ${AWS_PROFILE}"

# Build container
docker build -t email-api:local .

# Run deploy
WORKING_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/functions"
echo "Running deploy in container using path ${WORKING_PATH}"
docker run \
    --rm \
    -v "${HOME}/.aws/credentials:/root/.aws/credentials" \
    -v "${WORKING_PATH}:/var/functions" \
    -e STAGE="${STAGE}" \
    -e REGION="${REGION}" \
    -e AWS_PROFILE="${AWS_PROFILE}" \
    -i \
    email-api:local\
    /var/functions/deploy.sh