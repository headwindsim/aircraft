// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

'use strict';

const esbuild = require('esbuild');
const path = require('path');
const { createModuleBuild } = require('#build-utils');

const outFile = 'build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VCockpit/Instruments/A333X/ExtrasHost/index.js';

esbuild.build(createModuleBuild('build-a333x', undefined, path.join(__dirname, './index.ts'), outFile, __dirname));
