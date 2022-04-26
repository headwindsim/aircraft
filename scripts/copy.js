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
const customSourcesDir = path.resolve(__dirname, '..', 'a339-src');


fs.mkdirSync("../headwind-aircraft-a330-900/html_ui", { recursive: true });
const distDir = path.resolve(__dirname, '..', 'headwind-aircraft-a330-900/html_ui');

const a32nxHtmlUiDir = path.resolve(__dirname, '..', 'a32nx/flybywire-aircraft-a320-neo/html_ui');
const customHtmlUiDir = path.resolve(__dirname, '..', 'a339-src/html_ui');


copyDir(a32nxSourcesDir, buildDir);
copyDir(customSourcesDir, buildDir);

copyDir(a32nxHtmlUiDir, distDir);
copyDir(customHtmlUiDir, distDir);
