// Copyright (c) 2022 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

'use strict';

import ts from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import scss from 'rollup-plugin-scss';

const { join } = require('path');

const root = join(__dirname, '..', '..', '..', '..', '..', '..');

export default {
  input: join(__dirname, 'instrument.tsx'),
  output: {
    file: join(
      root,
      'build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VCockpit/Instruments/SU95X/FCU/instrument.js',
    ),
    format: 'es',
  },
  plugins: [
    scss({
      output: join(
        root,
        'build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VCockpit/Instruments/SU95X/FCU/fcu.css',
      ),
    }),
    resolve(),
    ts(),
  ],
};
