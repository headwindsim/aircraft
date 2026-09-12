// Cross-language contracts for the production tank configuration and adapters.
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const aircraft = 'hdw-a339x/src/base/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/';
const fadec = 'hdw-a339x/src/wasm/fadec_a339x/src/Fadec/';
const config = read(aircraft + 'flight_model.cfg');
const tanks = [...config.matchAll(/^Tank\.(\d+) = (.+)$/gm)].map((match) => {
    const fields = Object.fromEntries(
        match[2]
            .trim()
            .split('#')
            .map((field) => field.split(':')),
    );
    return {
        index: +match[1],
        name: fields.Name,
        capacity: +fields.Capacity,
        position: fields.Position.split(',').map(Number),
    };
});
test('native six-tank capacities and arms match the production C++ kernel', () => {
    assert.match(config, /Version = 4/);
    assert.deepEqual(
        tanks.map((t) => t.index),
        [1, 2, 3, 4, 5, 6],
    );
    assert.deepEqual(
        tanks.map((t) => t.name),
        ['Center', 'LeftInner', 'RightInner', 'LeftOuter', 'RightOuter', 'Trim'],
    );
    assert.equal(
        tanks.reduce((sum, t) => sum + t.capacity, 0),
        36743,
    );
    const model = read(fadec + 'FuelTrimModel.hpp');
    for (const [name, expected] of [
        ['TankCapacities', tanks.map((t) => t.capacity)],
        ['LongitudinalArms', tanks.map((t) => t.position[0])],
    ]) {
        const values = model
            .match(new RegExp(name + '\\{([^}]+)\\}'))[1]
            .split(',')
            .map(Number);
        assert.deepEqual(values, expected);
    }
    assert.match(config, /reference_datum_position = 0, 0, 0/);
});
test('Rust readers preserve native mapping, capacities and all three axes', () => {
    const rust = read('hdw-a339x/src/wasm/systems/a320_systems/src/fuel/mod.rs');
    const entries = [
        ...rust.matchAll(
            /fuel_tank_id:\s*"FUELSYSTEM TANK QUANTITY:(\d+)"[\s\S]*?position:\s*\(([^)]+)\)[\s\S]*?total_capacity_gallons:\s*([\d.]+)/g,
        ),
    ];
    assert.equal(entries.length, 6);
    for (const entry of entries) {
        const tank = tanks[Number(entry[1]) - 1];
        assert.equal(+entry[3], tank.capacity);
        assert.deepEqual(
            entry[2].split(',').map((x) => +x.trim()),
            tank.position,
        );
    }
    assert.match(rust, /FuelSystem<6, 5>/);
    const wasm = read('hdw-a339x/src/wasm/systems/a320_systems_wasm/src/lib.rs');
    assert.match(wasm, /provides_aircraft_variable_range\("FUELSYSTEM TANK QUANTITY", "gallons", 1\.\.=6\)/);
    assert.match(wasm, /provides_aircraft_variable\("FUEL WEIGHT PER GALLON", "kilograms", 0\)/);
});
test('SimConnect struct and data-definition order remain aligned', () => {
    const adapter = read(fadec + 'FadecSimData_A339X.hpp');
    const struct = adapter.match(/struct SimVarsData \{([\s\S]*?)\n  \};/)[1];
    const fields = [...struct.matchAll(/FLOAT64\s+(\w+)(?:\[(\d+)\])?\s*;/g)].flatMap((field) =>
        field[2] ? Array.from({ length: +field[2] }, (_, index) => `${field[1]}[${index}]`) : [field[1]],
    );
    const definition = adapter.match(/simVarsDataDef = \{([\s\S]*?)\n  \};/)[1];
    const rows = [...definition.matchAll(/\{"([^"]+)"\s*,\s*(\d+)\s*,\s*UNITS\.(\w+)\s*\}/g)];
    assert.equal(rows.length, fields.length);
    const expected = {
        airSpeedMach: ['AIRSPEED MACH', [0], 'Mach'],
        ambientPressure: ['AMBIENT PRESSURE', [0], 'Millibars'],
        ambientTemperature: ['AMBIENT TEMPERATURE', [0], 'Celsius'],
        animationDeltaTime: ['ANIMATION DELTA TIME', [0], 'Seconds'],
        apuFuelConsumption: ['FUELSYSTEM LINE FUEL FLOW', [18], 'Gph'],
        engineAntiIce: ['ENG ANTI ICE', [1, 2], 'Bool'],
        engineFuelValveOpen: ['FUELSYSTEM VALVE OPEN', [1, 2], 'Number'],
        engineIgniter: ['TURB ENG IGNITION SWITCH EX1', [1, 2], 'Number'],
        engineStarter: ['GENERAL ENG STARTER', [1, 2], 'Bool'],
        fuelPump1: ['FUELSYSTEM PUMP ACTIVE', [2, 3], 'Number'],
        fuelPump2: ['FUELSYSTEM PUMP ACTIVE', [5, 6], 'Number'],
        fuelTankQuantityCenter: ['FUELSYSTEM TANK QUANTITY', [1], 'Gallons'],
        fuelTankQuantityLeft: ['FUELSYSTEM TANK QUANTITY', [2], 'Gallons'],
        fuelTankQuantityLeftAux: ['FUELSYSTEM TANK QUANTITY', [4], 'Gallons'],
        fuelTankQuantityRight: ['FUELSYSTEM TANK QUANTITY', [3], 'Gallons'],
        fuelTankQuantityRightAux: ['FUELSYSTEM TANK QUANTITY', [5], 'Gallons'],
        fuelTankQuantityTrim: ['FUELSYSTEM TANK QUANTITY', [6], 'Gallons'],
        fuelWeightPerGallon: ['FUEL WEIGHT PER GALLON', [0], 'Pounds'],
        lineToCenterFlow: ['FUELSYSTEM LINE FUEL FLOW', [27, 28], 'Gph'],
        pressureAltitude: ['PRESSURE ALTITUDE', [0], 'Feet'],
        simEngineN1: ['TURB ENG N1', [1, 2], 'Percent'],
        simEngineN2: ['TURB ENG N2', [1, 2], 'Percent'],
        xFeedValve: ['FUELSYSTEM VALVE OPEN', [3], 'Number'],
        xfrCenterManual: ['FUELSYSTEM JUNCTION SETTING', [4, 5], 'Number'],
        xfrValveCenterAuto: ['FUELSYSTEM VALVE OPEN', [11, 12], 'Number'],
        xfrValveCenterOpen: ['FUELSYSTEM VALVE OPEN', [9, 10], 'Number'],
        xfrValveOuter1: ['FUELSYSTEM VALVE OPEN', [6, 7], 'Number'],
        xfrValveOuter2: ['FUELSYSTEM VALVE OPEN', [4, 5], 'Number'],
        totalWeightPounds: ['TOTAL WEIGHT', [0], 'Pounds'],
        cgPercent: ['CG PERCENT', [0], 'Percent'],
        unlimitedFuel: ['UNLIMITED FUEL', [0], 'Bool'],
    };
    assert.deepEqual(
        Object.fromEntries(rows.map((row, index) => [fields[index], [row[1], +row[2], row[3]]])),
        Object.fromEntries(
            Object.entries(expected).flatMap(([name, [simvar, indices, unit]]) =>
                indices.map((index, slot) => [indices.length > 1 ? `${name}[${slot}]` : name, [simvar, index, unit]]),
            ),
        ),
    );
    const pair = adapter.match(/trimTankDataDef = \{([\s\S]*?)\n  \};/)[1];
    assert.deepEqual(
        [...pair.matchAll(/"FUELSYSTEM TANK QUANTITY",\s*(\d+),\s*UNITS.Gallons/g)].map((x) => +x[1]),
        [1, 6],
    );
    const restore = adapter.match(/fuelStateDataDef = \{([\s\S]*?)\n  \};/)[1];
    assert.deepEqual(
        [...restore.matchAll(/"FUELSYSTEM TANK QUANTITY",\s*(\d+),\s*UNITS.Gallons/g)].map((x) => +x[1]),
        [1, 2, 3, 4, 5, 6],
    );
});
test('native and custom ownership contract excludes competing trim paths and engine burn', () => {
    assert.match(read(aircraft + 'engines.cfg'), /fuel_flow_scalar\s*=\s*0\s*;/);
    assert.doesNotMatch(config, /(?:Source|Destination):Trim(?:#|\r?$)/m);
    const code = read(fadec + 'EngineControlA339X.cpp');
    const init = code.match(/void EngineControl_A339X::initializeFuelTanks\([^)]*\) \{([\s\S]*?)\n\}/)[1];
    assert.doesNotMatch(init, /writeDataToSim|loadConfigurationFromIni/);
    assert.match(code, /updateFuel\(msfsHandlerPtr->getSimulationDeltaTime\(\)\)/);
    assert.doesNotMatch(code, /apuBurn|xfrCenterToLeft|uiFuelTamper/);
    assert.match(code, /telemetrySamples >= 300/);
    assert.match(code, /if \(!simData\.trimTankDataPtr->writeDataToSim\(\)\)/);
    assert.match(code, /if \(!input\.trimEnabled \|\| invalidTrimControl\)/);
});
