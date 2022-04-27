#!/bin/bash

set -ex

# copy from fbw source
ls
cp -rva ./a32nx/src/. /src
cp -rva ./src-a339/. /src

cp -rva ./a32nx/flybywire-aircraft-a320-neo/html_ui/. ./headwind-aircraft-a330-900/html_ui

mv ./headwind-aircraft-a330-900/html_ui/JS ./headwind-aircraft-a330-900/html_ui/A339X_JS
mv ./headwind-aircraft-a330-900/html_ui/Fonts ./headwind-aircraft-a330-900/html_ui/A339X_Fonts
mv ./headwind-aircraft-a330-900/html_ui/CSS ./headwind-aircraft-a330-900/html_ui/A339X_CSS

mv ./headwind-aircraft-a330-900/html_ui/Pages/A32NX_Core ./headwind-aircraft-a330-900/html_ui/Pages/A339X_Core
mv ./headwind-aircraft-a330-900/html_ui/Pages/A32NX_Utils ./headwind-aircraft-a330-900/html_ui/Pages/A339X_Utils
mv ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A320_Neo ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X
mv ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/Airliners/FlyByWire_A320_Neo ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/Airliners/Headwind_A339_Neo
mv ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/FlightElements ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X_FlightElements
mv ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A320_Neo ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A339X
mv ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/LogicElements ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A339X_LogicElements
mv ./headwind-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/Printer ./headwind-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/A339X_Printer

cp -rva ./src-a339/html_ui/. ./headwind-aircraft-a330-900/html_ui

chmod +x ./src/fbw/build.sh
chmod +x ./src/fadec/build.sh

# store current file ownership
ORIGINAL_USER_ID=$(stat -c '%u' /external)
ORIGINAL_GROUP_ID=$(stat -c '%g' /external)

# set ownership to root to fix cargo/rust build (when run as github action)
if [ "${GITHUB_ACTIONS}" == "true" ]; then
  chown -R root:root /external
fi

# run build
npx igniter "$@"

# restore ownership (when run as github action)
if [ "${GITHUB_ACTIONS}" == "true" ]; then
  chown -R ${ORIGINAL_USER_ID}:${ORIGINAL_GROUP_ID} /external
fi
