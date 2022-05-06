#!/bin/bash

set -ex

# copy from fbw source and a339 into one src
cp -rva ./a32nx/src/. ./src
cp -rva ./src-a339/. ./src

cp -rva ./a32nx/flybywire-aircraft-a320-neo/html_ui/. ./headwind-aircraft-a330-900/html_ui

# rename origin to fit for a339x
mv ./headwind-aircraft-a330-900/html_ui/JS ./headwind-aircraft-a330-900/html_ui/JS_A339
mv ./headwind-aircraft-a330-900/html_ui/Fonts ./headwind-aircraft-a330-900/html_ui/Fonts_A339
mv ./headwind-aircraft-a330-900/html_ui/CSS ./headwind-aircraft-a330-900/html_ui/CSS_A339
mv ./headwind-aircraft-a330-900/html_ui/Pages/A32NX_Core ./headwind-aircraft-a330-900/html_ui/Pages/A339X_Core
mv ./headwind-aircraft-a330-900/html_ui/Pages/A32NX_Utils ./headwind-aircraft-a330-900/html_ui/Pages/A339X_Utils
mv ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/Airliners/FlyByWire_A320_Neo ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/Airliners/Headwind_A339
mv ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/FlightElements ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/FlightElements_A339
mv ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A320_Neo ./headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A339_Neo
mv ./headwind-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/Printer ./headwind-aircraft-a330-900/html_ui/Pages/VLivery/Liveries/Printer_A339

# copy customs of a339x to package
cp -rva ./src-a339/html_ui/. ./headwind-aircraft-a330-900/html_ui

chmod +x ./src/fbw/build.sh
chmod +x ./src/fadec/build.sh
