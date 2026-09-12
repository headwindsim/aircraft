// node --test scripts/tests/datastore.test.cjs
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
function compile(relative) {
    return ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
}
const datastore = compile('hdw-common/src/systems/shared/src/persistence.ts');
const units = compile('flybywire/fbw-common/src/systems/instruments/src/NXUnits.ts');

test('tablet changes reach an already-loaded MCDU and its cached unit helper', () => {
    const storage = new Map([['A339X_CONFIG_USING_METRIC_UNIT', 'false']]);
    const listeners = [];
    let broadcasts = 0;
    function instrument() {
        const owner = {};
        const context = vm.createContext({
            window: {},
            process: { env: { AIRCRAFT_PROJECT_PREFIX: 'a339x' } },
            GetStoredData: (key) => storage.get(key) ?? '',
            SetStoredData: (key, value) => storage.set(key, value),
            RegisterViewListener: () => ({
                triggerToAllSubscribers: (event, ...args) => {
                    assert.ok(++broadcasts < 30, 'setting updates must not loop');
                    listeners.filter((l) => l.owner !== owner && l.event === event).forEach((l) => l.callback(...args));
                },
            }),
            Coherent: {
                on: (event, callback) => {
                    listeners.push({ owner, event, callback });
                    return { clear() {} };
                },
            },
        });
        const Subject = {
            create(value) {
                const subscribers = [];
                return {
                    get: () => value,
                    sub: (callback) => subscribers.push(callback),
                    set(next) {
                        if (Object.is(value, next)) return;
                        value = next;
                        subscribers.forEach((callback) => callback(next));
                    },
                };
            },
        };
        context.exports = {};
        context.require = () => ({ Subject });
        vm.runInContext(datastore, context);
        const { NXDataStore } = context.exports;
        context.exports = {};
        context.require = () => ({ NXDataStore });
        vm.runInContext(units, context);
        return { store: NXDataStore, units: context.exports.NXUnits };
    }
    const tablet = instrument();
    const mcdu = instrument();
    assert.equal(mcdu.units.userWeightUnit(), 'LBS'); // Initialize its cached subscription before changing the tablet.
    assert.equal(mcdu.units.kgToUser(172300), 172300 * 2.204625);
    tablet.store.getSetting('CONFIG_USING_METRIC_UNIT').set(true); // US units OFF.
    assert.equal(storage.get('A339X_CONFIG_USING_METRIC_UNIT'), 'true');
    assert.equal(mcdu.units.userWeightUnit(), 'KG');
    assert.equal(mcdu.units.kgToUser(172300), 172300);
    assert.equal(mcdu.units.userToKg(172.3), 172.3);
    tablet.store.getSetting('CONFIG_USING_METRIC_UNIT').set(false);
    assert.equal(mcdu.units.userWeightUnit(), 'LBS');
    mcdu.store.getSetting('CONFIG_USING_METRIC_UNIT').set(true);
    assert.equal(tablet.units.userWeightUnit(), 'KG');
    assert.equal(instrument().units.userWeightUnit(), 'KG');
});
