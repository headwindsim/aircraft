// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

'use strict';

const esbuild = require('esbuild');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..', '..');
const outFile = 'out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X/ExtrasHost';

const isProductionBuild = process.env.A32NX_PRODUCTION_BUILD === '1';

esbuild.build({
    absWorkingDir: __dirname,

    define: { DEBUG: 'false' },

    entryPoints: ['./index.ts'],
    bundle: true,
    treeShaking: false,
    minify: isProductionBuild,

    outdir: path.join(rootDir, outFile),

    format: 'iife',

    sourcemap: isProductionBuild ? 'linked' : undefined,

    // Target approximate CoherentGT WebKit version
    target: 'safari11',
});
