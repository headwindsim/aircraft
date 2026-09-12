// Synthetic API fixtures test parsing and selection, not aircraft performance calibration.
// node --test scripts/tests/takeoff-report.test.cjs
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const code = ts.transpileModule(
    fs.readFileSync(path.join(root, 'hdw-a339x/src/systems/shared/src/performance/a339x_takeoff_report.ts'), 'utf8'),
    {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    },
).outputText;
function load(fetch) {
    const context = { exports: {}, URL, fetch };
    vm.runInNewContext(code, context);
    return context.exports;
}
const { parseA339TakeoffReport: parse, normalizeTakeoffRunway: runway } = load();
function fixture() {
    return {
        aircraft: { icaocode: 'A339', reg: 'NTEST' },
        destination: { icao_code: 'EHAM' },
        general: { icao_airline: 'TEST', flight_number: '1' },
        params: { units: 'KGS', time_generated: '2026-09-11T12:00:00Z' },
        text: { tlr_section: 'TAKEOFF AND LANDING REPORT\nSYNTHETIC TEST FIXTURE' },
        tlr: {
            takeoff: {
                conditions: {
                    airport_icao: 'KSEA',
                    planned_runway: '16L',
                    planned_weight: '230200',
                    wind_direction: '180',
                    wind_speed: '10',
                    temperature: '18',
                    altimeter: '29.99',
                    surface_condition: 'dry',
                },
                runway: {
                    identifier: '16L',
                    speeds_v1: '140',
                    speeds_vr: '145',
                    speeds_v2: '150',
                    flex_temperature: '50',
                    flap_setting: '2',
                    thrust_setting: 'FLEX',
                    bleed_setting: 'ON',
                    anti_ice_setting: 'OFF',
                    max_weight: '251000',
                    limit_code: 'S',
                    // FAA KSEA16L dimensions. Parser deliberately does not infer raw TLR distance units.
                    length_tora: '11901',
                    length_toda: '11901',
                    length_asda: '11901',
                    gradient: '-0.6',
                },
            },
        },
    };
}
test('KSEA16L single-runway report retains source results without inventing conversions', () => {
    const report = parse(fixture(), 'KSEA');
    assert.equal(report.runways.length, 1);
    assert.equal(report.plannedRunway, '16L');
    assert.equal(report.runways[0].v1, 140);
    assert.equal(report.runways[0].vr, 145);
    assert.equal(report.runways[0].v2, 150);
    assert.equal(report.runways[0].flex, 50);
    assert.equal(report.altimeter, '29.99');
    assert.ok(report.reportText.includes('SYNTHETIC TEST FIXTURE'));
    assert.equal(report.runways[0].length_tora, undefined);
});
test('multiple runways retain their own speeds and normalize runway identifiers', () => {
    const data = fixture();
    const first = data.tlr.takeoff.runway;
    data.tlr.takeoff.runway = [first, { ...first, identifier: '34R', speeds_v1: '141' }];
    const report = parse(data);
    assert.equal(report.runways.find((row) => row.runway === '34R').v1, 141);
    assert.equal(
        report.runways.find((row) => row.runway === '16R'),
        undefined,
    );
    assert.equal(runway('RWY9L'), '09L');
    assert.equal(runway('RW00'), '');
    assert.equal(runway('37'), '');
});
test('missing, foreign-aircraft and mismatched-airport reports cannot supply results', () => {
    assert.throws(() => parse({}), /not for an A339/);
    const data = fixture();
    assert.throws(() => parse(data, 'KJFK'), /report is for KSEA/);
    delete data.tlr;
    assert.throws(() => parse(data), /Enable Runway Analysis/);
});
test('empty XML tags, malformed speeds and overweight results never become zero or valid speeds', () => {
    for (const invalid of ['', {}, null, 'NaN', 'Infinity', '140junk', -5]) {
        const data = fixture();
        data.tlr.takeoff.runway.speeds_v1 = invalid;
        const row = parse(data).runways[0];
        assert.match(row.unavailableReason, /ordered set/);
        assert.equal(row.v1, undefined);
        assert.equal(row.flex, undefined);
    }
    const data = fixture();
    data.tlr.takeoff.runway.speeds_v1 = '151';
    assert.match(parse(data).runways[0].unavailableReason, /ordered set/);
    data.tlr.takeoff.runway.speeds_v1 = '140';
    data.tlr.takeoff.runway.max_weight = '230000';
    assert.match(parse(data).runways[0].unavailableReason, /exceeds.*weight limit/);
    delete data.tlr.takeoff.runway.max_weight;
    assert.match(parse(data).runways[0].unavailableReason, /missing.*weight/);
});
test('missing FLEX is not guessed as TOGA, and duplicate runways are rejected', () => {
    const data = fixture();
    data.tlr.takeoff.runway.flex_temperature = {};
    assert.equal(parse(data).runways[0].flex, undefined);
    data.tlr.takeoff.runway = [data.tlr.takeoff.runway, data.tlr.takeoff.runway];
    assert.throws(() => parse(data), /Duplicate/);
});
test('weight units require agreement with the OFP weight; distance and QNH units stay untouched', () => {
    const data = fixture();
    assert.equal(parse(data).weightUnits, '');
    data.weights = { est_tow: '230200' };
    assert.equal(parse(data).weightUnits, 'KGS');
    data.params.units = 'lbs';
    assert.equal(parse(data).weightUnits, 'LBS');
    data.tlr.takeoff.conditions.planned_weight = '230201';
    assert.equal(parse(data).weightUnits, '');
    assert.equal(parse(data).altimeter, '29.99');
});
test('documented OFP fetch encodes identity without AbortSignal and reports network errors', async () => {
    let seen;
    const api = load(async (url, options) => {
        seen = { url: new URL(url), options };
        return { ok: true, json: async () => fixture() };
    });
    await api.fetchA339TakeoffReport('name&x=1', '', 'KSEA');
    assert.equal(seen.url.hostname, 'www.simbrief.com');
    assert.equal(seen.url.searchParams.get('username'), 'name&x=1');
    assert.equal(seen.url.searchParams.has('x'), false);
    assert.equal('signal' in seen.options, false);
    await api.fetchA339TakeoffReport('ignored', '12345', 'KSEA');
    assert.equal(seen.url.searchParams.get('userid'), '12345');
    assert.equal(seen.url.searchParams.has('username'), false);
    await assert.rejects(api.fetchA339TakeoffReport('', '', 'KSEA'), /Pilot ID/);
    const bad = load(async () => ({ ok: false, status: 503 }));
    await assert.rejects(bad.fetchA339TakeoffReport('user', '', 'KSEA'), /503/);
});
