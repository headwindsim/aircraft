'use strict';

const esbuild = require('esbuild');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..', '..', '..');
const outFile = 'out/headwindsim-aircraft-a330-900/html_ui/JS/A339X/atsu/common.js';

const isProductionBuild = process.env.A32NX_PRODUCTION_BUILD === '1';

esbuild.build({
    absWorkingDir: __dirname,

    define: { DEBUG: 'false' },

    entryPoints: [path.join(rootDir, '../build-common/src/systems/datalink/common/src/index.ts')],
    bundle: true,
    treeShaking: false,
    minify: isProductionBuild,

    outfile: path.join(rootDir, outFile),

    format: 'iife',
    globalName: 'AtsuCommon',

    sourcemap: isProductionBuild ? 'linked' : undefined,

    // Target approximate CoherentGT WebKit version
    target: 'safari11',
});
