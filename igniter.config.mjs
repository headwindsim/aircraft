import { ExecTask, TaskOfTasks } from '@flybywiresim/igniter';
import { getInstrumentsIgniterTasks } from './src/instruments/buildSrc/igniter/tasks.mjs';

export default new TaskOfTasks('a32nx', [
    new TaskOfTasks('build', [
        new TaskOfTasks('instruments', getInstrumentsIgniterTasks(), true),
        new ExecTask('failures','npm run build:failures', ['src/failures', 'headwind-a330-900/html_ui/JS_A339/generated/failures.js']),
        new ExecTask('behavior','node src/behavior/build.js', ['src/behavior', 'headwind-a330-900/ModelBehaviorDefs/A339X/generated']),
        new ExecTask('systems', [
            'cargo build --target wasm32-wasi --release',
            'wasm-opt -O3 -o headwind-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/systems.wasm target/wasm32-wasi/release/systems.wasm',
        ], ['src/systems', 'Cargo.lock', 'Cargo.toml', 'headwind-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/systems.wasm']),
        new ExecTask('systems-autopilot', [
            'src/fbw/build.sh',
            'wasm-opt -O1 -o headwind-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fbw.wasm headwind-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fbw.wasm'
        ], ['src/fbw', 'headwind-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fbw.wasm']),
        new ExecTask('systems-fadec', [
            'src/fadec/build.sh',
            'wasm-opt -O1 -o headwind-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fadec.wasm headwind-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fadec.wasm'
        ], ['src/fadec', 'headwind-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fadec.wasm']),
    ], true),

    new TaskOfTasks('dist', [
        new ExecTask('manifests', 'node scripts/build.js'),
        new ExecTask('metadata', 'bash scripts/metadata.sh'),
    ]),
]);
