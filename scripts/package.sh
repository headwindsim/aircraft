#!/bin/bash

set -ex

# copy from build into PackageSource
cp -rva ./headwind-aircraft-a330-900/. ./src-a339/project/PackageSources

cd /src-a339/package/PackageSources
find . -type f -iname \*.PNG.DDS -delete
find . -type f -iname \*.PNG.DDS.json -delete