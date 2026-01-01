#!/usr/bin/env bash
#MISE description="Run linters and format checks."

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
Usage: ${SCRIPT_NAME} [OPTIONS]

Description:
    Run linters and format checks.

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose output (set -x)

EXAMPLES:
    ${SCRIPT_NAME}              # Run linters and format checks
    ${SCRIPT_NAME} --verbose    # Run with verbose output
    ${SCRIPT_NAME} --help       # Show this help
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

  pnpm exec eslint .
  pnpm exec prettier --check '**/*.{js,json,jsonc,jsonl,md,mjs,toml,ts,tsx,yml,yaml}'
  find . -name "*.sh" -type f \
    ! -path "**/node_modules/*" \
    -exec pnpm exec shellcheck -x {} +
  pnpm exec cspell lint . --no-progress

  # 各 workspace のチェック実行
  mise run -C awscdk lint
  mise run -C console lint
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
