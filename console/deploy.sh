#!/usr/bin/env bash

set -eu
set -o pipefail

readonly AWS_PROFILE="${1:-}"
PROFILE_ARG=""
if [[ -n "$AWS_PROFILE" ]]; then
  PROFILE_ARG="--profile $AWS_PROFILE"
fi

BUCKET_NAME=$(aws ssm get-parameter \
  --name "/dev/service/console/bucket-name" \
  --query "Parameter.Value" \
  --output text \
  --region us-west-2 \
  $PROFILE_ARG)

aws s3 sync dist/ "s3://$BUCKET_NAME/console/" --delete $PROFILE_ARG

DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='Distribution for Dev-Service'].Id" \
  --output text \
  --region us-west-2 \
  $PROFILE_ARG)

if [[ -n "$DIST_ID" && "$DIST_ID" != "None" ]]; then
  echo "Invalidating CloudFront distribution: $DIST_ID"
  aws cloudfront create-invalidation \
    --distribution-id "$DIST_ID" \
    --paths "/*" \
    --region us-west-2 \
    $PROFILE_ARG
else
  echo "CloudFront distribution not found."
fi
