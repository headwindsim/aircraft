// Copyright (c) 2023 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable no-console */

'use strict';

const fs = require('fs');
const path = require('path');

const fileExtension = '.locPak';
const workingDir = path.resolve('msfs');
const outFolder = '../../out/headwindsim-aircraft-a330-900';

console.log('Updating translations files.');

/**
 * This function is a safety net to check the JSON of the language files.
 * It is probably not required as Localazy should always provide valid JSON files.
 * @param fileName {string} file to process
 * @returns {boolean} true if file was processed successfully, false otherwise
 */
function processFile(fileName) {
    console.log(`Processing file: ${fileName} ...`);

    // Read Localazy json file
    let content;
    try {
        content = fs.readFileSync(path.join(workingDir, fileName));
    } catch (e) {
        console.error(`Error while reading language file "${fileName}": ${e}`);
        return false;
    }

    // Parse JSON to check if file syntax is correct
    let json;
    try {
        json = JSON.parse(content);
    } catch (e) {
        console.error(`Error while checking json language file "${fileName}": ${e}`);
        return false;
    }

    // Change fileName of file to match the language code
    if (fileName === 'zh-Hans-CN.locPak') {
        console.log(`Renaming file ${fileName} to zh-CN`);
        fileName = 'zh-CN.locPak';
    }

    // Write json file to filesystem
    try {
        // write to the localization/locPak folder
        fs.writeFileSync(path.join(workingDir, `${fileName}`), JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(`Error while writing file "${fileName}": ${e}`);
        return false;
    }

    console.log(`Copying file ${fileName} to ${outFolder}`);
    try {
        fs.copyFileSync(path.join(workingDir, `${fileName}`), path.join(outFolder, `${fileName}`));
    } catch (e) {
        console.error(`Error while copying file "${fileName}": ${e}`);
        return false;
    }

    console.log(`Successfully completed file: ${fileName}`);
    return true;
}

let result = true;
let readdirSync;
try {
    readdirSync = fs.readdirSync(path.join(workingDir), { withFileTypes: true });
} catch (e) {
    console.error(`Error while reading folder "${path.join(workingDir)}": ${e}`);
    process.exit(1);
}
for (const dirent of readdirSync) {
    if (dirent.isFile() && dirent.name.endsWith(fileExtension)) {
        const fileName = dirent.name;
        if (!processFile(fileName)) {
            result = false;
        }
    }
}

console.log('Copying en-US.locPak to out folder');
try {
    fs.copyFileSync(path.join(workingDir, 'en-US.locPak'), path.join(outFolder, 'en-US.locPak'));
} catch (e) {
    console.error(`Error while copying file "en-US.locPak": ${e}`);
    result = false;
}