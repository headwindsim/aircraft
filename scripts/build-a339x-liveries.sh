#!/bin/bash

set -ex

# store current file ownership
ORIGINAL_USER_ID=$(stat -c '%u' /external)
ORIGINAL_GROUP_ID=$(stat -c '%g' /external)

# set ownership to root to fix cargo/rust build (when run as github action)
if [ "${GITHUB_ACTIONS}" == "true" ]; then
  chown -R root:root /external
  rm -rf /external/a32nx
fi

# Loop through the arguments
args=()
for arg in "$@"; do
  # If the argument is "-clean", perform some action
  if [ "$arg" = "-clean" ]; then
    echo "Removing out directories..."
    rm -rf /external/hdw-a339x-liveries/out
  else
    # Otherwise, add the arg it to the new array
    args+=("$arg")
  fi
done

# run build
time npx igniter -r 'a339x-livery-package' "${args[@]}"

if [ "${GITHUB_ACTIONS}" == "true" ]; then
  rm -rf /external/build-a339x/src
  rm -rf /external/build-a339x-acj/src
  rm -rf /external/hdw-a339x-liveries/src
fi

# restore ownership (when run as github action)
if [ "${GITHUB_ACTIONS}" == "true" ]; then
  chown -R ${ORIGINAL_USER_ID}:${ORIGINAL_GROUP_ID} /external
fi