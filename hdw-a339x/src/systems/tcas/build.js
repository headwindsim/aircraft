// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

'use strict';

const esbuild = require('esbuild');
const path = require('path');
const { createModuleBuild } = require('#build-utils');

const outFile = 'build-a339x/out/headwindsim-aircraft-a330-900/html_ui/JS/A339X/tcas/tcas.js';

esbuild.build(createModuleBuild('build-a339x', undefined, path.join(__dirname, 'src/index.ts'), outFile, __dirname));
