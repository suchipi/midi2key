#!/usr/bin/env bash

set -exuo pipefail

npm i

TARGETS=(
  "bun-linux-x64"
  "bun-linux-x64-baseline"
  "bun-linux-arm64"
  "bun-windows-x64"
  "bun-windows-x64-baseline"
  "bun-darwin-x64"
  "bun-darwin-x64-baseline"
  "bun-darwin-arm64"
  "bun-linux-x64-musl"
  "bun-linux-x64-musl-baseline"
  "bun-linux-arm64-musl"
)

rm -rf dist
mkdir -p dist
for TARGET in "${TARGETS[@]}"; do
  bun build --compile --target=$TARGET ./midi2key.js --outfile dist/midi2key-$TARGET
done
