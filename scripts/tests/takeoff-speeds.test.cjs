/* eslint-env node */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const source = fs.readFileSync(
    path.join(__dirname, '../../hdw-a339x/src/systems/instruments/src/MCDU/legacy/NXSpeeds.ts'),
    'utf8',
);
const context = { exports: {} };
vm.runInNewContext(
    ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    context,
);
const speeds = context.exports.NXSpeedsUtils;
const fmcSource = fs.readFileSync(
    path.join(__dirname, '../../hdw-a339x/src/systems/instruments/src/MCDU/legacy/A32NX_FMCMainDisplay.ts'),
    'utf8',
);
const fmcTree = ts.createSourceFile('fmc.ts', fmcSource, ts.ScriptTarget.Latest, true);
const warningMethods = fmcTree.statements
    .filter(ts.isClassDeclaration)
    .flatMap((declaration) => Array.from(declaration.members))
    .filter((member) => ['getToSpeedsTooLow', 'toSpeedsChecks'].includes(member.name?.getText(fmcTree)));
assert.equal(warningMethods.length, 2);
context.NXSpeedsUtils = speeds;
context.FlightPlanIndex = { Active: 0 };
context.NXSystemMessages = {
    checkToData: 'CHECK TAKE OFF DATA',
    toSpeedTooLow: 'T.O SPEED TOO LOW',
    vToDisagree: 'V SPEEDS DISAGREE',
};
context.Arinc429SignStatusMatrix = { NormalOperation: 3 };
vm.runInNewContext(
    ts.transpileModule(
        `class Warning { ${warningMethods.map((member) => member.getText(fmcTree)).join('\n')} } exports.check = Warning.prototype.getToSpeedsTooLow; exports.Warning = Warning;`,
        {
            compilerOptions: { module: ts.ModuleKind.CommonJS },
        },
    ).outputText,
    context,
);

test('KSEA 230.2t CONF 1 uses interpolated stall speed, retaining minimum-speed checks', () => {
    const minimumV2 = 1.13 * speeds.getVs1g(230.2, 1, true);
    assert.ok(Math.abs(minimumV2 - 160.5504) < 1e-9);
    assert.ok(161 >= minimumV2);
    assert.ok(160 < minimumV2);
    assert.ok(148 >= speeds.getVmcg(432));
    assert.ok(155 >= 1.05 * speeds.getVmca(432));
    assert.ok(161 >= 1.1 * speeds.getVmca(432));
    const rig = {
        getGrossWeight: () => 231.3,
        getFlightPlan: () => ({ performanceData: { takeoffFlaps: { get: () => 1 }, taxiFuel: { get: () => 1.1 } } }),
        getDepartureElevation: () => 432,
        getPressureAltAtElevation: () => 432,
        getBaroCorrection1: () => 29.97,
        isAnEngineOn: () => false,
        v1Speed: 148,
        vRSpeed: 155,
        v2Speed: 161,
    };
    assert.equal(context.exports.check.call(rig), false);
    assert.equal(context.exports.check.call({ ...rig, v2Speed: 160 }), true);
    assert.equal(context.exports.check.call({ ...rig, v1Speed: 120 }), true);
    assert.equal(context.exports.check.call({ ...rig, vRSpeed: 125 }), true);
    assert.equal(context.exports.check.call({ ...rig, getGrossWeight: () => 241.1 }), true);
    for (const conf of [1, 2, 3]) {
        for (let mass = 130; mass < 250; mass += 10) {
            const lower = speeds.getVs1g(mass, conf, true);
            const upper = speeds.getVs1g(mass + 10, conf, true);
            assert.equal(speeds.getVs1g(mass + 5, conf, true), (lower + upper) / 2);
        }
    }
    assert.equal(speeds.getVs1g(127, 1, true), speeds.getVs1g(130, 1, true));
    assert.equal(speeds.getVs1g(251, 1, true), speeds.getVs1g(250, 1, true));
});

test('control-speed interpolation uses supplied endpoints and scalar knots without Avionics', () => {
    const table = [
        [0, 100],
        [1000, 300],
    ];
    assert.equal(speeds.interpolateTable(table, -100), 100);
    assert.equal(speeds.interpolateTable(table, 0), 100);
    assert.equal(speeds.interpolateTable(table, 500), 200);
    assert.equal(speeds.interpolateTable(table, 1000), 300);
    assert.equal(speeds.interpolateTable(table, 9000), 300);
    assert.equal(speeds.getVmca(9000), 117);
    assert.equal(speeds.getVmcg(9000), 118);
    for (const altitude of [NaN, Infinity, -Infinity, undefined, null]) {
        assert.ok(Number.isNaN(speeds.getVmca(altitude)));
        assert.ok(Number.isNaN(speeds.getVmcg(altitude)));
    }
});

test('stall-speed lookup rejects unavailable mass/config and documents only permitted endpoint clamping', () => {
    for (const mass of [NaN, Infinity, -Infinity, undefined, null, -5, 0, 126.999, 251.001]) {
        assert.ok(Number.isNaN(speeds.getVs1g(mass, 1, true)), String(mass));
    }
    for (const conf of [NaN, Infinity, undefined, null, -1, 1.5, 6, 99]) {
        assert.ok(Number.isNaN(speeds.getVs1g(230.2, conf, true)), String(conf));
    }
    for (const conf of [0, 1, 2, 3, 4, 5]) {
        assert.equal(speeds.getVs1g(127, conf, true), speeds.getVs1g(130, conf, true));
        assert.equal(speeds.getVs1g(251, conf, true), speeds.getVs1g(250, conf, true));
    }
});

test('9000 ft departures retain VMCG/VMCA minimum warnings', () => {
    const rig = {
        getGrossWeight: () => 230.2,
        getFlightPlan: () => ({ performanceData: { takeoffFlaps: { get: () => 1 }, taxiFuel: { get: () => 0 } } }),
        getDepartureElevation: () => 9000,
        getPressureAltAtElevation: () => 9000,
        getBaroCorrection1: () => 29.92,
        isAnEngineOn: () => false,
        v1Speed: 118,
        vRSpeed: 123,
        v2Speed: 161,
    };
    assert.equal(context.exports.check.call(rig), false);
    assert.equal(context.exports.check.call({ ...rig, v1Speed: 117 }), true);
    assert.equal(context.exports.check.call({ ...rig, vRSpeed: 122 }), true);
});

function warningRig() {
    const state = { mass: 230.2, pressureAltitude: 432, flaps: 1, taxiFuel: 0 };
    const messages = [];
    const bits = new Map();
    const fmc = Object.assign(new context.exports.Warning(), {
        getGrossWeight: () => state.mass,
        getFlightPlan: () => ({
            performanceData: {
                takeoffFlaps: { get: () => state.flaps },
                taxiFuel: { get: () => state.taxiFuel },
            },
        }),
        getDepartureElevation: () => 432,
        getPressureAltAtElevation: () => state.pressureAltitude,
        getBaroCorrection1: () => 29.92,
        isAnEngineOn: () => false,
        v1Speed: 148,
        vRSpeed: 155,
        v2Speed: 161,
        toSpeedsCheckUnavailable: false,
        toSpeedsTooLow: false,
        toSpeedsNotInserted: false,
        vSpeedDisagree: false,
        vSpeedsValid: () => true,
        addMessageToQueue: (message, isResolved) => messages.push({ message, isResolved }),
        arincDiscreteWord3: { setBitValue: (bit, value) => bits.set(bit, value), setSsm() {} },
    });
    return { fmc, state, messages, bits };
}

test('production minimum check returns null for unavailable or invalid physical inputs', () => {
    const { fmc, state } = warningRig();
    for (const [key, values] of [
        ['mass', [null, undefined, NaN, Infinity, -1, 126.999, 251.001]],
        ['pressureAltitude', [null, undefined, NaN, Infinity, -Infinity]],
        ['flaps', [null, undefined, NaN, -1, 1.5, 99]],
        ['taxiFuel', [NaN, Infinity]],
    ]) {
        const original = state[key];
        for (const value of values) {
            state[key] = value;
            assert.equal(fmc.getToSpeedsTooLow(), null, `${key}=${String(value)}`);
        }
        state[key] = original;
    }
    state.mass = 127;
    assert.equal(fmc.getToSpeedsTooLow(), false);
    state.mass = 251;
    assert.equal(fmc.getToSpeedsTooLow(), true);
});

test('unknown-state warning transitions once, resolves with valid limits, then retains low-speed protection', () => {
    const { fmc, state, messages, bits } = warningRig();
    state.pressureAltitude = NaN;
    for (let i = 0; i < 10; i++) fmc.toSpeedsChecks();
    assert.deepEqual(
        messages.map(({ message }) => message),
        ['CHECK TAKE OFF DATA'],
    );
    assert.equal(messages[0].isResolved(), false);
    assert.equal(fmc.toSpeedsCheckUnavailable, true);
    assert.equal(fmc.toSpeedsTooLow, false);
    assert.equal(bits.get(17), false);
    assert.equal(bits.get(18), false);

    state.pressureAltitude = 432;
    assert.equal(messages[0].isResolved(), true);
    fmc.toSpeedsChecks();
    assert.equal(fmc.toSpeedsCheckUnavailable, false);
    assert.equal(messages.length, 1);

    fmc.v2Speed = 160;
    for (let i = 0; i < 10; i++) fmc.toSpeedsChecks();
    assert.deepEqual(
        messages.map(({ message }) => message),
        ['CHECK TAKE OFF DATA', 'T.O SPEED TOO LOW'],
    );
    assert.equal(messages[1].isResolved(), false);
    assert.equal(fmc.toSpeedsTooLow, true);
    assert.equal(bits.get(17), true);
    fmc.v2Speed = 161;
    assert.equal(messages[1].isResolved(), true);
    fmc.toSpeedsChecks();
    assert.equal(bits.get(17), false);

    state.mass = NaN;
    fmc.toSpeedsChecks();
    fmc.toSpeedsChecks();
    assert.equal(messages.filter(({ message }) => message === 'CHECK TAKE OFF DATA').length, 2);
});

test('missing or invalid entered speeds set NOT INSERTED without unknown-limit message spam', () => {
    for (const speed of ['v1Speed', 'vRSpeed', 'v2Speed']) {
        for (const value of [null, undefined, NaN, Infinity, -1, 0]) {
            const { fmc, state, messages, bits } = warningRig();
            state.pressureAltitude = NaN;
            fmc[speed] = value;
            fmc.toSpeedsChecks();
            assert.equal(bits.get(18), true, `${speed}=${String(value)}`);
            assert.equal(fmc.toSpeedsCheckUnavailable, false);
            assert.equal(messages.length, 0);
        }
    }
});
