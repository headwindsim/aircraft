import fs from 'fs';
import { join } from 'path';
import { ExecTask } from '@flybywiresim/igniter';
import { Directories } from '../directories.mjs';

export function getInputs() {
    const baseInstruments = fs.readdirSync(join(Directories.instruments, 'src'), { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(join(Directories.instruments, 'src', d.name, 'config.json')));

    return baseInstruments.map(({ name }) => ({ path: name, name }));
}

export function getInstrumentsIgniterTasks() {
    const baseInstruments = fs.readdirSync(join(Directories.instruments, 'src'), { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(join(Directories.instruments, 'src', d.name, 'config.json')));


    return baseInstruments.map(({ name }) => new ExecTask(
        name,
        `node src/instruments/buildSrc/igniter/worker.mjs ${name}`,
        [join('src/instruments/src', name), join('headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X', name)],
    ));
}
