import { ExecTask, TaskOfTasks } from '@flybywiresim/igniter';
import { getInstrumentsIgniterTasks } from './src/instruments/buildSrc/igniter/tasks.mjs';

export default new TaskOfTasks('a330-900', [
    new TaskOfTasks('build', [
        new TaskOfTasks('instruments', [...getInstrumentsIgniterTasks(), new ExecTask('pfd','npm run build:pfd', ['src/instruments/src/PFD','headwind-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X/PFD'])], true),
        new ExecTask('atsu','npm run build:atsu', ['src/atsu', 'headwind-aircraft-a330-900/html_ui/A339X_JS/atsu']),
        new ExecTask('sentry-client','npm run build:sentry-client', ['src/sentry-client', 'headwind-aircraft-a330-900/html_ui/A339X_JS/sentry-client']),
        new ExecTask('failures','npm run build:failures', ['src/failures', 'headwind-aircraft-a330-900/html_ui/A339X_JS/generated/failures.js']),
        new ExecTask('behavior','node src/behavior/build.js', ['src/behavior', 'headwind-aircraft-a330-900/ModelBehaviorDefs/A339X/generated']),
        new ExecTask('fmgc','npm run build:fmgc', ['src/fmgc', 'headwind-aircraft-a330-900/html_ui/A339X_JS/fmgc']),
        new ExecTask('systems', [
            'cargo build --target wasm32-wasi --release',
            'wasm-opt -O3 -o headwind-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/systems.wasm target/wasm32-wasi/release/a320_systems_wasm.wasm',
        ], ['src/systems', 'Cargo.lock', 'Cargo.toml', 'headwind-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/systems.wasm']),
        new ExecTask('systems-autopilot', [
            'src/fbw/build.sh',
            'wasm-opt -O1 -o headwind-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fbw.wasm headwind-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fbw.wasm'
        ], ['src/fbw', 'headwind-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fbw.wasm']),
        new ExecTask('systems-fadec', [
            'src/fadec/build.sh',
            'wasm-opt -O1 -o headwind-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fadec.wasm headwind-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fadec.wasm'
        ], ['src/fadec', 'headwind-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fadec.wasm']),
        new TaskOfTasks('mcdu-server', [
            new ExecTask('client', ['npm run build:mcdu-client'], ['src/mcdu-server/client', 'src/mcdu-server/client/build']),
            new ExecTask('server', ['npm run build:mcdu-server'], ['src/mcdu-server', 'headwind-aircraft-a330-900/MCDU SERVER/server.exe']),
        ]),
    ], true),

    new TaskOfTasks('dist', [
        new ExecTask('metadata', 'node scripts/metadata.js headwind-aircraft-a330-900 a339x'),
        new ExecTask('manifests', 'node scripts/build.js'),
    ]),
]);
