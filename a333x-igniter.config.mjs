import { ExecTask, TaskOfTasks } from "@flybywiresim/igniter";
import { getInstrumentsIgniterTasks } from "./build-a333x/src/systems/instruments/buildSrc/igniter/tasks.mjs";

export default new TaskOfTasks("all", [
    new TaskOfTasks("A333X", [
        // Prepare the out folder and any other pre tasks.
        // Currently, these can be run in parallel but in the future, we may need to run them in sequence if there are any dependencies.
        new TaskOfTasks("preparation", [
            new TaskOfTasks("copy", [
                new ExecTask("textures-cockpit", "npm run build-a333x:copy-textures-cockpit"),
                new ExecTask("textures-fuselage", "npm run build-a333x:copy-textures-fuselage"),
                new ExecTask("cargo-config", "npm run build-a333x:copy-cargo-config"),
            ], true),
            new TaskOfTasks("localization", [
                new ExecTask("efb-translation", "npm run build-a333x:efb-translation"),
                new ExecTask("locPak-translation", "npm run build-a333x:locPak-translation")
            ], true),
        ], false),

        new TaskOfTasks("A330-300", [
            // Group all typescript and react build tasks together.
            new TaskOfTasks("build", [
                new ExecTask("model",
                    "npm run build-a333x:model",
                    [
                        "build-a333x/src/model",
                        "build-a333x/out/headwindsim-aircraft-a330-300/SimObjects/Airplanes/Headwind_A330_300/model"
                    ]),
                new ExecTask("behavior",
                    "npm run build-a333x:behavior",
                    [
                        "build-a333x/src/behavior",
                        "build-a333x/out/headwindsim-aircraft-a330-300/ModelBehaviorDefs/A333X/generated"
                    ]),
                new TaskOfTasks('atsu', [
                    new ExecTask(
                        'common',
                        'npm run build-a333x:atsu-common',
                        [
                            'build-a333x/src/systems/atsu/common',
                            'build-a333x/out/headwindsim-aircraft-a330-300/html_ui/JS/A333X/atsu/common.js'
                        ]
                    ),
                    new ExecTask(
                        'fmsclient',
                        'npm run build-a333x:atsu-fms-client',
                        [
                            'build-a333x/src/systems/atsu/common',
                            'build-a333x/src/systems/atsu/fmsclient',
                            'build-a333x/out/headwindsim-aircraft-a330-300/html_ui/JS/A333X/atsu/fmsclient.js'
                        ]
                    ),
                ]),
                new ExecTask(
                    'extras-host',
                    'npm run build-a333x:extras-host',
                    [
                        'build-a333x/src/systems/extras-host',
                        'build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VCockpit/Instruments/A333X/ExtrasHost'
                    ]
                ),
                new ExecTask("failures",
                    "npm run build-a333x:failures",
                    [
                        "build-a333x/src/systems/failures",
                        "build-a333x/out/headwindsim-aircraft-a330-300/html_ui/A333X_JS/failures/failures.js"
                    ]),
                new ExecTask("fmgc",
                    "npm run build-a333x:fmgc",
                    [
                        "build-a333x/src/systems/fmgc",
                        "build-a333x/out/headwindsim-aircraft-a330-300/html_ui/A333X_JS/fmgc"
                    ]),
                new ExecTask("sentry-client",
                    "npm run build-a333x:sentry-client",
                    [
                        "build-a333x/src/systems/sentry-client",
                        "build-a333x/out/headwindsim-aircraft-a330-300/html_ui/A333X_JS/sentry-client"
                    ]),
                new ExecTask("simbridge-client",
                    "npm run build-a333x:simbridge-client",
                    [
                        "build-a333x/src/systems/simbridge-client",
                        "build-a333x/out/headwindsim-aircraft-a330-300/html_ui/A333X_JS/simbridge-client"
                    ]),
                new ExecTask(
                    'systems-host',
                    'npm run build-a333x:systems-host',
                    [
                        'build-a333x/src/systems/systems-host',
                        'build-a333x-common/src/systems/datalink',
                        'build-a333x/out/headwindsim-aircraft-a330-300/html_ui/Pages/VCockpit/Instruments/A333X/SystemsHost'
                    ]
                ),
                new ExecTask("tcas",
                    "npm run build-a333x:tcas",
                    [
                        "build-a333x/src/systems/tcas",
                        "build-a333x/out/headwindsim-aircraft-a330-300/html_ui/A333X_JS/tcas"
                    ]),

                new TaskOfTasks("instruments", getInstrumentsIgniterTasks(), true),
            ], true),

            // Group all WASM build tasks together but separate from the rest of the tasks as build run more stable like this.
            new TaskOfTasks("wasm", [
                new ExecTask("systems",
                    "npm run build-a333x:systems",
                    [
                        "build-a333x/src/wasm/systems",
                        "build-a333x-common/src/wasm/systems",
                        "Cargo.lock",
                        "Cargo.toml",
                        "build-a333x/out/headwindsim-aircraft-a330-300/SimObjects/Airplanes/Headwind_A330_300/panel/systems.wasm"
                    ]),
                new ExecTask("systems-fadec",
                    "npm run build-a333x:fadec",
                    [
                        "build-a333x/src/wasm/fadec_a330",
                        "build-a333x-common/src/wasm/fbw_common",
                        "build-a333x-common/src/wasm/fadec_common",
                        "build-a333x/out/headwindsim-aircraft-a330-300/SimObjects/Airplanes/Headwind_A330_300/panel/fadec.wasm"
                    ]),
                new ExecTask("systems-fbw",
                    "npm run build-a333x:fbw",
                    [
                        "build-a333x/src/wasm/fbw_a320",
                        "build-a333x-common/src/wasm/fbw_common",
                        "build-a333x/out/headwindsim-aircraft-a330-300/SimObjects/Airplanes/Headwind_A330_300/panel/fbw.wasm"
                    ]),
                new ExecTask("systems-terronnd", [
                    "build-a333x-common/src/wasm/terronnd/build.sh",
                    "wasm-opt -O1 --signext-lowering -o build-a333x/out/headwindsim-aircraft-a330-300/SimObjects/Airplanes/Headwind_A330_300/panel/terronnd.wasm build-a333x-common/src/wasm/terronnd/out/terronnd.wasm"
                ], [
                    "build-a333x-common/src/wasm/terronnd",
                    "build-a333x/out/headwindsim-aircraft-a330-300/SimObjects/Airplanes/Headwind_A330_300/panel/terronnd.wasm",
                    "build-a333x-common/src/wasm/terronnd/out/terronnd.wasm",
                ]),
                new ExecTask("flypad-backend",
                    "npm run build-a333x:flypad-backend",
                    [
                        "build-a333x/src/wasm/flypad-backend",
                        "build-a333x-common/src/wasm/fbw_common",
                        "build-a333x/out/headwindsim-aircraft-a330-300/SimObjects/Airplanes/Headwind_A330_300/panel/flypad-backend.wasm"
                    ])
            ], true),
        ]),

        // Create final package meta files.
        new TaskOfTasks("dist", [
            new ExecTask("metadata", "npm run build-a333x:metadata"),
            new ExecTask("manifests", "npm run build-a333x:manifest")
        ])
    ]),
]);
