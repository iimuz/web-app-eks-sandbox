#!/usr/bin/env bash
#MISE description="Run docker."

set -Eeuo pipefail

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
Usage: ${SCRIPT_NAME} [OPTIONS]

Description:
    Run docker.

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose output (set -x)

EXAMPLES:
    ${SCRIPT_NAME}              # Run docker
    ${SCRIPT_NAME} --verbose    # Run with verbose output
    ${SCRIPT_NAME} --help       # Show this help
EOF
}

function main() {
  local USER_UID=1000
  local USER_GID=1000
  if [[ "$(uname -s)" == "Linux" ]]; then
    USER_UID=$(id -u)
    USER_GID=$(id -g)
  fi
  readonly USER_UID
  readonly USER_GID

  # docker composeのベースコマンド
  local -ar ENV_VARS=(
    "USER_UID=$USER_UID"
    "USER_GID=$USER_GID"
    "GITHUB_TOKEN=$(gh auth token 2>/dev/null || echo '')"
  )
  local -r DOCKER_BASE_CMD=(
    env "${ENV_VARS[@]}"
    docker compose
    --project-directory "$PWD"
  )

  while [[ $# -gt 0 ]]; do
    case $1 in
    build)
      "${DOCKER_BASE_CMD[@]}" --profile dev build
      break
      ;;
    shell)
      "${DOCKER_BASE_CMD[@]}" run --rm -it dev bash
      break
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    -v | --verbose)
      set -x
      shift
      ;;
    *)
      log_error "Unknown option: $1"
      usage
      exit 1
      ;;
    esac
  done
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
