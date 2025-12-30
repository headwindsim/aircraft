// Copyright (c) 2022, 2025 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

'use strict';

const fs = require('fs');
const path = require('path');

const { cyrb53_bytes } = require(path.resolve(__dirname, 'hash.js'));

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

const A339X_SRC = path.resolve(__dirname, '..', 'hdw-a339x/src');
const A339X_OUT = path.resolve(__dirname, '..', 'build-a339x/out/headwindsim-aircraft-a330-900');

const HASHED_FILES = [
  'SimObjects/Airplanes/Headwind_A330neo/engines.cfg',
  'SimObjects/Airplanes/Headwind_A330neo/flight_model.cfg',
  'SimObjects/Airplanes/Headwind_A330neo/systems.cfg',

  'html_ui/Pages/VCockpit/Instruments/A339X/MCDU/mcdu.js',
  'html_ui/Pages/VCockpit/Instruments/A339X/ND/nd.js',
  'html_ui/Pages/VCockpit/Instruments/A339X/PFD/pfd.js',

  'SimObjects/Airplanes/Headwind_A330neo/model/A330_NEO_INTERIOR.xml',

  'SimObjects/Airplanes/Headwind_A330neo/panel/fadec-a339x.wasm',
  'SimObjects/Airplanes/Headwind_A330neo/panel/fbw.wasm',
  'SimObjects/Airplanes/Headwind_A330neo/panel/systems.wasm',
];

function createHashFiles(baseDir) {
  const hashes = {};

  for (const file of HASHED_FILES) {
    const buf = fs.readFileSync(path.resolve(baseDir, file));
    hashes[file] = cyrb53_bytes(buf, 339);
  }

  const dataDir = path.resolve(baseDir, 'html_ui/Data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(path.resolve(dataDir, 'a339x_hashes.json'), JSON.stringify(hashes));
}

function createPackageFiles(baseDir, manifestBaseFilename) {
  const contentEntries = [];
  let totalPackageSize = 0;

  for (const filename of readdir(baseDir)) {
      const stat = fs.statSync(filename, { bigint: true });
      contentEntries.push({
        path: path.relative(baseDir, filename.replace(path.sep, '/')),
        size: Number(stat.size),
        date: Number(stat.mtimeNs / 100n + MS_FILETIME_EPOCH),
      });
      totalPackageSize += Number(stat.size);
  }

  fs.writeFileSync(
    path.join(baseDir, 'layout.json'),
    JSON.stringify(
      {
        content: contentEntries,
      },
      null,
      2,
    ),
  );

  const manifestBase = require(path.join(A339X_SRC, 'base', manifestBaseFilename));

fs.writeFileSync(
    path.join(baseDir, 'manifest.json'),
    JSON.stringify(
      {
        ...manifestBase,
        title: manifestBase.title + titleSuffix,
        package_version: packageInfo.version + `-${buildInfo?.commitHash}`,
        total_package_size: totalPackageSize.toString().padStart(20, '0'),
      },
      null,
      2,
    ),
  );
}

createHashFiles(A339X_OUT);
createPackageFiles(A339X_OUT, 'manifest-base.json');
createPackageFiles(A339X_OUT + '-lock-highlight', 'manifest-base-lock-highlight.json');
