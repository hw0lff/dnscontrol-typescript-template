#!/usr/bin/env bash
set -euo pipefail

zone_dir="$1"

check_opts=(
  -k fail
  -m fail
  -M fail
  -n fail
  -r fail
  -S fail
)

function faint() {
  echo -n -e "\x1b[2m$1\x1b[0m"
}
function magenta() {
  echo -n -e "\x1b[35m$1\x1b[0m"
}
function cyan() {
  echo -n -e "\x1b[36m$1\x1b[0m"
}

echo -e '\x1b[1m# Validating compliance of zone files\x1b[0m'

for zone_file in "$zone_dir"/*.zone; do
  zone="${zone_file/#*\//}"
  zone="${zone/%.zone/}"
  echo -e "\x1b[1;4m## Checking zone $(cyan "$zone") of $(faint "$zone_dir/")$(magenta "$zone.zone")"
  named-checkzone "${check_opts[@]}" "$zone" "$zone_file"
done
