#!/bin/bash

set -ex

git config --global --add safe.directory "*"

# initialize submodule
git submodule update --init --recursive

cd /external

for arg in "$@"; do
  if [ "$arg" = "--clean" ]; then
    echo "Removing node_modules..."
    rm -rf node_modules/
  fi
done

npm ci