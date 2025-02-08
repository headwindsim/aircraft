import { ExecTask, TaskOfTasks } from "@flybywiresim/igniter";
import { getInstrumentsIgniterTasks } from "./build-a339x/src/systems/instruments/buildSrc/igniter/tasks.mjs";

export default new TaskOfTasks("all", [
    new TaskOfTasks("A339X", [
        // Prepare the out folder and any other pre tasks.
        // Currently, these can be run in parallel but in the future, we may need to run them in sequence if there are any dependencies.
        new TaskOfTasks("preparation", [
            new TaskOfTasks("copy", [
                new ExecTask("textures-cockpit", "npm run build-a339x:copy-textures-cockpit"),
                new ExecTask("textures-fuselage", "npm run build-a339x:copy-textures-fuselage"),
                new ExecTask("cargo-config", "npm run build-a339x:copy-cargo-config"),
                new ExecTask("cmake-config", "npm run build-a339x:copy-cmake-config"),
            ], true),
            new TaskOfTasks("localization", [
                new ExecTask("efb-translation", "npm run build-a339x:efb-translation"),
                new ExecTask("locPak-translation", "npm run build-a339x:locPak-translation")
            ], true),
        ], false),

        new TaskOfTasks("A330-941", [
            // Group all typescript and react build tasks together.
            new TaskOfTasks("build", [
                new ExecTask("model",
                    "npm run build-a339x:model",
                    [
                        "build-a339x/src/model",
                        "build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/model"
                    ]),
                new ExecTask("behavior",
                    "npm run build-a339x:behavior",
                    [
                        "build-a339x/src/behavior",
                        "build-a339x/out/headwindsim-aircraft-a330-900/ModelBehaviorDefs/A339X/generated"
                    ]),
                new ExecTask(
                    'extras-host',
                    'npm run build-a339x:extras-host',
                    [
                        'build-a339x/src/systems/extras-host',
                        'build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X/ExtrasHost',
                        'build-common/src/systems/shared/src/extras',
                    ]
                ),
                new ExecTask(
                    'systems-host',
                    'npm run build-a339x:systems-host',
                    [
                        'build-a339x/src/systems/systems-host',
                        'build-common/src/systems/datalink',
                        'build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X/SystemsHost'
                    ]
                ),
                new TaskOfTasks("instruments", getInstrumentsIgniterTasks(), true),
            ], true),

            // Group all WASM build tasks together but separate from the rest of the tasks as build run more stable like this.
            new TaskOfTasks("wasm", [
                new ExecTask("systems",
                    "npm run build-a339x:systems",
                    [
                        "build-a339x/src/wasm/systems",
                        "build-common/src/wasm/systems",
                        "Cargo.lock",
                        "Cargo.toml",
                        "build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/systems.wasm"
                    ]),
                new ExecTask("systems-fbw",
                    "npm run build-a339x:fbw",
                    [
                        "build-a339x/src/wasm/fbw_a330",
                        "build-common/src/wasm/fbw_common",
                        "build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fbw.wasm"
                    ]),                    
                new ExecTask("systems-terronnd", [
                    "npm run build-a339x:terronnd",
                ], [
                    "build-common/src/wasm/terronnd",
                    "build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/terronnd.wasm",
                    "build-common/src/wasm/terronnd/out/terronnd.wasm",
                ]),
                new ExecTask('cpp-wasm-cmake',
                    "npm run build-a339x:cpp-wasm-cmake",
                    [
                        'build-common/src/wasm/cpp-msfs-framework',
                        'build-common/src/wasm/extra-backend',
                        'build-common/src/wasm/fadec_common',
                        'build-a339x/src/wasm/extra-backend-a339x',
                        'build-a339x/src/wasm/fadec_a339x',
                        'build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/extra-backend-a339x.wasm',
                        'build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fadec-a339x.wasm'
                    ])
            ], true),
        ]),

        /*
        new TaskOfTasks("ACJ330neo", [
            // Group all WASM build tasks together but separate from the rest of the tasks as build run more stable like this.
            new TaskOfTasks("wasm", [
                new ExecTask("copy-wasm",
                    "npm run build-a339x-acj:copy-wasm"
                    ),
                new ExecTask("systems",
                    "npm run build-a339x-acj:systems",
                    [
                        "build-a339x-acj/src/wasm/systems",
                        "build-common/src/wasm/systems",
                        "Cargo.lock",
                        "Cargo.toml",
                        "build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_ACJ330_900/panel/systems.wasm"
                    ])
            ], true),
        ]),
        */

        // Create final package meta files.
        new TaskOfTasks("dist", [
            new ExecTask("metadata", "npm run build-a339x:metadata"),
            new ExecTask("manifests", "npm run build-a339x:manifest")
        ])
    ]),

    // A339X Livery Package Task
    new TaskOfTasks("a339x-livery-package", [
        // Prepare the out folder and any other pre tasks.
        // Currently, these can be run in parallel but in the future, we may need to run them in sequence if there are any dependencies.
        new TaskOfTasks("preparation", [
            new ExecTask("copy-base-files", "npm run build-a339x-livery-package:copy-base-files")
        ], true),
        new TaskOfTasks("dist", [
            new ExecTask("manifests", "npm run build-a339x-livery-package:manifest")
        ])
    ])
]);
