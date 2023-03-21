#!/bin/bash

set -ex

#remove directory if it exist
rm -rvf ./build-a339x

# copy from FBW A32NX source and A339X into one src

mkdir -p ./build-a339x/src
mkdir -p ./build-a339x/out

cp -rva ./a32nx/fbw-a32nx/src/behavior/. ./build-a339x/src/behavior
cp -rva ./a32nx/fbw-a32nx/src/fonts/. ./build-a339x/src/fonts
cp -rva ./a32nx/fbw-a32nx/src/systems/. ./build-a339x/src/systems
cp -rva ./a32nx/fbw-a32nx/src/wasm/. ./build-a339x/src/wasm

cp -rva ./hdw-a339x/.env ./build-a339x/.env
cp -rva ./hdw-a339x/mach.config.js ./build-a339x/mach.config.js

cp -rva ./hdw-a339x/src/behavior/. ./build-a339x/src/behavior
cp -rva ./hdw-a339x/src/model/. ./build-a339x/src/model
cp -rva ./hdw-a339x/src/systems/. ./build-a339x/src/systems
cp -rva ./hdw-a339x/src/wasm/. ./build-a339x/src/wasm
cp -rva ./hdw-a339x/src/.eslintrc.js ./build-a339x/src/.eslintrc.js

mkdir -p ./build-a339x/out/headwindsim-aircraft-a330-900
mkdir -p ./build-a339x/out/headwindsim-aircraft-a330-900-lock-highlight

mkdir -p ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/CSS
mkdir -p ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Fonts
mkdir -p ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Images
mkdir -p ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/JS
mkdir -p ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/Airliners
mkdir -p ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/FlightElements
mkdir -p ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems
mkdir -p ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/Printer
mkdir -p ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/Registration

cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/CSS/. ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/CSS/A339X
cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Fonts/fbw-a32nx/. ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Fonts/A339X
cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Images/fbw-a32nx/. ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Images/A339X
cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/JS/fbw-a32nx/. ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/JS/A339X
cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/A32NX_Core ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/A339X_Core
cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/A32NX_Utils ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/A339X_Utils
cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/Airliners/FlyByWire_A320_Neo ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/Airliners/Headwind_A339X
cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/FlightElements ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/FlightElements/A339X
cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/NavSystems/A320_Neo ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A339X
cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VLivery/Liveries/A32NX_Registration ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/Registration/A339X
cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VLivery/Liveries/A32NX_Printer ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/Printer/A339X

# copy base of A339X to out
cp -rva ./hdw-a339x/src/base/headwindsim-aircraft-a330-900/. ./build-a339x/out/headwindsim-aircraft-a330-900
cp -rva ./hdw-a339x/src/base/headwindsim-aircraft-a330-900-lock-highlight/. ./build-a339x/out/headwindsim-aircraft-a330-900-lock-highlight

chmod +x ./build-a339x/src/wasm/fbw_a320/build.sh
chmod +x ./build-a339x/src/wasm/fadec_a320/build.sh
chmod +x ./build-a339x/src/wasm/flypad-backend/build.sh
