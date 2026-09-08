#!/bin/sh
# grab.sh <asset-uuid> <name> [width] [tileh]
D=/d/work/guides/.audits/assets/landings-2026-09-08
curl -sSL -o "$D/raw-$2.png" "https://www.figma.com/api/mcp/asset/$1.png"
py -3 "$D/slice.py" "$D/raw-$2.png" "$2" "${3:-1000}" "${4:-1300}"
