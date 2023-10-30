#!/bin/bash

set -ex

df -h

#remove directory if it exist
rm -rf ./build-a333x-common

# copy from FBW COMMON source and HDW COMMON into one src
cp -ra ./flybywire/fbw-common/. ./build-a333x-common
cp -ra ./hdw-a333x-common/. ./build-a333x-common

#remove directory if it exist
rm -rf ./build-a333x

# create directory
mkdir -p ./build-a333x/src
mkdir -p ./build-a333x/out

# copy from FBW A32NX source and a333x into one src
cp -ra ./flybywire/fbw-a32nx/src/behavior/. ./build-a333x/src/behavior
cp -ra ./flybywire/fbw-a32nx/src/fonts/. ./build-a333x/src/fonts
cp -ra ./flybywire/fbw-a32nx/src/localization/. ./build-a333x/src/localization
cp -ra ./flybywire/fbw-a32nx/src/systems/. ./build-a333x/src/systems
cp -ra ./flybywire/fbw-a32nx/src/wasm/. ./build-a333x/src/wasm

cp -ra ./hdw-a333x/.env ./build-a333x/.env
cp -ra ./hdw-a333x/mach.config.js ./build-a333x/mach.config.js

cp -ra ./hdw-a333x/src/behavior/. ./build-a333x/src/behavior
cp -ra ./hdw-a333x/src/localization/. ./build-a333x/src/localization
cp -ra ./hdw-a333x/src/model/. ./build-a333x/src/model
cp -ra ./hdw-a333x/src/systems/. ./build-a333x/src/systems
cp -ra ./hdw-a333x/src/wasm/. ./build-a333x/src/wasm

mkdir -p ./build-a333x/out/headwindsim-aircraft-a330-300
mkdir -p ./build-a333x/out/headwindsim-aircraft-a330-300-lock-highlight

mkdir -p ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/CSS
mkdir -p ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Fonts
mkdir -p ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Images
mkdir -p ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/JS
mkdir -p ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VCockpit/Instruments/Airliners
mkdir -p ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VCockpit/Instruments/FlightElements
mkdir -p ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VCockpit/Instruments/NavSystems
mkdir -p ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VLivery/Liveries/Printer
mkdir -p ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VLivery/Liveries/Registration

cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/CSS/. ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/CSS/A333X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Fonts/fbw-a32nx/. ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Fonts/A333X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Images/fbw-a32nx/. ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Images/A333X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/JS/fbw-a32nx/. ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/JS/A333X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/A32NX_Core ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/A333X_Core
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/A32NX_Utils ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/A333X_Utils
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/Airliners/FlyByWire_A320_Neo ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VCockpit/Instruments/Airliners/Headwind_A333X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/FlightElements ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VCockpit/Instruments/FlightElements/A333X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/NavSystems/A320_Neo ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VCockpit/Instruments/NavSystems/A333X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VLivery/Liveries/A32NX_Registration ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VLivery/Liveries/Registration/A333X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VLivery/Liveries/A32NX_Printer ./build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VLivery/Liveries/Printer/A333X

# remove fbw submodule
#rm -rf ./flybywire

# copy base of a333x to out
cp -ra ./hdw-a333x/src/base/headwindsim-aircraft-a330-300/. ./build-a333x/out/headwindsim-aircraft-a330-300
cp -ra ./hdw-a333x/src/base/headwindsim-aircraft-a330-300-lock-highlight/. ./build-a333x/out/headwindsim-aircraft-a330-300-lock-highlight

chmod +x ./build-a333x/src/wasm/fbw_a320/build.sh
chmod +x ./build-a333x/src/wasm/fadec_a330/build.sh
chmod +x ./build-a333x/src/wasm/flypad-backend/build.sh