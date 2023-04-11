#!/bin/bash

set -ex

git config --global --add safe.directory "*"

# initialize submodule (a32nx)
git submodule update --init --recursive

cd /external
rm -rf node_modules
npm ci