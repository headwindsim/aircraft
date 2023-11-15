// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

'use strict';

const esbuild = require('esbuild');
const path = require('path');
const { createModuleBuild } = require('#build-utils');

const outFile = 'build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VCockpit/Instruments/SU95X/SystemsHost/index.js';

// process.env.FBW_TYPECHECK = "1";

esbuild.build(createModuleBuild('build-su95x', undefined, path.join(__dirname, './index.ts'), outFile, __dirname));
