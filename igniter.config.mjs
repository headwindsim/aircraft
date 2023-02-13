import { ExecTask, TaskOfTasks } from "@flybywiresim/igniter";
import { getInstrumentsIgniterTasks } from "./build/a339x/systems/instruments/buildSrc/igniter/tasks.mjs";

export default new TaskOfTasks("all", [
    // A32NX Task
    new TaskOfTasks("A339X", [
        // Prepare the out folder and any other pre tasks.
        // Currently, these can be run in parallel but in the future, we may need to run them in sequence if there are any dependencies.
        new TaskOfTasks("preparation", [
            //new ExecTask("copy-base-files", "npm run build-a339x:copy-base-files"),
            new ExecTask("efb-translation", "npm run build-a339x:efb-translation")
        ], true),

        // Group all typescript and react build tasks together.
        new TaskOfTasks("build", [
            new ExecTask("model",
                "npm run build-a339x:model",
                [
                    "build/a339x/model",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/model"
                ]),
            new ExecTask("behavior",
                "npm run build-a339x:behavior",
                [
                    "build/a339x/behavior",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/ModelBehaviorDefs/A339X/generated"
                ]),

            new ExecTask("atsu",
                "npm run build-a339x:atsu",
                [
                    "build/a339x/systems/atsu",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS/atsu"
                ]),
            new ExecTask("failures",
                "npm run build-a339x:failures",
                [
                    "build/a339x/systems/failures",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS/failures/failures.js"
                ]),
            new ExecTask("fmgc",
                "npm run build-a339x:fmgc",
                [
                    "build/a339x/systems/fmgc",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS/fmgc"
                ]),
            new ExecTask("sentry-client",
                "npm run build-a339x:sentry-client",
                [
                    "build/a339x/systems/sentry-client",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS/sentry-client"
                ]),
            new ExecTask("simbridge-client",
                "npm run build-a339x:simbridge-client",
                [
                    "build/a339x/systems/simbridge-client",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS/simbridge-client"
                ]),
            new ExecTask("tcas",
                "npm run build-a339x:tcas",
                [
                    "build/a339x/systems/tcas",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/A339X_JS/tcas"
                ]),

            new TaskOfTasks("instruments",
                [
                    ...getInstrumentsIgniterTasks(),
                    new ExecTask("PFD", "npm run build-a339x:pfd", ["build/a339x/systems/instruments/src/PFD", "hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X/PFD"]),
                    new ExecTask("Clock", "npm run build-a339x:clock", ["build/a339x/systems/instruments/src/Clock", "hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X/Clock"]),
                    new ExecTask("EWD", "npm run build-a339x:ewd", ["build/a339xc/systems/instruments/src/EWD", "hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X/EWD"]),
                ],
                true)
        ], true),

        // Group all WASM build tasks together but separate from the rest of the tasks as build run more stable like this.
        new TaskOfTasks("wasm", [
            new ExecTask("systems",
                "npm run build-a339x:systems",
                [
                    "build/a339x/wasm/systems",
                    "a32nx/fbw-common/src/wasm/systems",
                    "Cargo.lock",
                    "Cargo.toml",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/systems.wasm"
                ]),
            new ExecTask("systems-fadec",
                "npm run build-a339x:fadec",
                [
                    "build/a339x/wasm/fadec_a320",
                    "a32nx/fbw-common/src/wasm/fbw_common",
                    "a32nx/fbw-common/src/wasm/fadec_common",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fadec.wasm"
                ]),
            new ExecTask("systems-fbw",
                "npm run build-a339x:fbw",
                [
                    "build/a339x/wasm/fbw_a320",
                    "a32nx/fbw-common/src/wasm/fbw_common",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/fbw.wasm"
                ]),
            new ExecTask("flypad-backend",
                "npm run build-a339x:flypad-backend",
                [
                    "build/a339x/wasm/flypad-backend",
                    "fbw-common/src/wasm/fbw_common",
                    "hdw-a339x/out/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/panel/flypad-backend.wasm"
                ])
        ], true),

        // Create final package meta files.
        new TaskOfTasks("dist", [
            new ExecTask("metadata", "npm run build-a339x:metadata"),
            new ExecTask("manifests", "npm run build-a339x:manifest")
        ])
    ]),

    // A380X Tasks
    /*
    new TaskOfTasks("a380x", [

        new TaskOfTasks("preparation", [
            new ExecTask("copy-base-files", [
                "npm run build-a380x:copy-base-files",
                // temporary until folder exists
                "mkdir -p fbw-a380x/out/flybywire-aircraft-a380-841/SimObjects/Airplanes/FlyByWire_A380_841/panel/"
            ])
        ], true),

        new TaskOfTasks("wasm", [
            new ExecTask("systems",
                "npm run build-a380x:systems",
                [
                    "fbw-a380x/src/wasm/systems",
                    "fbw-common/src/wasm/systems",
                    "Cargo.lock",
                    "Cargo.toml",
                    "fbw-a380x/out/flybywire-aircraft-a380-841/SimObjects/Airplanes/FlyByWire_A380_841/panel/systems.wasm"
                ]),
            new ExecTask("systems-fadec",
                "npm run build-a380x:fadec",
                [
                    "fbw-a380x/src/wasm/fadec_a380",
                    "fbw-common/src/wasm/fbw_common",
                    "fbw-common/src/wasm/fadec_common",
                    "fbw-a380x/out/flybywire-aircraft-a380-841/SimObjects/Airplanes/FlyByWire_A380_841/panel/fadec.wasm"
                ]),
            new ExecTask("systems-fbw",
                "npm run build-a380x:fbw",
                [
                    "fbw-a380x/src/wasm/fbw_a380",
                    "fbw-common/src/wasm/fbw_common",
                    "fbw-a380x/out/flybywire-aircraft-a380-841/SimObjects/Airplanes/FlyByWire_A380_841/panel/fbw.wasm"
                ]),
            new ExecTask("flypad-backend",
                "npm run build-a380x:flypad-backend",
                [
                    "fbw-a380x/src/wasm/flypad-backend",
                    "fbw-common/src/wasm/fbw_common",
                    "fbw-a380x/out/flybywire-aircraft-a380-841/SimObjects/Airplanes/FlyByWire_A380_841/panel/flypad-backend.wasm"
                ])
        ], true)
    ])
    */
]);