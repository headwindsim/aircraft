// Copyright (c) 2021-2024 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import fs from 'fs';
import path, { join } from 'path';
import { ExecTask } from '@flybywiresim/igniter';
import { Directories } from '../directories.mjs';

export function getInstrumentsIgniterTasks() {
    const baseInstruments = fs
        .readdirSync(join(Directories.instruments, 'src'), { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(join(Directories.instruments, 'src', d.name, 'config.json')));

    return baseInstruments.map(({ name }) => {
        const instrumentPath = join(Directories.instruments, 'src', name);
        const config = JSON.parse(fs.readFileSync(join(instrumentPath, 'config.json')));
        return new ExecTask(name, `cd build-a339x && mach build -f ${name}`, [
            join('build-a339x/src/systems/instruments/src', name),
            'build-a339x/src/systems/instruments/src/Common',
            join('build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X', name),
            ...(config.extraDeps || []).map((p) =>
                path.isAbsolute(p)
                    ? path.relative('/', p)
                    : path.relative(Directories.root, path.resolve(join(instrumentPath, p))),
            ),
        ]);
    });
}
