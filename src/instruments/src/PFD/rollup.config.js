'use strict';

import ts from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import scss from 'rollup-plugin-scss';

const { join } = require('path');

export default {
    input: join(__dirname, 'instrument.tsx'),
    output: {
        dir: '../../../../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A32NX/PFD',
        format: 'es',
    },
    plugins: [scss(
        { output: '../../../../headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A32NX/PFD/pfd.css' },
    ),
    resolve(), ts()],
};
