#!/bin/bash

set -ex

#remove directory if it exist
rm -rvf ./hdw-a339x/out
rm -rvf ./build/a339x

# copy from FBW A32NX source and A339X into one src

mkdir -p ./build/a339x

cp -rva ./a32nx/fbw-a32nx/src/behavior/. ./build/a339x/behavior
cp -rva ./a32nx/fbw-a32nx/src/fonts/. ./build/a339x/fonts
cp -rva ./a32nx/fbw-a32nx/src/systems/. ./build/a339x/systems
cp -rva ./a32nx/fbw-a32nx/src/wasm/. ./build/a339x/wasm

cp -rva ./hdw-a339x/src/behavior/. ./build/a339x/behavior
cp -rva ./hdw-a339x/src/model/. ./build/a339x/model
cp -rva ./hdw-a339x/src/systems/. ./build/a339x/systems
cp -rva ./hdw-a339x/src/wasm/. ./build/a339x/wasm

mkdir -p ./hdw-a339x/out/headwindsim-aircraft-a330-900
mkdir -p ./hdw-a339x/out/headwindsim-aircraft-a330-900-lock-highlight

cp -rva ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/. ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui

# rename origin to fit for A339X
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/JS ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Fonts ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_FONTS
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/CSS ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_CSS
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Images ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_Images
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/A32NX_Core ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/A339X_Core
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/A32NX_Utils ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/A339X_Utils
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A32NX ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/Airliners/FlyByWire_A320_Neo ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/Airliners/Headwind_A339X
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/FlightElements ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X_FlightElements
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A320_Neo ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A339X
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/MAP ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X_MAP
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/A32NX_Registration ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/A339X_Registration
mv ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/Printer ./hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/A339X_Printer


# copy base of A339X to out
cp -rva ./hdw-a339x/src/base/headwindsim-aircraft-a330-900/. ./hdw-a339x/out/headwindsim-aircraft-a330-900
cp -rva ./hdw-a339x/src/base/headwindsim-aircraft-a330-900-lock-highlight/. ./hdw-a339x/out/headwindsim-aircraft-a330-900-lock-highlight

chmod +x ./build/a339x/wasm/fbw_a320/build.sh
chmod +x ./build/a339x/wasm/fadec_a320/build.sh
chmod +x ./build/a339x/wasm/flypad-backend/build.sh