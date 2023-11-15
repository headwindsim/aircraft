// Copyright (c) 2022 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

'use strict';

const fs = require('fs');
const path = require('path');

function* readdir(d) {
    for (const dirent of fs.readdirSync(d, { withFileTypes: true })) {
        if (['layout.json', 'manifest.json'].includes(dirent.name)) {
            continue;
        }
        const resolved = path.join(d, dirent.name);
        if (dirent.isDirectory()) {
            yield* readdir(resolved);
        } else {
            yield resolved;
        }
    }
}

const buildInfo = require('./git_build_info').getGitBuildInfo();
const packageInfo = require('../package.json');

let titlePostfix;
if (packageInfo.edition === 'stable') {
    titlePostfix = 'Stable';
} else if (buildInfo?.branch === 'main') {
    titlePostfix = 'Development';
} else if (buildInfo?.branch === 'experimental') {
    titlePostfix = 'Experimental';
} else if (buildInfo?.isPullRequest) {
    titlePostfix = `PR #${buildInfo?.ref}`;
} else {
    titlePostfix = `branch ${buildInfo?.branch}`;
}
const titleSuffix = ` (${titlePostfix})`;

const MS_FILETIME_EPOCH = 116444736000000000n;

const SRC = path.resolve(__dirname, '..', 'hdw-su95x/src');
const OUT = path.resolve(__dirname, '..', 'build-su95x/out/headwindsim-aircraft-su100-95');

function createPackageFiles(baseDir, manifestBaseFilename) {
    const contentEntries = [];
    let totalPackageSize = 0;

    for (const filename of readdir(baseDir)) {
        const stat = fs.statSync(filename, { bigint: true });
        contentEntries.push({
            path: path.relative(baseDir, filename.replace(path.sep, '/')),
            size: Number(stat.size),
            date: Number((stat.mtimeNs / 100n) + MS_FILETIME_EPOCH),
        });
        totalPackageSize += Number(stat.size);
    }

    fs.writeFileSync(path.join(baseDir, 'layout.json'), JSON.stringify({
        content: contentEntries,
    }, null, 2));

    const manifestBase = require(path.join(SRC, 'base', manifestBaseFilename));

    fs.writeFileSync(path.join(baseDir, 'manifest.json'), JSON.stringify({
        ...manifestBase,
        title: manifestBase.title + titleSuffix,
        package_version: packageInfo.version + `-${buildInfo?.commitHash}`,
        total_package_size: totalPackageSize.toString().padStart(20, '0'),
    }, null, 2));
}

createPackageFiles(OUT, 'manifest-base.json');
createPackageFiles(OUT + '-lock-highlight', 'manifest-base-lock-highlight.json');
