// node --test scripts/step-climb/step-climb.test.cjs
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const systems = 'hdw-a339x/src/systems/';
function load(file, dependencies = {}, globals = {}) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const context = {
        exports: {},
        console: { warn() {}, error() {} },
        ...globals,
        require(name) {
            if (!(name in dependencies)) throw new Error(`Unexpected dependency ${name}`);
            return dependencies[name];
        },
    };
    vm.runInNewContext(compiled, context, { filename: file });
    return context.exports;
}
const stepModule = load(systems + 'fmgc/src/flightplanning/CruiseStep.ts');

const messages = { notAllowed: 'NOT ALLOWED', formatError: 'FORMAT ERROR', stepAboveMaxFl: 'STEP ABOVE MAX FL' };
const page = load(systems + 'instruments/src/MCDU/legacy_pages/A320_Neo_CDU_StepAltsPage.ts', {
    '@fmgc/flightplanning/CruiseStep': stepModule,
    '@fmgc/flightplanning/FlightPlanManager': { FlightPlanIndex: { Active: 0, FirstSecondary: 2 } },
    '../messages/NXSystemMessages': {
        NXSystemMessages: messages,
        NXFictionalMessages: { notYetImplemented: 'NOT YET IMPLEMENTED' },
    },
    '../legacy/A320_Neo_CDU_Keypad': { Keypad: { clrValue: 'CLR' } },
}).CDUStepAltsPage;
function leg(ident, longitude, altitude) {
    return {
        ident,
        isDiscontinuity: false,
        cruiseStep: altitude ? { waypointIndex: 0, toAltitude: altitude } : undefined,
        terminationWaypoint: () => ({ ident, location: { lat: 50, long: longitude } }),
    };
}
function pageRig(
    initial = [
        [2, 35000],
        [4, 39000],
    ],
) {
    const legs = ['ORIG', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'].map((id, i) => leg(id, i));
    initial.forEach(([index, altitude]) => {
        legs[index].cruiseStep = { waypointIndex: index, toAltitude: altitude };
    });
    const calls = [];
    const errors = [];
    const warnings = [];
    const plan = {
        allLegs: legs,
        activeLegIndex: 1,
        performanceData: { cruiseFlightLevel: { get: () => 330 } },
        findLegIndexByFixIdent: (ident) => legs.findIndex((it) => it.ident === ident),
        legElementAt: (index) => legs[index],
    };
    const mcdu = {
        getFlightPlan: () => plan,
        getMaxFlCorrected: () => 400,
        setScratchpadMessage: (value) => errors.push(value),
        addMessageToQueue: (value) => warnings.push(value),
        flightPlanService: {
            async addOrUpdateCruiseStep(index, altitude, forPlan) {
                calls.push(['set', index, altitude, forPlan]);
                legs[index].cruiseStep = { waypointIndex: index, toAltitude: altitude };
            },
            async removeCruiseStep(index, forPlan) {
                calls.push(['remove', index, forPlan]);
                legs[index].cruiseStep = undefined;
            },
        },
    };
    return { mcdu, plan, calls, errors, warnings, steps: () => legs.filter((it) => it.cruiseStep) };
}
test('STEP ALTS creates, edits and clears actual cruise-step entries', async () => {
    const r = pageRig([]);
    await page.tryAddOrUpdateCruiseStepFromLeftInput(r.mcdu, () => {}, r.steps(), 0, 'FL350/TWO', 0);
    assert.equal(r.plan.allLegs[2].cruiseStep.toAltitude, 35000);
    await page.tryAddOrUpdateCruiseStepFromLeftInput(r.mcdu, () => {}, r.steps(), 0, '370', 0);
    assert.equal(r.plan.allLegs[2].cruiseStep.toAltitude, 37000);
    await page.tryAddOrUpdateCruiseStepFromLeftInput(r.mcdu, () => {}, r.steps(), 0, 'CLR', 0);
    assert.equal(r.plan.allLegs[2].cruiseStep, undefined);
    assert.equal(r.errors.length, 0);
});
test('STEP ALTS same-fix edit retains step; moving it validates before replacing', async () => {
    const r = pageRig();
    await page.onClickExistingStepClimb(r.mcdu, () => {}, r.steps(), 0, '360/TWO', 0);
    assert.equal(r.plan.allLegs[2].cruiseStep.toAltitude, 36000);
    assert.equal(r.calls.filter(([op]) => op === 'remove').length, 0);
    await page.onClickExistingStepClimb(r.mcdu, () => {}, r.steps(), 0, '/THREE', 0);
    assert.equal(r.plan.allLegs[3].cruiseStep.toAltitude, 36000);
    assert.equal(r.plan.allLegs[2].cruiseStep, undefined);
});
test('STEP ALTS rejects past, occupied, undersized, invalid and unsupported entries without changes', async () => {
    for (const input of ['/ORIG', '/FOUR', '395', '340/FOUR', '999/TWO', '350/TWO/10', 'BAD']) {
        const r = pageRig();
        await page.onClickExistingStepClimb(r.mcdu, () => {}, r.steps(), 0, input, 0);
        assert.equal(r.calls.length, 0, input);
        assert.equal(r.plan.allLegs[2].cruiseStep.toAltitude, 35000);
        assert.equal(r.errors.length, 1, input);
    }
    const r = pageRig([]);
    page.tryAddOrUpdateCruiseStepFromLeftInput(r.mcdu, () => {}, r.steps(), 0, '350/TWO/10', 0);
    assert.equal(r.calls.length, 0);
});
test('STEP ALTS replacement rejection preserves original and respects the A339X FL410 ceiling', async () => {
    const r = pageRig([[2, 35000]]);
    r.mcdu.flightPlanService.addOrUpdateCruiseStep = async () => {
        throw new Error('RPC rejected');
    };
    await assert.rejects(
        page.onClickExistingStepClimb(r.mcdu, () => {}, r.steps(), 0, '/THREE', 0),
        /RPC rejected/,
    );
    assert.equal(r.plan.allLegs[2].cruiseStep.toAltitude, 35000);
    assert.equal(r.calls.length, 0);
    assert.equal(page.tryParseAltitude('FL410'), 41000);
    assert.equal(page.tryParseAltitude('FL411'), false);
    const high = pageRig([]);
    await page.tryAddOrUpdateCruiseStepFromLeftInput(high.mcdu, () => {}, high.steps(), 0, 'FL410/TWO', 0);
    assert.equal(high.plan.allLegs[2].cruiseStep.toAltitude, 41000);
    assert.deepEqual(high.warnings, ['STEP ABOVE MAX FL']);
});
test('sequence validation checks every affected neighbour and blocks climbs after descent', () => {
    const validate = stepModule.isCruiseStepInsertionValid;
    assert.equal(validate([{ waypointIndex: 2, toAltitude: 35000 }], 2, 37000, 330), true);
    assert.equal(
        validate(
            [
                { waypointIndex: 4, toAltitude: 37000 },
                { waypointIndex: 6, toAltitude: 39000 },
            ],
            2,
            39000,
            330,
        ),
        false,
    );
    assert.equal(validate([], 2, 33500, 330), false);
    assert.equal(validate([], 2, Infinity, 330), false);
    assert.equal(validate([], 2, 35000, NaN), false);
});
function adapterRig(legs = [leg('ORIG', 0), leg('ONE', 1), leg('TWO', 2), leg('THREE', 3), leg('FOUR', 4)]) {
    const warnings = [];
    const calls = [];
    const imported = {};
    const plan = {
        allLegs: legs,
        activeLegIndex: 1,
        firstMissedApproachLegIndex: legs.length,
        setImportedPerformanceData: (value) => Object.assign(imported, value),
        setFlightNumber() {},
        originSegment: { legCount: 1 },
        departureRunwayTransitionSegment: { legCount: 0 },
        departureSegment: { legCount: 0 },
        departureEnrouteTransitionSegment: { legCount: 0 },
        enrouteSegment: { legCount: 0 },
        elementAt: (index) => legs[index],
    };
    const service = {
        uplink: plan,
        async newCityPair() {},
        async setAlternate() {},
        async addOrUpdateCruiseStep(index, altitude, planIndex) {
            calls.push([index, altitude, planIndex]);
            legs[index].cruiseStep = { waypointIndex: index, toAltitude: altitude };
        },
    };
    const raw = { general: { stepclimb_string: 'ORIG/0330/TWO/0350' }, parsed: { cruiseAltitude: 33000 } };
    const adapter = load(
        systems + 'fmgc/src/flightplanning/uplink/SimBriefUplinkAdapter.ts',
        {
            '@fmgc/flightplanning/CruiseStep': stepModule,
            '@flybywiresim/fbw-sdk': { simbriefDataParser: (data) => data.parsed },
            '@fmgc/flightplanning/FlightPlanManager': { FlightPlanIndex: { Uplink: 7 } },
            '@fmgc/flightplanning/NavigationDatabaseService': { NavigationDatabaseService: {} },
            '@fmgc/FmsError': { FmsErrorType: {} },
            'msfs-geo': { distanceTo: (a, b) => Math.hypot(a.lat - b.lat, a.long - b.long) * 60 },
        },
        { fetch: async () => ({ ok: true, json: async () => raw }) },
    ).SimBriefUplinkAdapter;
    const fms = {
        logTroubleshootingError: (value) => warnings.push(value),
        onUplinkInProgress() {},
        onUplinkDone() {
            calls.push(['done']);
        },
    };
    const ofp = {
        cruiseAltitude: 33000,
        origin: { icao: 'ORIG' },
        destination: { icao: 'DEST' },
        alternate: {},
        costIndex: '30',
        callsign: 'TEST',
        averageTropopause: '36000',
        navlog: [],
    };
    return { adapter, plan, service, fms, ofp, raw, calls, warnings, imported };
}
test('SimBrief download preserves explicit step metadata discarded by the shared parser', async () => {
    const r = adapterRig();
    const ofp = await r.adapter.downloadOfpForUserID('test');
    assert.equal(ofp.stepClimbString, 'ORIG/0330/TWO/0350');
    assert.equal(ofp.cruiseAltitude, 33000);
});
test('uplink imports cruise steps before completion and retains the initial cruise altitude', async () => {
    const r = adapterRig();
    r.ofp.stepClimbString = 'ORIG/0330/TWO/0350/FOUR/0370';
    await r.adapter.uplinkFlightPlanFromSimbrief(r.fms, r.service, 0, r.ofp, {});
    assert.deepEqual(r.calls, [[2, 35000, 7], [4, 37000, 7], ['done']]);
    assert.equal(r.imported.cruiseFlightLevel, 330);
    assert.equal(r.warnings.length, 0);
});
test('SimBrief matches named and lat/long steps against the supplied route', async () => {
    const r = adapterRig([leg('ORIG', 0), leg('AIRWAY', 1), leg('LL01', 10), leg('END', 12)]);
    r.ofp.navlog = [{ ident: '50N010E', type: 'ltlg', pos_lat: '50', pos_long: '10' }];
    r.ofp.stepClimbString = 'ORIG/0330 AIRWAY/0350 50N010E/0370';
    await r.adapter.uplinkCruiseSteps(r.fms, r.service, r.ofp);
    assert.deepEqual(r.calls, [
        [1, 35000, 7],
        [2, 37000, 7],
    ]);
});
test('SimBrief ignores absent metadata and reports missing, ambiguous, invalid or excessive steps', async () => {
    const empty = adapterRig();
    await empty.adapter.uplinkCruiseSteps(empty.fms, empty.service, empty.ofp);
    assert.equal(empty.calls.length, 0);
    const r = adapterRig([
        leg('ORIG', 0),
        leg('DUP', 1),
        leg('DUP', 2),
        leg('A', 3),
        leg('B', 4),
        leg('C', 5),
        leg('D', 6),
        leg('E', 7),
    ]);
    r.ofp.stepClimbString = 'ORIG/0330 INVALID MISSING/0350 DUP/0350 A/0350 B/0370 C/0390 D/0410 E/0400';
    await r.adapter.uplinkCruiseSteps(r.fms, r.service, r.ofp);
    assert.deepEqual(r.calls, [
        [3, 35000, 7],
        [4, 37000, 7],
        [5, 39000, 7],
        [6, 41000, 7],
    ]);
    assert.equal(r.warnings.length, 4);
    for (const token of ['TWO/9999', 'TWO/0335', 'TWO/NaN']) {
        const bad = adapterRig();
        bad.ofp.stepClimbString = token;
        await bad.adapter.uplinkCruiseSteps(bad.fms, bad.service, bad.ofp);
        assert.equal(bad.calls.length, 0);
        assert.equal(bad.warnings.length, 1);
    }
});

// Run the actual FCU step handlers without initializing the unrelated cockpit instrument.
const fmcFile = systems + 'instruments/src/MCDU/legacy/A32NX_FMCMainDisplay.ts';
const fmcSource = fs.readFileSync(path.join(root, fmcFile), 'utf8');
const fmcAst = ts.createSourceFile(fmcFile, fmcSource, ts.ScriptTarget.Latest, true);
const methods = [];
function collect(node) {
    if (
        ts.isMethodDeclaration(node) &&
        ['_onStepClimbDescent', 'deleteOutdatedCruiseSteps'].includes(node.name.getText(fmcAst))
    )
        methods.push(node.getText(fmcAst));
    ts.forEachChild(node, collect);
}
collect(fmcAst);
assert.equal(methods.length, 2);
const fcuCompiled = ts.transpileModule(`export class StepHandlers { ${methods.join('\n')} }`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
test('FCU step command updates cruise level and removes obsolete steps through the synced service', () => {
    let selectedAltitude = 37000;
    const context = {
        exports: {},
        Simplane: { getAutoPilotDisplayedAltitudeLockValue: () => selectedAltitude },
        FmgcFlightPhase: { Climb: 2, Cruise: 3 },
        NXSystemMessages: {
            newCrzAlt: { getModifiedMessage: (alt) => `NEW CRZ ALT ${alt}` },
            stepAhead: { text: 'STEP AHEAD' },
        },
    };
    vm.runInNewContext(fcuCompiled, context);
    const handlers = new context.exports.StepHandlers();
    const calls = [];
    const legs = [
        undefined,
        ...[35000, 37000, 39000].map((toAltitude) => ({ isDiscontinuity: false, cruiseStep: { toAltitude } })),
    ];
    handlers.flightPhaseManager = { phase: 3 };
    handlers.flightPlanService = {
        active: {
            activeLegIndex: 1,
            legCount: legs.length,
            elementAt: (i) => legs[i],
            performanceData: { cruiseFlightLevel: { get: () => 330 } },
        },
        removeCruiseStep(i) {
            calls.push(['remove', i]);
            legs[i].cruiseStep = undefined;
        },
        setPerformanceData: (...args) => calls.push(['performance', ...args]),
    };
    handlers.addMessageToQueue = (message) => calls.push(['message', message]);
    handlers.removeMessageFromQueue = () => {};
    handlers._onStepClimbDescent();
    assert.deepEqual(calls, [
        ['remove', 1],
        ['remove', 2],
        ['message', 'NEW CRZ ALT 37000'],
        ['performance', 'cruiseFlightLevel', 370],
    ]);
    assert.equal(legs[3].cruiseStep.toAltitude, 39000);
    calls.length = 0;
    handlers.flightPhaseManager.phase = 0;
    selectedAltitude = 39000;
    handlers._onStepClimbDescent();
    assert.equal(calls.length, 0);
});

// Real public SimBrief fixture field (initial 9000 ft, then step descent to 8000 ft):
// https://github.com/phpvms/phpvms/blob/master/tests/data/simbrief/briefing.json
// This is a parser fixture, not A339 performance evidence.
test('real SimBrief continuous slash-chain format imports the explicit step', async () => {
    const r = adapterRig([leg('OMAA', 0), leg('LOVOL', 1)]);
    r.ofp.origin.icao = 'OMAA';
    r.ofp.cruiseAltitude = 9000;
    r.ofp.stepClimbString = 'OMAA/0090/LOVOL/0080';
    await r.adapter.uplinkCruiseSteps(r.fms, r.service, r.ofp);
    assert.deepEqual(r.calls, [[1, 8000, 7]]);
    assert.equal(r.warnings.length, 0);
});
test('KSEA long-haul slash-chain imports multiple climbs and rejects ambiguous coordinate chains', async () => {
    const r = adapterRig([leg('KSEA', 0), leg('AVPUT', 1), leg('OCEAN', 2), leg('END', 3)]);
    r.ofp.origin.icao = 'KSEA';
    r.ofp.stepClimbString = 'KSEA/0330/AVPUT/0350/OCEAN/0370/END/0390';
    await r.adapter.uplinkCruiseSteps(r.fms, r.service, r.ofp);
    assert.deepEqual(r.calls, [
        [1, 35000, 7],
        [2, 37000, 7],
        [3, 39000, 7],
    ]);
    for (const malformed of ['KSEA/0330/50N/010E/0350/OCEAN/0370', 'KSEA/0330/AVPUT', 'KSEA//AVPUT/0350']) {
        const bad = adapterRig();
        bad.ofp.stepClimbString = malformed;
        await bad.adapter.uplinkCruiseSteps(bad.fms, bad.service, bad.ofp);
        assert.equal(bad.calls.length, 0);
        assert.equal(bad.warnings.length, 1);
    }
});

test('oversized step metadata is rejected once without flight-plan writes', async () => {
    const r = adapterRig();
    r.ofp.stepClimbString = 'ORIG/0330/TWO/0350/'.repeat(500);
    await r.adapter.uplinkCruiseSteps(r.fms, r.service, r.ofp);
    assert.equal(r.calls.length, 0);
    assert.equal(r.warnings.length, 1);
    assert.match(r.warnings[0], /too long/);
});
