// Run from the repository root: node --test scripts/fuel-trim/refuel.test.cjs
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(
    path.join(root, 'hdw-a339x/src/systems/instruments/src/MCDU/legacy/A32NX_Core/A32NX_Refuel.ts'),
    'utf8',
);
const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const nativeConfig = fs.readFileSync(
    path.join(
        root,
        'hdw-a339x/src/base/headwindsim-aircraft-a330-900/SimObjects/Airplanes/Headwind_A330neo/flight_model.cfg',
    ),
    'utf8',
);
const capacities = [...nativeConfig.matchAll(/^Tank\.\d+ = .*?#Capacity:([\d.]+)/gm)].map((entry) => +entry[1]);
const names = ['CENTER', 'LEFT_MAIN', 'RIGHT_MAIN', 'LEFT_AUX', 'RIGHT_AUX', 'TRIM'];
const startKey = 'L:A32NX_REFUEL_STARTED_BY_USR';
function rig(current = capacities.map(() => 0), targets = capacities, rate = 0) {
    const values = new Map([
        [startKey, true],
        ['SIM ON GROUND', true],
        ['L:A32NX_ELEC_DC_2_BUS_IS_POWERED', true],
        ['L:A32NX_EFB_REFUEL_RATE_SETTING', rate],
        ['FUEL WEIGHT PER GALLON', 3],
    ]);
    const writes = [];
    current.forEach((value, i) => values.set(`FUELSYSTEM TANK QUANTITY:${i + 1}`, value));
    targets.forEach((value, i) => values.set(`L:A32NX_FUEL_${names[i]}_DESIRED`, value));
    const context = {
        exports: {},
        require: () => ({ NXUnits: { kgToUser: (kg) => kg } }),
        SimVar: {
            GetSimVarValue: (name) => values.get(name) ?? 0,
            SetSimVarValue: (name, unit, value) => {
                writes.push([name, unit, value]);
                values.set(name, value);
            },
        },
    };
    vm.runInNewContext(compiled, context);
    return {
        refuel: new context.exports.A32NX_Refuel(),
        values,
        writes,
        quantities: () => capacities.map((_, i) => values.get(`FUELSYSTEM TANK QUANTITY:${i + 1}`)),
    };
}
function finish(r, tick = 1000) {
    let ticks = 0;
    while (r.values.get(startKey) && ticks < 10000) {
        r.refuel.update(tick);
        r.quantities().forEach((value, i) => assert.ok(Number.isFinite(value) && value >= 0 && value <= capacities[i]));
        ticks++;
    }
    assert.equal(r.values.get(startKey), false);
    return (ticks * tick) / 1000;
}
test('init preserves all six exact native quantities and totals', () => {
    const current = [123.25, 452.125, 999.75, 88, 2.1, 333.5];
    const r = rig(current);
    r.refuel.init();
    assert.deepEqual(r.quantities(), current);
    names.forEach((name, i) => assert.equal(r.values.get(`L:A32NX_FUEL_${name}_DESIRED`), current[i]));
    assert.equal(
        r.values.get('L:A32NX_FUEL_TOTAL_DESIRED'),
        current.reduce((a, b) => a + b, 0),
    );
    assert.equal(r.writes.filter(([name]) => name.startsWith('FUELSYSTEM')).length, 0);
});
test('real and fast fill/defuel all capacity with the original parallel bank rates', () => {
    for (const rate of [0, 1]) {
        for (const draining of [false, true]) {
            const targets = draining ? capacities.map(() => 0) : capacities;
            const r = rig(draining ? capacities : capacities.map(() => 0), targets, rate);
            const seconds = finish(r);
            assert.deepEqual(r.quantities(), targets);
            assert.ok(Math.abs(seconds - 1300 / (rate === 1 ? 5 : 1)) <= 1, `duration ${seconds}`);
        }
    }
});
test('center and trim share a bounded rate budget', () => {
    const targets = [10979, 0, 0, 0, 0, 1646];
    const r = rig([10978, 0, 0, 0, 0, 0], targets);
    r.refuel.update(1000);
    assert.equal(r.quantities()[0], 10979);
    assert.ok(Math.abs(r.quantities()[5] - (18.5523 * 1.00075 - 1)) < 1e-9);
});
test('partial, zero, asymmetric, opposite-direction and near-full targets stop exactly', () => {
    const cases = [
        [
            [0, 400, 0, 0, 300, 0],
            [10.5, 400, 50.25, 0, 200, 30],
        ],
        [[10978.999, 11095, 11094.99, 964, 963.99, 1645.99], capacities],
        [[10, 3, 4, 7, 8, 12], capacities.map(() => 0)],
    ];
    for (const [current, target] of cases)
        for (const rate of [0, 1, 2]) {
            const r = rig(current, target, rate);
            r.refuel.update(100);
            current.forEach((value, i) => {
                if (value === target[i]) assert.equal(r.quantities()[i], value);
            });
            finish(r, 100);
            assert.deepEqual(r.quantities(), target);
        }
});
test('instant completes in one valid ground tick', () => {
    const r = rig(undefined, capacities, 2);
    r.refuel.update(1);
    assert.deepEqual(r.quantities(), capacities);
    assert.equal(r.values.get(startKey), false);
    assert.equal(r.values.get('L:A339X_FUEL_EXTERNAL_EDIT_SEQUENCE'), 1);
});
test('paused timesteps and invalid targets write nothing in every mode', () => {
    for (const rate of [0, 1, 2]) {
        for (const dt of [0, -1, NaN, Infinity]) {
            const r = rig(undefined, capacities, rate);
            r.refuel.update(dt);
            assert.equal(r.writes.length, 0);
        }
        for (let i = 0; i < 6; i++)
            for (const value of [-1, capacities[i] + 0.01, NaN, Infinity]) {
                const targets = [...capacities];
                targets[i] = value;
                const r = rig(undefined, targets, rate);
                r.refuel.update(1000);
                assert.equal(r.writes.length, 0);
            }
    }
});
test('active refueling cancels on loss of eligibility without fuel writes, then accepts a new request', () => {
    for (const rate of [0, 1, 2]) {
        const conditions = [['SIM ON GROUND', false]];
        if (rate !== 2)
            conditions.push(
                ['ENG COMBUSTION:1', true],
                ['ENG COMBUSTION:2', true],
                ['GPS GROUND SPEED', 1],
                ['L:A32NX_ELEC_DC_2_BUS_IS_POWERED', false],
            );
        for (const [key, value] of conditions) {
            const r = rig(undefined, capacities, rate);
            if (rate !== 2) r.refuel.update(1000);
            assert.equal(r.values.get(startKey), true);
            const before = r.quantities();
            const previous = r.values.get(key) ?? 0;
            const sequence = r.values.get('L:A339X_FUEL_EXTERNAL_EDIT_SEQUENCE');
            r.values.set(key, value);
            r.writes.length = 0;
            r.refuel.update(1000);
            assert.deepEqual(r.writes, [[startKey, 'Bool', false]], `${rate}: ${key}`);
            assert.deepEqual(r.quantities(), before);
            assert.equal(r.values.get('L:A339X_FUEL_EXTERNAL_EDIT_SEQUENCE'), sequence);
            r.values.set(key, previous);
            r.values.set(startKey, true);
            r.refuel.update(1000);
            assert.ok(r.quantities().some((quantity, i) => quantity > before[i]));
        }
    }
});
test('inactive and paused requests preserve their state, including paused eligibility changes', () => {
    for (const rate of [0, 1, 2]) {
        const inactive = rig(undefined, capacities, rate);
        inactive.values.set(startKey, false);
        inactive.refuel.update(1000);
        assert.equal(inactive.writes.length, 0);
        const paused = rig(undefined, capacities, rate);
        paused.values.set('SIM ON GROUND', false);
        paused.refuel.update(0);
        assert.equal(paused.writes.length, 0);
        assert.equal(paused.values.get(startKey), true);
        paused.refuel.update(1000);
        assert.deepEqual(paused.writes, [[startKey, 'Bool', false]]);
    }
});
test('instant ground refueling retains engine/power bypass and batches its sequence before fuel writes', () => {
    const r = rig(undefined, capacities, 2);
    r.values.set('ENG COMBUSTION:1', true);
    r.values.set('L:A32NX_ELEC_DC_2_BUS_IS_POWERED', false);
    r.refuel.update(1000);
    assert.deepEqual(r.quantities(), capacities);
    assert.equal(r.writes[0][0], 'L:A339X_FUEL_EXTERNAL_EDIT_SEQUENCE');
    assert.deepEqual(r.writes.at(-1), [startKey, 'Bool', false]);
});
test('unsupported refueling modes cancel the request without editing tanks', () => {
    for (const rate of [-1, 3, NaN, Infinity]) {
        const r = rig(undefined, capacities, rate);
        r.refuel.update(1000);
        assert.deepEqual(r.writes, [[startKey, 'Bool', false]]);
    }
});

// Exercise the actual EFB event handlers with hook stubs, without a browser or a React test dependency.
const efbSource = fs.readFileSync(
    path.join(root, 'hdw-a339x-common/src/systems/instruments/src/EFB/Ground/Pages/Fuel/A330_941/A330Fuel.tsx'),
    'utf8',
);
const efbCompiled = ts.transpileModule(efbSource, {
    compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
    },
}).outputText;
function efb(isOnGround = true, rate = '0') {
    const values = new Map([['FUEL WEIGHT PER GALLON', 3]]);
    const elements = [];
    const react = {
        createElement: (type, props, ...children) => {
            const element = { type, props, children };
            elements.push(element);
            return element;
        },
        useCallback: (callback) => callback,
        useEffect: () => {},
    };
    const sdk = {
        useSimVar: (name) => [values.get(name) ?? 0, (value) => values.set(name, value)],
        usePersistentProperty: () => [rate, () => {}],
        usePersistentNumberProperty: () => [0],
        Units: { usingMetric: true },
        GsxServiceStates: {},
    };
    const flypad = {
        useAppDispatch: () => () => {},
        useAppSelector: () => false,
        t: (key) => key,
        TooltipWrapper: 'TooltipWrapper',
        SelectGroup: 'SelectGroup',
        SelectItem: 'SelectItem',
        ProgressBar: 'ProgressBar',
        SimpleInput: 'SimpleInput',
        OverWingOutline: 'OverWingOutline',
    };
    const context = {
        exports: {},
        require: (name) => {
            if (name === 'react') return react;
            if (name === 'lodash') return { round: Math.round };
            if (name === 'rc-slider') return 'Slider';
            if (name === '@flybywiresim/fbw-sdk') return sdk;
            if (name === '@flybywiresim/flypad') return flypad;
            return {};
        },
    };
    vm.runInNewContext(efbCompiled, context);
    context.exports.A330Fuel({
        simbriefDataLoaded: false,
        simbriefPlanRamp: 0,
        simbriefUnits: 'kgs',
        massUnitForDisplay: 'KG',
        convertUnit: 1,
        isOnGround,
    });
    return { values, elements };
}
test('EFB maximum, partial and zero allocation includes trim and sums exactly without +2 gallons', () => {
    for (const percent of [0, 3, 20, 70, 99, 100]) {
        const r = efb();
        r.elements.find((element) => element.type === 'Slider').props.onChange(percent);
        const targets = names.map((name) => r.values.get(`L:A32NX_FUEL_${name}_DESIRED`));
        assert.ok(Math.abs(targets.reduce((a, b) => a + b, 0) - (36743 * percent) / 100) < 1e-8);
        targets.forEach((value, i) => assert.ok(value >= 0 && value <= capacities[i]));
        if (percent === 100) assert.deepEqual(targets, capacities);
    }
    const r = efb();
    const input = r.elements.find((element) => element.type === 'SimpleInput');
    input.props.onChange('999999');
    assert.equal(r.values.get('L:A32NX_FUEL_TOTAL_DESIRED'), 36743);
    const before = [...r.values];
    input.props.onChange('NaN');
    assert.deepEqual([...r.values], before);
});
test('EFB cannot start any refuel mode airborne', () => {
    for (const rate of ['0', '1', '2']) {
        const r = efb(false, rate);
        const start = r.elements.find((element) => element.props?.className?.includes('flex w-20'));
        start.props.onClick();
        assert.notEqual(r.values.get(startKey), true);
    }
});
