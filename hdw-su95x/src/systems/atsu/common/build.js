// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

'use strict';

const esbuild = require('esbuild');
const path = require('path');
const { createModuleBuild } = require('#build-utils');

const rootDir = path.join(__dirname, '..', '..', '..', '..', '..');
const outFile = 'build-su95x/out/headwindsim-aircraft-su100-95/html_ui/JS/SU95X/atsu/common.js';

const srcDir = 'build-su95x-common/src/systems/datalink/common';

esbuild.build(createModuleBuild('build-su95x', 'AtsuCommon', path.join(rootDir, srcDir, '/src/index.ts'), outFile, path.join(rootDir, srcDir)));
