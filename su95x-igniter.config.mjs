import { ExecTask, TaskOfTasks } from "@flybywiresim/igniter";
import { getInstrumentsIgniterTasks } from "./build-su95x/src/systems/instruments/buildSrc/igniter/tasks.mjs";

export default new TaskOfTasks("all", [
    new TaskOfTasks("SU95X", [
        // Prepare the out folder and any other pre tasks.
        // Currently, these can be run in parallel but in the future, we may need to run them in sequence if there are any dependencies.
        new TaskOfTasks("preparation", [
            new TaskOfTasks("copy", [
                //new ExecTask("textures-cockpit", "npm run build-su95x:copy-textures-cockpit"),
                //new ExecTask("textures-fuselage", "npm run build-su95x:copy-textures-fuselage"),
                new ExecTask("cargo-config", "npm run build-su95x:copy-cargo-config"),
                new ExecTask("cmake-config", "npm run build-su95x:copy-cmake-config"),
            ], true),
            new TaskOfTasks("localization", [
                new ExecTask("efb-translation", "npm run build-su95x:efb-translation"),
                new ExecTask("locPak-translation", "npm run build-su95x:locPak-translation")
            ], true),
        ], false),

        new TaskOfTasks("SSJ100-95B", [
            // Group all typescript and react build tasks together.
            new TaskOfTasks("build", [
                new ExecTask("model",
                    "npm run build-su95x:model",
                    [
                        "build-su95x/src/model",
                        "build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/model"
                    ]),
                new ExecTask("behavior",
                    "npm run build-su95x:behavior",
                    [
                        "build-su95x/src/behavior",
                        "build-su95x/out/headwindsim-aircraft-su100-95/ModelBehaviorDefs/su95x/generated"
                    ]),
                new TaskOfTasks('atsu', [
                    new ExecTask(
                        'common',
                        'npm run build-su95x:atsu-common',
                        [
                            'build-su95x/src/systems/atsu/common',
                            'build-su95x/out/headwindsim-aircraft-su100-95/html_ui/JS/su95x/atsu/common.js'
                        ]
                    ),
                    new ExecTask(
                        'fmsclient',
                        'npm run build-su95x:atsu-fms-client',
                        [
                            'build-su95x/src/systems/atsu/common',
                            'build-su95x/src/systems/atsu/fmsclient',
                            'build-su95x/out/headwindsim-aircraft-su100-95/html_ui/JS/su95x/atsu/fmsclient.js'
                        ]
                    ),
                ]),
                new ExecTask(
                    'extras-host',
                    'npm run build-su95x:extras-host',
                    [
                        'build-su95x/src/systems/extras-host',
                        'build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VCockpit/Instruments/su95x/ExtrasHost'
                    ]
                ),
                new ExecTask("failures",
                    "npm run build-su95x:failures",
                    [
                        "build-su95x/src/systems/failures",
                        "build-su95x/out/headwindsim-aircraft-su100-95/html_ui/su95x_JS/failures/failures.js"
                    ]),
                new ExecTask("fmgc",
                    "npm run build-su95x:fmgc",
                    [
                        "build-su95x/src/systems/fmgc",
                        "build-su95x/out/headwindsim-aircraft-su100-95/html_ui/su95x_JS/fmgc"
                    ]),
                new ExecTask("sentry-client",
                    "npm run build-su95x:sentry-client",
                    [
                        "build-su95x/src/systems/sentry-client",
                        "build-su95x/out/headwindsim-aircraft-su100-95/html_ui/su95x_JS/sentry-client"
                    ]),
                new ExecTask("simbridge-client",
                    "npm run build-su95x:simbridge-client",
                    [
                        "build-su95x/src/systems/simbridge-client",
                        "build-su95x/out/headwindsim-aircraft-su100-95/html_ui/su95x_JS/simbridge-client"
                    ]),
                new ExecTask(
                    'systems-host',
                    'npm run build-su95x:systems-host',
                    [
                        'build-su95x/src/systems/systems-host',
                        'build-common/src/systems/datalink',
                        'build-su95x/out/headwindsim-aircraft-su100-95/html_ui/Pages/VCockpit/Instruments/su95x/SystemsHost'
                    ]
                ),
                new ExecTask("tcas",
                    "npm run build-su95x:tcas",
                    [
                        "build-su95x/src/systems/tcas",
                        "build-su95x/out/headwindsim-aircraft-su100-95/html_ui/su95x_JS/tcas"
                    ]),

                new TaskOfTasks("instruments", getInstrumentsIgniterTasks(), true),
            ], true),

            // Group all WASM build tasks together but separate from the rest of the tasks as build run more stable like this.
            new TaskOfTasks("wasm", [
                new ExecTask("systems",
                    "npm run build-su95x:systems",
                    [
                        "build-su95x/src/wasm/systems",
                        "build-common/src/wasm/systems",
                        "Cargo.lock",
                        "Cargo.toml",
                        "build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/panel/systems.wasm"
                    ]),
                new ExecTask("systems-fbw",
                    "npm run build-su95x:fbw",
                    [
                        "build-su95x/src/wasm/fbw_su95x",
                        "build-common/src/wasm/fbw_common",
                        "build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/panel/fbw.wasm"
                    ]),
                new ExecTask("systems-terronnd", [
                    "npm run build-su95x:terronnd",
                ], [
                    "build-common/src/wasm/terronnd",
                    "build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/panel/terronnd.wasm",
                    "build-common/src/wasm/terronnd/out/terronnd.wasm",
                ]),
                new ExecTask('cpp-wasm-cmake',
                    "npm run build-su95x:cpp-wasm-cmake",
                    [
                        'build-common/src/wasm/cpp-msfs-framework',
                        'build-common/src/wasm/extra-backend',
                        'build-common/src/wasm/fadec_common',
                        'build-su95x/src/wasm/extra-backend-a32nx',
                        'build-su95x/src/wasm/fadec_su95x',
                        'build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/panel/extra-backend-a32nx.wasm',
                        'build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/panel/fadec-a32nx.wasm'
                    ])
            ], true),
        ]),

        // Create final package meta files.
        new TaskOfTasks("dist", [
            new ExecTask("metadata", "npm run build-su95x:metadata"),
            new ExecTask("manifests", "npm run build-su95x:manifest")
        ])
    ]),

    // SU95X Livery Package Task
    new TaskOfTasks("su95x-livery-package", [
        // Prepare the out folder and any other pre tasks.
        // Currently, these can be run in parallel but in the future, we may need to run them in sequence if there are any dependencies.
        new TaskOfTasks("preparation", [
            new ExecTask("copy-base-files", "npm run build-su95x-livery-package:copy-base-files")
        ], true),
        new TaskOfTasks("dist", [
            new ExecTask("manifests", "npm run build-su95x-livery-package:manifest")
        ])
    ])
]);
