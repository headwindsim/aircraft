/* eslint-env node, es6 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const aircraft = 'hdw-a339x/src/systems/fmgc/src/';
const inherited = 'flybywire/fbw-a32nx/src/systems/fmgc/src/';
const cache = new Map();
const reasons = new Proxy({}, { get: (_, key) => key });
const sdk = { MathUtils: { DEGREES_TO_RADIANS: Math.PI / 180, RADIANS_TO_DEGREES: 180 / Math.PI } };

// Exercise production prediction modules and selected methods with supplied atmosphere, profiles and simulator interfaces.
function load(name, from = '') {
    if (name === '@flybywiresim/fbw-sdk' || name === '@microsoft/msfs-sdk') return sdk;
    if (name.endsWith('ApproachPathBuilder'))
        return {
            DEFAULT_AIRCRAFT_CONTROL_SURFACE_CONFIG: { speedbrakesExtended: false, flapConfig: 0, gearExtended: false },
        };
    if (name.endsWith('NavGeometryProfile'))
        return { ProfilePhase: { Climb: 0, Cruise: 1, Descent: 2 }, VerticalCheckpointReason: reasons };
    if (name.endsWith('SpeedProfile')) return { ManagedSpeedType: { Climb: 0, Cruise: 1 } };
    if (name.endsWith('FpmConfig')) return { FpmConfigs: { A320_HONEYWELL_H3: {} } };
    if (name.endsWith('VnavConfig')) return { VnavConfig: {} };
    if (name === '@shared/autopilot') return { ArmedVerticalMode: {}, VerticalMode: {}, isArmed: () => false };
    const relative = name.startsWith('@fmgc/') ? name.slice(6) : path.posix.join(path.posix.dirname(from), name);
    if (cache.has(relative)) return cache.get(relative);
    const file = [aircraft, inherited].map((base) => path.join(root, base, relative + '.ts')).find(fs.existsSync);
    assert.ok(file, name);
    const context = {
        exports: {},
        console,
        require: (dependency) => load(dependency, relative),
        SimVar: { GetSimVarValue: () => 0 },
    };
    cache.set(relative, context.exports);
    vm.runInNewContext(
        ts.transpileModule(fs.readFileSync(file, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
        }).outputText,
        context,
        { filename: file },
    );
    return context.exports;
}

function methods(relative, className, names, globals) {
    const file = path.join(root, aircraft, relative + '.ts');
    const tree = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const declaration = tree.statements.find((node) => ts.isClassDeclaration(node) && node.name.text === className);
    const selected = declaration.members.filter((node) => names.includes(node.name?.getText(tree)));
    assert.equal(selected.length, names.length);
    const context = { exports: {}, ...globals };
    vm.runInNewContext(
        ts.transpileModule(
            `class Subject { ${selected.map((node) => node.getText(tree)).join('\n')} } exports.prototype = Subject.prototype;`,
            {
                compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
            },
        ).outputText,
        context,
    );
    return context.exports.prototype;
}

const { A330AircraftConfig: config } = load('@fmgc/flightplanning/A330AircraftConfig');
const { Common } = load('@fmgc/guidance/vnav/common');
const { ClimbThrustClimbStrategy } = load('@fmgc/guidance/vnav/climb/ClimbStrategy');
const { ClimbPathBuilder } = load('@fmgc/guidance/vnav/climb/ClimbPathBuilder');
const { CruisePathBuilder } = load('@fmgc/guidance/vnav/cruise/CruisePathBuilder');
const { CruiseToDescentCoordinator } = load('@fmgc/guidance/vnav/CruiseToDescentCoordinator');
const { BaseGeometryProfile } = load('@fmgc/guidance/vnav/profile/BaseGeometryProfile');
const { TemporaryCheckpointSequence } = load('@fmgc/guidance/vnav/profile/TemporaryCheckpointSequence');
const { EngineModel } = load('@fmgc/guidance/vnav/EngineModel');
const { Predictions } = load('@fmgc/guidance/vnav/Predictions');
const { InvalidVnavPredictionError, assertValidForwardStep } = load('@fmgc/guidance/vnav/PredictionValidation');
const parameters = {
    zeroFuelWeight: 172300 * 2.20462262,
    tropoPause: 36090,
    perfFactor: 0,
    managedClimbSpeedMach: 0.82,
    managedCruiseSpeedMach: 0.82,
    managedCruiseSpeed: 300,
    cruiseAltitude: 35000,
    fcuVerticalMode: 0,
    fcuArmedVerticalMode: 0,
};
const observer = { get: () => parameters };
const atmosphere = {
    isaDeviation: 5,
    predictStaticAirTemperatureAtAltitude: (altitude) => Common.getIsaTemp(altitude) + 5,
    computeCasFromMach: () => 280,
};
const speedProfile = { getTarget: () => 300, shouldTakeClimbSpeedLimitIntoAccount: () => false };
const strategy = new ClimbThrustClimbStrategy(observer, atmosphere, config);
const checkpoint = (altitude = 35000, distance = 0) => ({
    reason: reasons.TopOfClimb,
    altitude,
    distanceFromStart: distance,
    secondsFromPresent: 0,
    remainingFuelOnBoard: 40000 * 2.20462262,
    speed: 300,
    mach: 0.82,
    profilePhase: 1,
});
const validStep = (initialAltitude, finalAltitude) => ({
    initialAltitude,
    finalAltitude,
    timeElapsed: 120,
    distanceTraveled: 20,
    fuelBurned: 100,
    speed: 300,
    verticalSpeed: (finalAltitude - initialAltitude) / 2,
    pathAngle: 1,
});
function profile(altitude = 35000) {
    const result = new BaseGeometryProfile(config);
    Object.assign(result, {
        checkpoints: [checkpoint(altitude)],
        maxAltitudeConstraints: [],
        maxClimbSpeedConstraints: [],
        cruiseSteps: [],
        distanceToPresentPosition: 0,
        winds: { getClimbTailwind: () => 0, getCruiseTailwind: () => 0 },
        ignoreCruiseStep: () => {},
    });
    return result;
}

test('production A339 predictor rejects infeasible climb before time/distance reversal or fuel gain', () => {
    const impossible = strategy.predictToAltitude(35000, 36000, 300, 0.82, 40000 * 2.20462262, 0);
    assert.ok(impossible.timeElapsed < 0 && impossible.distanceTraveled < 0 && impossible.fuelBurned < 0);
    const bad = profile();
    const before = JSON.stringify(bad.checkpoints);
    assert.throws(
        () => new ClimbPathBuilder(observer, atmosphere).computeClimbPath(bad, config, strategy, speedProfile, 36000),
        InvalidVnavPredictionError,
    );
    assert.equal(JSON.stringify(bad.checkpoints), before);
    const good = profile(31000);
    new ClimbPathBuilder(observer, atmosphere).computeClimbPath(good, config, strategy, speedProfile, 32000);
    good.finalizeProfile();
    assert.equal(good.lastCheckpoint.altitude, 32000);
    assert.ok(
        good.lastCheckpoint.secondsFromPresent > 0 &&
            good.lastCheckpoint.remainingFuelOnBoard < good.checkpoints[0].remainingFuelOnBoard,
    );
});

test('non-finite, error-marked and stalled forward predictions fail, while reverse descent timestamps are valid', () => {
    for (const field of ['finalAltitude', 'distanceTraveled', 'timeElapsed', 'fuelBurned', 'speed']) {
        for (const value of [NaN, Infinity, -Infinity])
            assert.throws(
                () => assertValidForwardStep({ ...validStep(35000, 36000), [field]: value }),
                InvalidVnavPredictionError,
            );
    }
    assert.throws(() => assertValidForwardStep({ ...validStep(35000, 36000), error: 0 }), InvalidVnavPredictionError);
    assert.throws(
        () =>
            assertValidForwardStep({ ...validStep(35000, 36000), timeElapsed: 0, distanceTraveled: 0, fuelBurned: 0 }),
        InvalidVnavPredictionError,
    );
    const stalled = {
        predictToAltitude: (alt) => ({ ...validStep(alt, alt), distanceTraveled: 0, timeElapsed: 0, fuelBurned: 0 }),
    };
    assert.throws(
        () =>
            new ClimbPathBuilder(observer, atmosphere).computeClimbPath(
                profile(),
                config,
                stalled,
                speedProfile,
                36000,
            ),
        InvalidVnavPredictionError,
    );
    const descent = profile();
    descent.checkpoints = [
        { ...checkpoint(35000), secondsFromPresent: -120 },
        { ...checkpoint(30000, 20), secondsFromPresent: 0 },
    ];
    descent.finalizeProfile();
    assert.equal(descent.isReadyToDisplay, true);
    descent.checkpoints[1].altitude = NaN;
    assert.throws(() => descent.finalizeProfile(), InvalidVnavPredictionError);
    assert.equal(descent.isReadyToDisplay, false);
});

test('A339 weight/altitude/temperature/Mach sweep yields forward progress or an explicit unavailable prediction', () => {
    let accepted = 0;
    let rejected = 0;
    for (const tonnes of [150, 180, 212.3, 251])
        for (const altitude of [10000, 25000, 33000, 35000, 38000]) {
            for (const isaDeviation of [-15, 0, 20])
                for (const mach of [0.78, 0.84]) {
                    const localParameters = {
                        ...parameters,
                        zeroFuelWeight: 127000 * 2.20462262,
                        managedClimbSpeedMach: mach,
                    };
                    const localObserver = { get: () => localParameters };
                    const localAtmosphere = {
                        ...atmosphere,
                        isaDeviation,
                        predictStaticAirTemperatureAtAltitude: (alt) => Common.getIsaTemp(alt) + isaDeviation,
                    };
                    const localStrategy = new ClimbThrustClimbStrategy(localObserver, localAtmosphere, config);
                    const p = profile(altitude);
                    p.checkpoints[0].remainingFuelOnBoard = (tonnes - 127) * 1000 * 2.20462262;
                    const initialFuel = p.checkpoints[0].remainingFuelOnBoard;
                    try {
                        new ClimbPathBuilder(localObserver, localAtmosphere).computeClimbPath(
                            p,
                            config,
                            localStrategy,
                            speedProfile,
                            altitude + 1000,
                        );
                        p.finalizeProfile();
                        assert.equal(p.lastCheckpoint.altitude, altitude + 1000);
                        assert.ok(p.lastCheckpoint.secondsFromPresent > 0 && p.lastCheckpoint.distanceFromStart > 0);
                        assert.ok(p.lastCheckpoint.remainingFuelOnBoard <= initialFuel);
                        accepted++;
                    } catch (error) {
                        assert.ok(error instanceof InvalidVnavPredictionError, String(error));
                        assert.equal(p.isReadyToDisplay, false);
                        rejected++;
                    }
                }
        }
    assert.equal(accepted + rejected, 120);
    assert.ok(accepted > 0 && rejected > 0);
});

test('cruise remains level until a step, climbs locally, then levels; rejected steps create no climb marker', () => {
    const p = profile();
    p.cruiseSteps = [
        { waypointIndex: 2, distanceFromStart: 100, toAltitude: 37000 },
        { waypointIndex: 4, distanceFromStart: 200, toAltitude: 39000 },
    ];
    const predicted = new CruisePathBuilder(observer, atmosphere).computeCruisePath(
        p,
        config,
        p.lastCheckpoint,
        500,
        { predictToAltitude: validStep },
        { predictToAltitude: validStep },
        speedProfile,
    );
    assert.deepEqual(
        Array.from(predicted.checkpoints, (point) => [point.distanceFromStart, point.altitude]),
        [
            [0, 35000],
            [100, 35000],
            [120, 37000],
            [200, 37000],
            [220, 39000],
            [500, 39000],
        ],
    );
    const bad = profile();
    bad.cruiseSteps = [{ waypointIndex: 2, distanceFromStart: 100, toAltitude: 37000 }];
    const rejected = new CruisePathBuilder(observer, atmosphere).computeCruisePath(
        bad,
        config,
        bad.lastCheckpoint,
        500,
        { predictToAltitude: () => ({ ...validStep(35000, 37000), timeElapsed: -1 }) },
        {},
        speedProfile,
    );
    assert.equal(bad.cruiseSteps[0].isIgnored, true);
    assert.ok(rejected.checkpoints.every((point) => point.altitude === 35000 && point.reason !== reasons.StepClimb));
});

test('cruise acceleration uses current fuel and altitude, and step descent receives Mach', () => {
    const builder = new CruisePathBuilder(observer, atmosphere);
    const original = Predictions.speedChangeStep;
    const calls = [];
    Predictions.speedChangeStep = (...args) => {
        calls.push(args);
        return { ...validStep(args[2], args[2]), speed: args[4] };
    };
    try {
        builder.levelAccelerationStep(config, 39000, 12345, 280, 300, 0);
        assert.equal(calls[0][2], 39000);
        assert.equal(calls[0][9], 12345);
    } finally {
        Predictions.speedChangeStep = original;
    }
    const sequence = new TemporaryCheckpointSequence(checkpoint(37000));
    let receivedMach;
    assert.equal(
        builder.tryAddStepFromLastCheckpoint(
            profile(),
            sequence,
            { toAltitude: 35000 },
            {},
            {
                predictToAltitude: (a, b, s, m) => {
                    receivedMach = m;
                    return validStep(a, b);
                },
            },
            500,
        ),
        true,
    );
    assert.equal(receivedMach, 0.82);
    assert.ok(Number.isFinite(EngineModel.getClimbThrustCorrectedN1(config.engineModelParameters, -3000, 15)));
    assert.equal(
        EngineModel.getClimbThrustCorrectedN1(config.engineModelParameters, -3000, 15),
        EngineModel.getClimbThrustCorrectedN1(config.engineModelParameters, -2000, 15),
    );
    assert.ok(Number.isFinite(EngineModel.getClimbThrustCorrectedN1(config.engineModelParameters, 41500, -50)));
    assert.equal(
        EngineModel.getClimbThrustCorrectedN1(config.engineModelParameters, 50000, -50),
        EngineModel.getClimbThrustCorrectedN1(config.engineModelParameters, 41500, -50),
    );
    assert.ok(Number.isNaN(EngineModel.getClimbThrustCorrectedN1(config.engineModelParameters, NaN, -50)));
});

test('acceleration is clipped to the remaining distance at both level-segment boundaries', () => {
    for (const withConstraint of [false, true]) {
        const p = profile();
        p.checkpoints[0].speed = 280;
        if (withConstraint) p.maxClimbSpeedConstraints = [{ distanceFromStart: 2 }];
        const builder = new ClimbPathBuilder(observer, atmosphere);
        builder.computeLevelFlightAccelerationStep = () => ({
            ...validStep(35000, 35000),
            distanceTraveled: 10,
            timeElapsed: 100,
            fuelBurned: 50,
        });
        builder.addLevelSegmentSteps(p, config, speedProfile, withConstraint ? 4 : 2);
        assert.equal(p.checkpoints[1].distanceFromStart, 2);
        assert.equal(p.checkpoints[1].secondsFromPresent, 20);
        assert.equal(p.checkpoints[0].remainingFuelOnBoard - p.checkpoints[1].remainingFuelOnBoard, 10);
        assert.ok(p.lastCheckpoint.distanceFromStart <= (withConstraint ? 4 : 2));
        assert.throws(
            () => builder.scaleStepBasedOnLastCheckpoint(p.lastCheckpoint, validStep(35000, 35000), 2),
            InvalidVnavPredictionError,
        );
        assert.throws(
            () =>
                builder.scaleStepBasedOnLastCheckpoint(
                    p.lastCheckpoint,
                    { ...validStep(35000, 35000), fuelBurned: -1 },
                    0,
                ),
            InvalidVnavPredictionError,
        );
    }
});

test('rejecting a step rebuilds descent at the retained cruise altitude before joining profiles', () => {
    const p = profile();
    p.cruiseSteps = [{ isIgnored: false }];
    let approaches = 0;
    const cruise = {
        getFinalCruiseAltitude: () => (p.cruiseSteps[0].isIgnored ? 35000 : 37000),
        computeCruisePath: () => {
            p.cruiseSteps[0].isIgnored = true;
            return new TemporaryCheckpointSequence(checkpoint(), {
                ...checkpoint(35000, 500),
                remainingFuelOnBoard: 4000,
            });
        },
    };
    const descent = {
        computeManagedDescentPath: (sequence, unusedProfile, unusedSpeed, altitude) =>
            sequence.push({ ...checkpoint(altitude, 500), reason: reasons.TopOfDescent, remainingFuelOnBoard: 4000 }),
    };
    const approach = {
        computeApproachPath: () => {
            approaches++;
            return new TemporaryCheckpointSequence({
                ...checkpoint(3000, 1000),
                reason: reasons.Decel,
                remainingFuelOnBoard: 4000,
            });
        },
    };
    const coordinator = new CruiseToDescentCoordinator(observer, cruise, descent, approach, config);
    coordinator.buildCruiseAndDescentPath(p, speedProfile, {}, {});
    assert.equal(approaches, 2);
    assert.equal(p.checkpoints.find((point) => point.reason === reasons.TopOfDescent).altitude, 35000);
    const nonfinite = new CruiseToDescentCoordinator(
        observer,
        {
            ...cruise,
            computeCruisePath: () =>
                new TemporaryCheckpointSequence(checkpoint(), {
                    ...checkpoint(35000, 500),
                    secondsFromPresent: Infinity,
                }),
        },
        descent,
        approach,
        config,
    );
    assert.throws(
        () => nonfinite.buildCruiseAndDescentPath(profile(), speedProfile, {}, {}),
        InvalidVnavPredictionError,
    );
});

test('failed cruise/descent construction cannot finalize a partial profile and recovers after correction', () => {
    for (const failure of [
        'missing-start',
        'missing-approach',
        'empty-approach',
        'missing-decel',
        'missing-tod',
        'missing-cruise',
        'empty-cruise',
        'no-intercept',
    ]) {
        let fault = failure;
        const p = profile();
        if (fault === 'missing-start') p.checkpoints[0].reason = reasons.AtmosphericConditions;
        if (fault === 'no-intercept') p.checkpoints[0].distanceFromStart = 600;
        const before = JSON.stringify(p.checkpoints);
        const coordinator = new CruiseToDescentCoordinator(
            observer,
            {
                getFinalCruiseAltitude: () => 35000,
                computeCruisePath: () => {
                    if (fault === 'missing-cruise') return undefined;
                    if (fault === 'empty-cruise') return new TemporaryCheckpointSequence();
                    return new TemporaryCheckpointSequence(checkpoint(), {
                        ...checkpoint(35000, 500),
                        remainingFuelOnBoard: 4000,
                    });
                },
            },
            {
                computeManagedDescentPath: (sequence) => {
                    if (fault !== 'missing-tod') {
                        sequence.push({
                            ...checkpoint(35000, 500),
                            reason: reasons.TopOfDescent,
                            remainingFuelOnBoard: 4000,
                        });
                    }
                },
            },
            {
                computeApproachPath: () => {
                    if (fault === 'missing-approach') return undefined;
                    if (fault === 'empty-approach') return new TemporaryCheckpointSequence();
                    return new TemporaryCheckpointSequence({
                        ...checkpoint(3000, 1000),
                        reason: fault === 'missing-decel' ? reasons.AtmosphericConditions : reasons.Decel,
                        remainingFuelOnBoard: 4000,
                    });
                },
            },
            config,
        );
        const buildAndFinalize = () => {
            coordinator.buildCruiseAndDescentPath(p, speedProfile, {}, {});
            p.finalizeProfile();
        };
        assert.throws(buildAndFinalize, InvalidVnavPredictionError, failure);
        assert.equal(p.isReadyToDisplay, false, failure);
        assert.equal(JSON.stringify(p.checkpoints), before, failure);
        fault = undefined;
        p.checkpoints = [checkpoint()];
        buildAndFinalize();
        assert.equal(p.isReadyToDisplay, true, failure);
        assert.ok(
            p.checkpoints.some((point) => point.reason === reasons.TopOfDescent),
            failure,
        );
    }
});

test('a present position past TOD still accepts the completed descent without a cruise segment', () => {
    const p = profile();
    p.checkpoints[0] = { ...checkpoint(35000, 600), reason: reasons.PresentPosition };
    const coordinator = new CruiseToDescentCoordinator(
        observer,
        {
            getFinalCruiseAltitude: () => 35000,
            computeCruisePath: () => assert.fail('Past TOD needs no cruise segment'),
        },
        {
            computeManagedDescentPath: (sequence) =>
                sequence.push({ ...checkpoint(35000, 500), reason: reasons.TopOfDescent }),
        },
        {
            computeApproachPath: () =>
                new TemporaryCheckpointSequence({ ...checkpoint(3000, 1000), reason: reasons.Decel }),
        },
        config,
    );
    coordinator.buildCruiseAndDescentPath(p, speedProfile, {}, {});
    p.finalizeProfile();
    assert.equal(p.isReadyToDisplay, true);
    assert.ok(p.checkpoints.some((point) => point.reason === reasons.Decel));
});

test('profile eligibility rejects missing or non-finite mass, fuel, position and approach speeds', () => {
    const prototype = methods(
        'guidance/vnav/VerticalProfileComputationParameters',
        'VerticalProfileComputationParametersObserver',
        ['canComputeProfile'],
        { FmgcFlightPhase: { Takeoff: 1 } },
    );
    const valid = {
        cleanSpeed: 210,
        slatRetractionSpeed: 180,
        flapRetractionSpeed: 160,
        approachSpeed: 140,
        zeroFuelWeight: 350000,
        cruiseAltitude: 35000,
        fuelOnBoard: 120000,
        presentPosition: { alt: 432 },
        thrustReductionAltitude: 1500,
        accelerationAltitude: 1500,
        flightPhase: 0,
    };
    const rig = { parameters: valid, fmgc: { getGrossWeight: () => 230.2 } };
    assert.equal(prototype.canComputeProfile.call(rig), true);
    for (const field of [
        'zeroFuelWeight',
        'cruiseAltitude',
        'fuelOnBoard',
        'cleanSpeed',
        'slatRetractionSpeed',
        'flapRetractionSpeed',
        'approachSpeed',
        'thrustReductionAltitude',
        'accelerationAltitude',
    ]) {
        for (const value of [NaN, Infinity, -1])
            assert.equal(
                prototype.canComputeProfile.call({ ...rig, parameters: { ...valid, [field]: value } }),
                false,
                field,
            );
    }
    assert.equal(
        prototype.canComputeProfile.call({ ...rig, parameters: { ...valid, presentPosition: undefined } }),
        false,
    );
});

test('failed recompute clears stale guidance even on first run and can recover', () => {
    const writes = new Map();
    const globals = {
        console: { error() {} },
        SimVar: { SetSimVarValue: (name, unit, value) => writes.set(name, value) },
        McduSpeedProfile: class {},
    };
    const driver = methods('guidance/vnav/VnavDriver', 'VnavDriver', ['recompute', 'reset'], globals);
    const calls = [];
    const rig = Object.assign(Object.create(driver), {
        version: 0,
        predictionFailed: false,
        oldLegs: new Map([[1, {}]]),
        profileManager: { reset: () => calls.push('profiles') },
        constraintReader: { reset: () => calls.push('constraints') },
        aircraftToDescentProfileRelation: { reset: () => calls.push('relation') },
        descentGuidance: { reset: () => calls.push('guidance') },
        guidanceController: {
            pseudoWaypoints: { acceptVerticalProfile: () => calls.push('markers') },
            activeGeometry: { legs: new Map([[1, { predictedTas: 450, predictedGs: 470 }]]) },
        },
        recomputeProfile: () => {
            throw new InvalidVnavPredictionError('test');
        },
    });
    rig.recompute({});
    assert.equal(writes.get('L:A32NX_FM_VERTICAL_PROFILE_AVAIL'), false);
    assert.deepEqual(calls, ['profiles', 'constraints', 'relation', 'guidance', 'markers']);
    assert.equal(rig.oldLegs.size, 0);
    assert.equal(rig.guidanceController.activeGeometry.legs.get(1).predictedTas, undefined);
    assert.equal(rig.guidanceController.activeGeometry.legs.get(1).predictedGs, undefined);
    assert.equal(rig.requestDescentProfileRecomputation, true);
    assert.equal(rig.predictionFailed, true);
    rig.recomputeProfile = () => {
        rig.version++;
    };
    rig.recompute({});
    assert.equal(rig.predictionFailed, false);
    assert.equal(rig.version, 1);
    const manager = methods('guidance/vnav/VerticalProfileManager', 'VerticalProfileManager', ['reset'], {});
    let estimatesReset = false;
    const managerRig = {
        cruiseToDescentCoordinator: {
            resetEstimations: () => {
                estimatesReset = true;
            },
        },
        mcduProfile: {},
        ndProfile: {},
        descentProfile: {},
        expediteProfile: {},
    };
    manager.reset.call(managerRig);
    assert.equal(estimatesReset, true);
    assert.equal(managerRig.mcduProfile, undefined);
});

test('both descent guidance variants immediately clear exported targets and modes on reset', () => {
    for (const name of ['DescentGuidance', 'LatchedDescentGuidance']) {
        const writes = new Map();
        const prototype = methods(
            `guidance/vnav/descent/${name}`,
            name,
            ['reset', 'writeToSimVars', 'changeSpeedState'],
            {
                SimVar: { SetSimVarValue: (key, unit, value) => writes.set(key, value) },
                RequestedVerticalMode: { None: 0 },
                DescentVerticalGuidanceState: { InvalidProfile: 0 },
                DescentSpeedGuidanceState: { NotInDescentPhase: 0, TargetAndMargins: 2 },
                PathCaptureState: { OffPath: 0 },
            },
        );
        const todPrototype = methods('guidance/vnav/descent/TodGuidance', 'TodGuidance', ['reset'], {
            SimVar: { SetSimVarValue: (key, unit, value) => writes.set(key, value) },
        });
        const tod = Object.assign(Object.create(todPrototype), {
            tdReached: true,
            apEngaged: true,
            tdArmed: { setVar: (value) => writes.set('armed', value) },
        });
        const rig = Object.assign(Object.create(prototype), {
            requestedVerticalMode: 5,
            speedState: 2,
            targetAltitudeGuidance: NaN,
            targetVerticalSpeed: -1500,
            showLinearDeviationOnPfd: true,
            todGuidance: tod,
        });
        rig.reset();
        assert.equal(writes.get('L:A32NX_FG_REQUESTED_VERTICAL_MODE'), 0);
        assert.equal(writes.get('L:A32NX_FG_TARGET_ALTITUDE'), 0);
        assert.equal(writes.get('L:A32NX_FG_TARGET_VERTICAL_SPEED'), 0);
        assert.equal(writes.get('L:A32NX_PFD_LINEAR_DEVIATION_ACTIVE'), false);
        assert.equal(writes.get('L:A32NX_PFD_SHOW_SPEED_MARGINS'), false);
        assert.equal(writes.get('L:A32NX_PFD_LOWER_SPEED_MARGIN'), 0);
        assert.equal(writes.get('L:A32NX_PFD_UPPER_SPEED_MARGIN'), 0);
        assert.equal(writes.get('L:A32NX_PFD_MSG_TD_REACHED'), false);
        assert.equal(writes.get('armed'), false);
        assert.equal(tod.tdReached, false);
    }
});

test('leg speed predictions use signed phase-specific wind and reject invalid converted values', () => {
    const prototype = methods('guidance/vnav/VnavDriver', 'VnavDriver', ['updateLegSpeedPredictions'], {
        ProfilePhase: { Climb: 0, Cruise: 1, Descent: 2 },
    });
    let tailwind = 10;
    let phase = 1;
    const calls = [];
    const leg = { calculated: { cumulativeDistanceWithTransitions: 100 }, predictedTas: 450, predictedGs: 470 };
    const rig = {
        profileManager: {
            mcduProfile: {
                isReadyToDisplay: true,
                interpolateEverythingFromStart: () => ({ altitude: 35000, speed: 300, profilePhase: phase }),
                distanceToPresentPosition: 0,
                winds: {
                    getClimbTailwind: () => {
                        calls.push('climb');
                        return tailwind;
                    },
                    getCruiseTailwind: () => {
                        calls.push('cruise');
                        return tailwind;
                    },
                    getDescentTailwind: () => {
                        calls.push('descent');
                        return tailwind;
                    },
                },
            },
        },
        guidanceController: { activeLegIndex: 0, activeGeometry: { legs: new Map([[0, leg]]) } },
        atmosphericConditions: { computeTasFromCas: () => NaN, currentWindSpeed: 10 },
    };
    prototype.updateLegSpeedPredictions.call(rig);
    assert.equal(leg.predictedTas, undefined);
    assert.equal(leg.predictedGs, undefined);
    rig.atmosphericConditions.computeTasFromCas = () => 450;
    tailwind = Infinity;
    prototype.updateLegSpeedPredictions.call(rig);
    assert.equal(leg.predictedTas, 450);
    assert.equal(leg.predictedGs, undefined);
    tailwind = -100;
    phase = 0;
    prototype.updateLegSpeedPredictions.call(rig);
    assert.equal(leg.predictedGs, 350);
    tailwind = 100;
    phase = 2;
    prototype.updateLegSpeedPredictions.call(rig);
    assert.equal(leg.predictedGs, 550);
    assert.deepEqual(calls, ['cruise', 'cruise', 'climb', 'descent']);
});

test('missing green-dot speed clears a prior expedite profile', () => {
    const prototype = methods(
        'guidance/vnav/VerticalProfileManager',
        'VerticalProfileManager',
        ['computeVerticalProfileForExpediteClimb'],
        { Simplane: { getGreenDotSpeed: () => 0 }, console },
    );
    const rig = { expediteProfile: { isReadyToDisplay: true }, observer: { get: () => ({}) } };
    prototype.computeVerticalProfileForExpediteClimb.call(rig);
    assert.equal(rig.expediteProfile, undefined);
});
