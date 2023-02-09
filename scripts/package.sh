#!/bin/bash

set -ex

# copy from build into PackageSource
cp -rva ./hdw-a339x/out/headwindsim-aircraft-a330-900/. ./hdw-a339x/src/project/PackageSources

cd /external/hdw-a339x/src/project/PackageSources
find . -type f -iname \*.PNG.DDS -delete
find . -type f -iname \*.PNG.DDS.json -delete
