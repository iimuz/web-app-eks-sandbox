#!/usr/bin/env bash

set -eu
set -o pipefail

readonly AWS_PROFILE="$1"

BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name StaticSiteStack \
  --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
  --output text \
  --region us-east-1 \
  "$AWS_PROFILE")

aws s3 sync dist/ s3://$BUCKET_NAME/ --delete "$AWS_PROFILE"
