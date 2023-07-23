#!/bin/bash

set -ex

# store current file ownership
ORIGINAL_USER_ID=$(stat -c '%u' /external)
ORIGINAL_GROUP_ID=$(stat -c '%g' /external)

echo "Free space before:"
df -h

# set ownership to root to fix cargo/rust build (when run as github action)
if [ "${GITHUB_ACTIONS}" == "true" ]; then
  chown -R root:root /external
  rm -rf /external/a32nx
  rm -rf /external/hdw-a339x-liveries
fi

echo "Free space after:"
df -h

# run build
time npx igniter -r 'A339X' "$@"

if [ "${GITHUB_ACTIONS}" == "true" ]; then
  rm -rf /external/build-a339x/src
  rm -rf /external/build-a339x-acj/src
fi

# restore ownership (when run as github action)
if [ "${GITHUB_ACTIONS}" == "true" ]; then
  chown -R ${ORIGINAL_USER_ID}:${ORIGINAL_GROUP_ID} /external
fi