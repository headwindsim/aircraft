// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

'use strict';

const esbuild = require('esbuild');
const path = require('path');
const { createModuleBuild } = require('#build-utils');

const rootDir = path.join(__dirname, '..', '..', '..', '..', '..');
const outFile = 'build-a333x/out/headwindsim-aircraft-a330-300/html_ui/JS/A333X/atsu/common.js';

const srcDir = 'build-a333x-common/src/systems/datalink/common';

esbuild.build(createModuleBuild('build-a333x', 'AtsuCommon', path.join(rootDir, srcDir, '/src/index.ts'), outFile, path.join(rootDir, srcDir)));