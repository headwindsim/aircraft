'use strict';

const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory() ?
            copyDir(srcPath, destPath) :
            fs.copyFileSync(srcPath, destPath);
    }
}

fs.mkdirSync("../src", { recursive: true });
const buildDir = path.resolve(__dirname, '..', 'src');

const a32nxSourcesDir = path.resolve(__dirname, '..', 'a32nx/src');
const customSourcesDir = path.resolve(__dirname, '..', 'src-a339');

copyDir(a32nxSourcesDir, buildDir);
copyDir(customSourcesDir, buildDir);


fs.mkdirSync("../headwind-aircraft-a330-900/html_ui", { recursive: true });
const distDir = path.resolve(__dirname, '..', 'headwind-aircraft-a330-900/html_ui');

const a32nxHtmlUiDir = path.resolve(__dirname, '..', 'a32nx/flybywire-aircraft-a320-neo/html_ui');
const customHtmlUiDir = path.resolve(__dirname, '..', 'src-a339/html_ui');

copyDir(a32nxHtmlUiDir, distDir);
fs.renameSync("../headwind-aircraft-a330-900/html_ui/JS", "../headwind-aircraft-a330-900/html_ui/A339X_JS");
fs.renameSync("../headwind-aircraft-a330-900/html_ui/Fonts", "../headwind-aircraft-a330-900/html_ui/A339X_Fonts");
fs.renameSync("../headwind-aircraft-a330-900/html_ui/CSS", "../headwind-aircraft-a330-900/html_ui/A339X_CSS");

fs.renameSync("../headwind-aircraft-a330-900/html_ui/Pages/A32NX_Core", "../headwind-aircraft-a330-900/html_ui/Pages/A339X_Core");
fs.renameSync("../headwind-aircraft-a330-900/html_ui/Pages/A32NX_Utils", "../headwind-aircraft-a330-900/html_ui/Pages/A339X_Utils");
fs.renameSync("../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A320_Neo", "../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X");
fs.renameSync("../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/Airliners/FlyByWire_A320_Neo", "../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/Airliners/Headwind_A339_Neo");
fs.renameSync("../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/FlightElements", "../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X_FlightElements");
fs.renameSync("../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A320_Neo", "../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A339X");
fs.renameSync("../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/LogicElements", "../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/NavSystems/A339X_LogicElements");
fs.renameSync("../headwind-aircraft-a330-900/html_ui/Pages/VLiveries/Liveries/Printer", "../headwind-aircraft-a330-900/html_ui/Pages/VLiveries/Liveries/A339X_Printer");

copyDir(customHtmlUiDir, distDir);
