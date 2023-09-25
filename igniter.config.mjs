import { ExecTask, TaskOfTasks } from "@flybywiresim/igniter";
import * as A339X from "./build-a339x/src/systems/instruments/buildSrc/igniter/tasks.mjs";

export default new TaskOfTasks("all", [
    new TaskOfTasks("A339X", [
        // Prepare the out folder and any other pre tasks.
        // Currently, these can be run in parallel but in the future, we may need to run them in sequence if there are any dependencies.
        new TaskOfTasks("preparation", [
            //new ExecTask("copy-base-files", "npm run build-a339x:copy-base-files"),
            new TaskOfTasks("localization", [
                new ExecTask("efb-translation", "npm run build-a339x:efb-translation"),
                new ExecTask("locPak-translation", "npm run build-a339x:locPak-translation")
            ], true),
        ], false),

        new TaskOfTasks("A330neo", [
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
                new TaskOfTasks('atsu', [
                    new ExecTask(
                        'common',
                        'npm run build-a339x:atsu-common',
                        [
                            'build-a339x/src/systems/atsu/common',
                            'build-a339x/out/headwindsim-aircraft-a330-900/html_ui/JS/A339X/atsu/common.js'
                        ]
                    ),
                    new ExecTask(
                        'fmsclient',
                        'npm run build-a339x:atsu-fms-client',
                        [
                            'build-a339x/src/systems/atsu/common',
                            'build-a339x/src/systems/atsu/fmsclient',
                            'build-a339x/out/headwindsim-aircraft-a330-900/html_ui/JS/A339X/atsu/fmsclient.js'
                        ]
                    ),
                ]),
                new ExecTask(
                    'extras-host',
                    'npm run build-a339x:extras-host',
                    [
                        'build-a339x/src/systems/extras-host',
                        'build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X/ExtrasHost'
                    ]
                ),
                new ExecTask("failures",
                    "npm run build-a339x:failures",
                    [
                        "build-a339x/src/systems/failures",
                        "build-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS/failures/failures.js"
                    ]),
                new ExecTask("fmgc",
                    "npm run build-a339x:fmgc",
                    [
                        "build-a339x/src/systems/fmgc",
                        "build-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS/fmgc"
                    ]),
                new ExecTask("sentry-client",
                    "npm run build-a339x:sentry-client",
                    [
                        "build-a339x/src/systems/sentry-client",
                        "build-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS/sentry-client"
                    ]),
                new ExecTask("simbridge-client",
                    "npm run build-a339x:simbridge-client",
                    [
                        "build-a339x/src/systems/simbridge-client",
                        "build-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS/simbridge-client"
                    ]),
                new ExecTask(
                    'systems-host',
                    'npm run build-a339x:systems-host',
                    [
                        'build-a339x/src/systems/systems-host',
                        'build-common/src/systems/datalink',
                        'build-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X/SystemsHost'
                    ]
                ),
                new ExecTask("tcas",
                    "npm run build-a339x:tcas",
                    [
                        "build-a339x/src/systems/tcas",
                        "build-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS/tcas"
                    ]),

                new TaskOfTasks("instruments", A339X.getInstrumentsIgniterTasks(), true),
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
                new ExecTask("systems-fadec",
                    "npm run build-a339x:fadec",
                    [
                        "build-a339x/src/wasm/fadec_a320",
                        "build-common/src/wasm/fbw_common",
                        "build-common/src/wasm/fadec_common",
                        "build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fadec.wasm"
                    ]),
                new ExecTask("systems-fbw",
                    "npm run build-a339x:fbw",
                    [
                        "build-a339x/src/wasm/fbw_a320",
                        "build-common/src/wasm/fbw_common",
                        "build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fbw.wasm"
                    ]),
                new ExecTask("systems-terronnd", [
                    "build-common/src/wasm/terronnd/build.sh",
                    "wasm-opt -O1 -o build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/terronnd.wasm build-common/src/wasm/terronnd/out/terronnd.wasm"
                ], [
                    "build-common/src/wasm/terronnd",
                    "build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/terronnd.wasm",
                    "build-common/src/wasm/terronnd/out/terronnd.wasm",
                ]),
                new ExecTask("flypad-backend",
                    "npm run build-a339x:flypad-backend",
                    [
                        "build-a339x/src/wasm/flypad-backend",
                        "build-common/src/wasm/fbw_common",
                        "build-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/flypad-backend.wasm"
                    ])
            ], true),
        ]),

        new TaskOfTasks("ACJ330neo", [
            // Group all WASM build tasks together but separate from the rest of the tasks as build run more stable like this.
            new TaskOfTasks("wasm", [
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