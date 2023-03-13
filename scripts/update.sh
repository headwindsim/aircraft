#!/bin/bash

set -ex

cp -rvau ./a32nx/fbw-a32nx/src/behavior/. ./build-a339x/src/behavior
cp -rvau ./a32nx/fbw-a32nx/src/fonts/. ./build-a339x/src/fonts
cp -rvau ./a32nx/fbw-a32nx/src/systems/. ./build-a339x/src/systems
cp -rvau ./a32nx/fbw-a32nx/src/wasm/. ./build-a339x/src/wasm

cp -rvau ./hdw-a339x/.env ./build-a339x/.env
cp -rvau ./hdw-a339x/mach.config.js ./build-a339x/mach.config.js

cp -rvau ./hdw-a339x/src/behavior/. ./build-a339x/src/behavior
cp -rvau ./hdw-a339x/src/model/. ./build-a339x/src/model
cp -rvau ./hdw-a339x/src/systems/. ./build-a339x/src/systems
cp -rvau ./hdw-a339x/src/wasm/. ./build-a339x/src/wasm

cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/CSS/. ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/CSS/A339X
cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Fonts/. ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Fonts/A339X
cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Images/. ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Images/A339X
cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/JS/. ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/JS/A339X
cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/A32NX_Core ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/A339X_Core
cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/A32NX_Utils ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/A339X_Utils
cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/Airliners/FlyByWire_A320_Neo ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/Airliners/Headwind_A339X
cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/FlightElements ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/FlightElements/A339X
cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/MAP ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/MAP/A339X
cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/NavSystems/A320_Neo ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A339X
cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VLivery/Liveries/A32NX_Registration ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/A339X_Registration
cp -rvau ./a32nx/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VLivery/Liveries/Printer ./build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/Printer/A339X

# copy base of A339X to out
cp -rvau ./hdw-a339x/src/base/headwindsim-aircraft-a330-900/. ./build-a339x/out/headwindsim-aircraft-a330-900
cp -rvau ./hdw-a339x/src/base/headwindsim-aircraft-a330-900-lock-highlight/. ./build-a339x/out/headwindsim-aircraft-a330-900-lock-highlight
