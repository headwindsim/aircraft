// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable no-console */

'use strict';

const fs = require('fs');
const path = require('path');

const workingDir = path.resolve('data');
const headwindFilesPath = path.resolve('data/Headwind');

function processFile(dirent) {
    const name = dirent.name.replace('.json', '');

    console.log(`Processing file: ${name}.json ...`);

    // Read Localazy json file
    let content;
    try {
        content = fs.readFileSync(path.join(workingDir, dirent.name));
    } catch (e) {
        console.error(`Error while reading language file "${dirent.name}": ${e}`);
        return false;
    }

    // Parse JSON to check if file syntax is correct
    let json;
    try {
        json = JSON.parse(content);
    } catch (e) {
        console.error(`Error while checking json language file "${dirent.name}": ${e}`);
        return false;
    }

    // Read Headwind json file
    let headwindContent;
    try {
        headwindContent = fs.readFileSync(path.join(headwindFilesPath, dirent.name));
    } catch (e) {
        console.error(`Error while reading headwind language file "${dirent.name}": ${e}`);
        return false;
    }

    // Parse Headwind JSON to check if file syntax is correct
    let headwindJson;
    try {
        headwindJson = JSON.parse(headwindContent);
    } catch (e) {
        console.error(`Error while checking headwind json language file "${dirent.name}": ${e}`);
        return false;
    }

    // Write ts file to filesystem
    try {
        const mergedJson = {
            ...json,
            ...headwindJson
        };

        fs.writeFileSync(path.join(workingDir, `${name}.json`), JSON.stringify(mergedJson, null, 2));
    } catch (e) {
        console.error(`Error while writing file "${dirent.name}": ${e}`);
        return false;
    }

    console.log(`Successfully completed file: ${name}.json`);
    return true;
}

let result = true;
let readdirSync;
try {
    readdirSync = fs.readdirSync(workingDir, { withFileTypes: true });
} catch (e) {
    console.error(`Error while reading folder "${workingDir}": ${e}`);
    process.exit(1);
}

console.log('Updating translations files.');
for (const dirent of readdirSync) {
    if (dirent.isFile() && dirent.name.endsWith('.json')) {
        if (!processFile(dirent)) {
            result = false;
        }
    }
}