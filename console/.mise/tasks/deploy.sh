#!/usr/bin/env bash
#MISE description="Deploy console build to S3."

set -E -e -u -o pipefail

SCRIPT_NAME=$(basename "${0}")
readonly SCRIPT_NAME

trap 'err ${LINENO} "$BASH_COMMAND"' ERR
trap cleanup EXIT

function log_info() {
  local _message="$1"
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$SCRIPT_NAME] [INFO] $_message" >&2
}

function log_warn() {
  local _message="$1"
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$SCRIPT_NAME] [WARN] $_message" >&2
}

function log_err() {
  local _message="$1"
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$SCRIPT_NAME] [ERROR] $_message" >&2
}

function err() {
  log_err "Line $1: $2"
  exit 1
}

function cleanup() {
  log_info "Cleanup completed"
}

trap 'err ${LINENO} "$BASH_COMMAND"' ERR
trap cleanup EXIT

function usage() {
  cat <<EOF
Usage: ${SCRIPT_NAME} [OPTIONS] [AWS_PROFILE]

Description:
    Deploy console build to S3.

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose output (set -x)

EXAMPLES:
    ${SCRIPT_NAME}                # Deploy using default AWS profile
    ${SCRIPT_NAME} dev-profile    # Deploy using 'dev-profile' AWS profile
    ${SCRIPT_NAME} --verbose     # Run with verbose output
    ${SCRIPT_NAME} --help        # Show this help
EOF
}

function main() {
  while [[ $# -gt 0 ]]; do
    case $1 in
    -h | --help)
      usage
      exit 0
      ;;
    -v | --verbose)
      set -x
      shift
      ;;
    *)
      echo "[ERROR] Unknown option: $1" >&2
      usage
      exit 1
      ;;
    esac
  done

  local -r AWS_PROFILE="${1:-}"

  local PROFILE_ARG=""
  if [[ -n "$AWS_PROFILE" ]]; then
    PROFILE_ARG="--profile $AWS_PROFILE"
  fi
  readonly PROFILE_ARG

  local BUCKET_NAME
  BUCKET_NAME=$(aws ssm get-parameter \
    --name "/dev/service/console/bucket-name" \
    --query "Parameter.Value" \
    --output text \
    --region us-west-2 \
    "$PROFILE_ARG")
  readonly BUCKET_NAME

  aws s3 sync dist/ "s3://$BUCKET_NAME/console/" --delete "$PROFILE_ARG"

  local DIST_ID
  DIST_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='Distribution for Dev-Service'].Id" \
    --output text \
    --region us-west-2 \
    "$PROFILE_ARG")
  readonly DIST_ID

  if [[ -n "$DIST_ID" && "$DIST_ID" != "None" ]]; then
    echo "Invalidating CloudFront distribution: $DIST_ID"
    aws cloudfront create-invalidation \
      --distribution-id "$DIST_ID" \
      --paths "/*" \
      --region us-west-2 \
      "$PROFILE_ARG"
  else
    echo "CloudFront distribution not found."
  fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
