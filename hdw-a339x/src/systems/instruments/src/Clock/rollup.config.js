'use strict';

import ts from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import scss from 'rollup-plugin-scss';

const { join } = require('path');

const root = join(__dirname, '..', '..', '..', '..', '..', '..');

export default {
    input: join(__dirname, 'instrument.tsx'),
    output: {
        file: join(root, 'hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X/Clock/instrument.js'),
        format: 'es',
    },
    plugins: [
        scss({ output: join(root, 'hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X/Clock/clock.css') }),
        resolve(),
        ts(),
    ],
};
