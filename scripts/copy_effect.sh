#!/bin/bash

set -ex

#copy and rename effect file when it is changed. Still need to change the texture file name inside the fx file manually
rm -rvf ./hdw-a339x/src/base/headwindsim-aircraft-a330-900/effects

cp -rva ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/effects/. ./hdw-a339x/src/base/headwindsim-aircraft-a330-900/effects

for nam in ./hdw-a339x/src/base/headwindsim-aircraft-a330-900/effects/*A32NX*.fx
do
    newname=${nam/A32NX/A339X}
    mv $nam $newname
done

for nam in ./hdw-a339x/src/base/headwindsim-aircraft-a330-900/effects/texture/*A32NX*
do
    newname=${nam/A32NX/A339X}
    mv $nam $newname
done
