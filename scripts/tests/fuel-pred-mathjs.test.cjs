/* eslint-env node */
// Regression values captured before the mathjs typing repair, not performance calibration.
// node --test scripts/tests/fuel-pred-mathjs.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const file = path.resolve(
    __dirname,
    '../../hdw-a339x/src/systems/instruments/src/MCDU/legacy/A32NX_Core/A32NX_FuelPred.ts',
);
const cases = [
    { method: 'computeAirDistance', args: [0, 0], expected: 1 },
    { method: 'computeAirDistance', args: [200, -50], expected: 224 },
    { method: 'computeAirDistance', args: [1000, 100], expected: 824 },
    { method: 'computeAirDistance', args: [9000, -150], expected: 13182 },
    { method: 'computeHoldingTrackFF', args: [127, 120], expected: 1524 },
    { method: 'computeHoldingTrackFF', args: [180, 120], expected: 2030 },
    { method: 'computeHoldingTrackFF', args: [230, 390], expected: 9881 },
    { method: 'computeUserAltTime', args: [1200, 120], expected: -0 },
    { method: 'computeUserAltTime', args: [3000, 200], expected: 28 },
    { method: 'computeUserAltTime', args: [8000, 300], expected: 85 },
    { method: 'computeNumbers', args: [200, 120, 'time', false], expected: 45 },
    { method: 'computeNumbers', args: [200, 120, 'time', true], expected: 44 },
    { method: 'computeNumbers', args: [200, 120, 'fuel', false], expected: 5411 },
    { method: 'computeNumbers', args: [200, 120, 'fuel', true], expected: 3902 },
    { method: 'computeNumbers', args: [200, 120, 'corrections', false], expected: 9 },
    { method: 'computeNumbers', args: [200, 120, 'corrections', true], expected: 8 },
    { method: 'computeNumbers', args: [2000, 330, 'time', false], expected: 262 },
    { method: 'computeNumbers', args: [2000, 330, 'fuel', false], expected: 20435 },
    { method: 'computeNumbers', args: [2000, 330, 'corrections', false], expected: 52 },
    { method: 'computeNumbers', args: [8400, 390, 'time', false], expected: 1084 },
    { method: 'computeNumbers', args: [8400, 390, 'fuel', false], expected: 83446 },
    { method: 'computeNumbers', args: [8400, 390, 'corrections', false], expected: 594 },
];

test('fuel prediction preserves the existing rounded BigNumber polynomial results', () => {
    const context = { exports: {}, require };
    vm.runInNewContext(
        ts.transpileModule(fs.readFileSync(file, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
        }).outputText,
        context,
    );
    for (const { method, args, expected } of cases) {
        assert.equal(context.exports.A32NX_FuelPred[method](...args), expected, `${method}(${args.join(', ')})`);
    }
});

test('fuel prediction compiles against the installed mathjs API without scalar or matrix casts', () => {
    const program = ts.createProgram([file], {
        noEmit: true,
        skipLibCheck: true,
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.equal(
        diagnostics.length,
        0,
        ts.formatDiagnostics(diagnostics, {
            getCanonicalFileName: (name) => name,
            getCurrentDirectory: () => process.cwd(),
            getNewLine: () => '\n',
        }),
    );
});
