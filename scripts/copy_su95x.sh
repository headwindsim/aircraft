#!/bin/bash

set -ex

df -h

#remove directory if it exist
rm -rf ./build-su95x-common

# copy from FBW COMMON source and HDW COMMON into one src
cp -ra ./flybywire/fbw-common/. ./build-su95x-common
cp -ra ./hdw-su95x-common/. ./build-su95x-common

#remove directory if it exist
rm -rf ./build-su95x

# create directory
mkdir -p ./build-su95x/src
mkdir -p ./build-su95x/out

# copy from FBW A32NX source and SU95X into one src
cp -ra ./flybywire/fbw-a32nx/src/behavior/. ./build-su95x/src/behavior
cp -ra ./flybywire/fbw-a32nx/src/fonts/. ./build-su95x/src/fonts
cp -ra ./flybywire/fbw-a32nx/src/localization/. ./build-su95x/src/localization
cp -rv ./flybywire/fbw-a32nx/src/model/. ./build-su95x/src/model
cp -ra ./flybywire/fbw-a32nx/src/systems/. ./build-su95x/src/systems
cp -ra ./flybywire/fbw-a32nx/src/wasm/. ./build-su95x/src/wasm

cp -ra ./hdw-su95x/.env ./build-su95x/.env
cp -ra ./hdw-su95x/mach.config.js ./build-su95x/mach.config.js

cp -ra ./hdw-su95x/src/behavior/. ./build-su95x/src/behavior
cp -ra ./hdw-su95x/src/localization/. ./build-su95x/src/localization
cp -ra ./hdw-su95x/src/model/. ./build-su95x/src/model
cp -ra ./hdw-su95x/src/systems/. ./build-su95x/src/systems
cp -ra ./hdw-su95x/src/wasm/. ./build-su95x/src/wasm

mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95
mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95-lock-highlight

mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/CSS
mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Fonts
mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Images
mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/JS
mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VCockpit/Instruments/Airliners
mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VCockpit/Instruments/FlightElements
mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VCockpit/Instruments/NavSystems
mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VLivery/Liveries/Printer
mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VLivery/Liveries/Registration

cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/CSS/. ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/CSS/SU95X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Fonts/fbw-a32nx/. ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Fonts/SU95X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Images/fbw-a32nx/. ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Images/SU95X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/JS/fbw-a32nx/. ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/JS/SU95X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/A32NX_Core ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/SU95X_Core
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/A32NX_Utils ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/SU95X_Utils
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/Airliners/FlyByWire_A320_Neo ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VCockpit/Instruments/Airliners/Headwind_SU95X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/FlightElements ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VCockpit/Instruments/FlightElements/SU95X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VCockpit/Instruments/NavSystems/A320_Neo ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VCockpit/Instruments/NavSystems/SU95X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VLivery/Liveries/A32NX_Registration ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VLivery/Liveries/Registration/SU95X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/html_ui/Pages/VLivery/Liveries/A32NX_Printer ./build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VLivery/Liveries/Printer/SU95X


mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95/ModelBehaviorDefs/SU95X
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/ModelBehaviorDefs/A32NX/. ./build-su95x/out/headwindsim-aircraft-su100-95/ModelBehaviorDefs/SU95X

# copy base of SU95X to out
cp -ra ./hdw-su95x/src/base/headwindsim-aircraft-su100-95/. ./build-su95x/out/headwindsim-aircraft-su100-95
cp -ra ./hdw-su95x/src/base/headwindsim-aircraft-su100-95-lock-highlight/. ./build-su95x/out/headwindsim-aircraft-su100-95-lock-highlight

# copy A32NX default texture
mkdir -p ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/A320NEO_AIRFRAME_DECALS_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/A320NEO_AIRFRAME_FUSELAGE_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/A320NEO_AIRFRAME_GLASS_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/A320NEO_AIRFRAME_LIVERY_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/A320NEO_AIRFRAME_RIBBONS_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/A320NEO_COCKPIT_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/CHOCKS_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/CONE_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/CUP_LOW2_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/DECAL_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/DECALS_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/DECALS2_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/EMERG_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/FLYPAD_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/GLASS* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/HONEYWELLJETWAVE_* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra ./flybywire/fbw-a32nx/src/base/flybywire-aircraft-a320-neo/SimObjects/AirPlanes/FlyByWire_A320_NEO/TEXTURE/UNTITLED* ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/
cp -ra './flybywire/fbw-a32nx/src/textures/decals 4k/A320NEO_COCKPIT_DECALSTEXT_ALBD.TIF-master.dds' ./build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable/A320NEO_COCKPIT_DECALSTEXT_ALBD.TIF.dds

chmod +x ./build-su95x/src/wasm/fbw_a320/build.sh
chmod +x ./build-su95x/src/wasm/fadec_a320/build.sh
chmod +x ./build-su95x/src/wasm/flypad-backend/build.sh