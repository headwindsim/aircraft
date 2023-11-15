#!/bin/bash

set -ex

# store current file ownership
ORIGINAL_USER_ID=$(stat -c '%u' /external)
ORIGINAL_GROUP_ID=$(stat -c '%g' /external)

# set ownership to root to fix cargo/rust build (when run as github action)
if [ "${GITHUB_ACTIONS}" == "true" ]; then
  chown -R root:root /external
  rm -rf /external/flybywire
fi

# run build
time npx igniter -c su95x-igniter.config.mjs -r SU95X "$@"

if [ "${GITHUB_ACTIONS}" == "true" ]; then
  rm -rf /external/build-a333x/src
  rm -rf /external/build-a339x/src
  rm -rf /external/build-acj339x/src
  rm -rf /external/build-su95x/src
  rm -rf /external/hdw-a333x/src
  rm -rf /external/hdw-a339x/src
  rm -rf /external/hdw-acj339x/src
  rm -rf /external/hdw-su95x/src
fi

# restore ownership (when run as github action)
if [ "${GITHUB_ACTIONS}" == "true" ]; then
  chown -R ${ORIGINAL_USER_ID}:${ORIGINAL_GROUP_ID} /external
fi