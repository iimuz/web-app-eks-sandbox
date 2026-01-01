#!/usr/bin/env bash

set -euo pipefail

jq '.words |= (
  map(ascii_downcase) |
  sort |
  unique
)' cspell.json >cspell.json.tmp &&
  mv cspell.json.tmp cspell.json
pnpm exec prettier --write 'cspell.json'
