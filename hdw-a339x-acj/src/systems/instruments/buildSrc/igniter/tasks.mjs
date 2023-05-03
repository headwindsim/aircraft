import fs from 'fs';
import { join } from 'path';
import { ExecTask } from '@flybywiresim/igniter';
import { Directories } from '../directories.mjs';

export function getInstrumentsIgniterTasks() {
    const baseInstruments = fs.readdirSync(join(Directories.instruments, 'src'), { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(join(Directories.instruments, 'src', d.name, 'config.json')));

    return baseInstruments.map(({ name }) => new ExecTask(
        name,
        `cd build-a339x-acj && mach build -f ${name}`,
        [
            join('build-a339x-acj/src/systems/instruments/src', name),
            'build-a339x-acj/src/systems/instruments/src/Common',
            join('build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/ACJ339X', name),
        ],
    ));
}
