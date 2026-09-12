// React DOM tests using the existing test dependencies.
// node --test scripts/tests/takeoff-report-ui.test.cjs
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { createRequire } = require('node:module');
let JSDOM;
try {
    ({ JSDOM } = require('jsdom'));
} catch {
    ({ JSDOM } = createRequire(require.resolve('jest-environment-jsdom'))('jsdom'));
}
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
// React 17 otherwise picks Node's MessageChannel, whose ports keep this DOM-only test alive.
const savedMessageChannel = global.MessageChannel;
global.MessageChannel = undefined;
const React = require('react');
const ReactDOM = require('react-dom');
const { act } = require('react-dom/test-utils');
const root = path.resolve(__dirname, '../..');
const file = 'hdw-a339x-common/src/systems/instruments/src/EFB/Performance/Widgets/A339TakeoffReport.tsx';
function compile(file) {
    return ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
        fileName: file,
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            jsx: ts.JsxEmit.React,
            esModuleInterop: true,
        },
    }).outputText;
}
function report() {
    return {
        airport: 'KSEA',
        destination: 'EHAM',
        registration: 'NTEST',
        airline: 'TEST',
        flightNumber: '1',
        scheduledDeparture: '1789156800',
        flight: 'TEST1',
        generated: '2026-09-11T12:00:00Z',
        plannedRunway: '16L',
        plannedWeight: '230200',
        weightUnits: 'kgs',
        wind: '180 / 10 kt',
        temperature: '18',
        altimeter: '29.99',
        surface: 'dry',
        runways: [
            { runway: '16L', v1: 140, vr: 145, v2: 150, flex: 50 },
            { runway: '34R', v1: 141, vr: 146, v2: 151, flex: 45 },
        ],
        reportText: 'TAKEOFF AND LANDING REPORT\nTORA 11901 FT\nQNH 29.99 INHG',
    };
}
function rig(overrides = {}) {
    let flight = {
        departingAirport: 'KSEA',
        departingRunway: '16L',
        arrivingAirport: 'EHAM',
        aircraftReg: 'NTEST',
        airline: 'TEST',
        flightNum: '1',
        schedOut: '1789156800',
        departingMetar: '18010KT 18/10',
        weights: { estTakeOffWeight: '230200' },
        fuels: { planTakeOff: 30000 },
        units: 'kgs',
        route: 'TEST ROUTE',
        ...overrides,
    };
    const requests = [];
    const browserUrls = [];
    const timers = new Map();
    let timerId = 0;
    const dependencies = {
        react: React,
        '@flybywiresim/fbw-sdk': { NXDataStore: { getLegacy: () => 'test-user' } },
        '../../Store/store': { useAppSelector: (selector) => selector({ simbrief: { data: flight } }) },
        '@shared/performance/a339x_takeoff_report': {
            normalizeTakeoffRunway: (value) => value,
            fetchA339TakeoffReport: (_name, _id, airport) =>
                new Promise((resolve, reject) => {
                    requests.push({ resolve, reject, airport });
                }),
        },
    };
    const context = {
        exports: {},
        OpenBrowser: (url) => browserUrls.push(url),
        setTimeout: (fn) => {
            const id = ++timerId;
            timers.set(id, () => {
                timers.delete(id);
                fn();
            });
            return id;
        },
        clearTimeout: (id) => timers.delete(id),
        require: (name) => {
            if (!(name in dependencies)) throw new Error(name);
            return dependencies[name];
        },
    };
    vm.runInNewContext(compile(file), context, { filename: file });
    const Component = context.exports.A339TakeoffReport;
    const container = document.createElement('div');
    document.body.append(container);
    const render = () =>
        act(() => {
            ReactDOM.render(React.createElement(Component), container);
        });
    render();
    return {
        container,
        requests,
        browserUrls,
        timers,
        text: () => container.textContent,
        metrics: () => [...container.querySelectorAll('.text-4xl')].map((n) => n.textContent.trim()),
        start: () =>
            act(async () =>
                container.querySelector('button').dispatchEvent(new window.MouseEvent('click', { bubbles: true })),
            ),
        complete: (value = report()) =>
            act(async () => {
                requests.at(-1).resolve(value);
            }),
        update: (changes) => {
            flight = { ...flight, ...changes };
            render();
        },
        select: (value) =>
            act(() => {
                const button = [...container.querySelectorAll('[aria-label="Runway"] button')].find(
                    (button) => button.textContent === value,
                );
                assert.ok(button, `Missing runway ${value}`);
                button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
            }),
        unmount: () =>
            act(async () => {
                ReactDOM.unmountComponentAtNode(container);
                container.remove();
            }),
    };
}
test('actual React report selects only requested runway and never falls back to another runway', async () => {
    const r = rig({ departingRunway: '16R' });
    try {
        await r.start();
        assert.equal(r.container.querySelector('button').disabled, true);
        await r.complete();
        assert.match(r.text(), /No result for this runway/);
        assert.equal(
            r.metrics().every((m) => m.startsWith('---')),
            true,
        );
        r.select('34R');
        assert.equal(r.metrics()[0], '141 kt');
        assert.equal(r.metrics()[3], '45 ' + String.fromCharCode(176) + 'C');
    } finally {
        await r.unmount();
    }
});
test('actual React report hides results when runway, weight, weather, fuel, route or units change', async () => {
    for (const change of [
        { departingRunway: '34R' },
        { weights: { estTakeOffWeight: '240200' } },
        { departingMetar: '30025KT 32/12' },
        { fuels: { planTakeOff: 50000 } },
        { route: 'DIFFERENT ROUTE' },
        { units: 'lbs' },
    ]) {
        const r = rig();
        try {
            await r.start();
            await r.complete();
            assert.equal(r.metrics()[0], '140 kt');
            r.update(change);
            assert.match(r.text(), /tablet flight changed/);
            assert.deepEqual(r.metrics(), []);
        } finally {
            await r.unmount();
        }
    }
});
test('actual React report rejects mismatched destination, registration, flight or departure time', async () => {
    for (const change of [
        { destination: 'EGLL' },
        { registration: 'NOT-THE-TAIL' },
        { flightNumber: '2' },
        { scheduledDeparture: '1789243200' },
    ]) {
        const r = rig();
        try {
            await r.start();
            await r.complete({ ...report(), ...change });
            assert.equal(r.metrics().length, 0);
            assert.ok(r.container.querySelector('[role=alert]'));
        } finally {
            await r.unmount();
        }
    }
});
test('without AbortController, import handles timeout, retry, late responses and unmount', async () => {
    const r = rig();
    try {
        await r.start();
        r.update({ departingRunway: '34R' });
        await r.complete();
        assert.match(r.text(), /tablet flight changed/);
        assert.deepEqual(r.metrics(), []);
        await r.start();
        const timedOut = r.requests.at(-1);
        await act(async () => {
            [...r.timers.values()][0]();
        });
        assert.match(r.text(), /timed out/);
        assert.equal(r.container.querySelector('button').disabled, false);
        await r.start();
        await r.complete();
        assert.equal(r.metrics()[0], '141 kt');
        assert.equal(r.container.querySelector('[role=alert]'), null);
        await act(async () => {
            timedOut.resolve({ ...report(), airport: 'WRONG' });
        });
        assert.equal(r.metrics()[0], '141 kt');
        assert.doesNotMatch(r.text(), /WRONG/);
        await r.start();
        const pending = r.requests.at(-1);
        await r.unmount();
        await act(async () => {
            pending.resolve(report());
        });
        assert.equal(r.timers.size, 0);
    } finally {
        if (r.container.isConnected) await r.unmount();
    }
});
test('without DOMParser, React renders report text literally using supported controls', async () => {
    const r = rig();
    try {
        await r.start();
        await r.complete({
            ...report(),
            reportText:
                'TAKEOFF AND LANDING REPORT\nTORA 11901 FT\nQNH 29.99 INHG & TEST\n<script>evil()</script><img src=x onerror="evil()">',
        });
        act(() => {
            r.container
                .querySelector('[aria-expanded]')
                .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        });
        assert.equal(r.container.querySelector('script,style,img,iframe'), null);
        assert.equal(r.container.querySelector('select,details,pre,dl,dt,dd'), null);
        const text = r.container.querySelector('[data-report-text]').textContent;
        assert.match(text, /11901 FT/);
        assert.match(text, /29.99 INHG & TEST/);
        assert.match(text, /<script>evil\(\)<\/script>/);
    } finally {
        await r.unmount();
    }
});
test('calculator link uses the simulator external-browser API with the official URL', async () => {
    const r = rig();
    try {
        act(() => {
            r.container
                .querySelector('a')
                .dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
        });
        assert.deepEqual(r.browserUrls, ['https://dispatch.simbrief.com/performance']);
    } finally {
        await r.unmount();
    }
});

test('Performance app includes takeoff report with no native takeoff calculator', () => {
    const aircraft = React.createContext({ performanceCalculators: { landing: {}, takeoff: undefined } });
    let tabs;
    const dependencies = {
        react: React,
        '../Localization/translation': { t: (s) => s },
        '../UtilComponents/Navbar': {
            Navbar: (props) => {
                tabs = props.tabs;
                return null;
            },
        },
        '../TODCalculator/TODCalculator': { TODCalculator: () => null },
        './Widgets/LandingWidget': { LandingWidget: () => null },
        './Widgets/A339TakeoffReport': { A339TakeoffReport: () => null },
        '../Utils/routing': { PageRedirect: () => null, TabRoutes: () => null },
        '../AircraftContext': { AircraftContext: aircraft },
    };
    const context = { exports: {}, require: (name) => dependencies[name] };
    vm.runInNewContext(
        compile('hdw-a339x-common/src/systems/instruments/src/EFB/Performance/Performance.tsx'),
        context,
    );
    const container = document.createElement('div');
    try {
        act(() => {
            ReactDOM.render(React.createElement(context.exports.Performance), container);
        });
        assert.deepEqual(
            Array.from(tabs, (tab) => tab.name),
            ['Takeoff', 'Top of Descent', 'Landing'],
        );
    } finally {
        act(() => {
            ReactDOM.unmountComponentAtNode(container);
        });
    }
});

test.after(() => {
    dom.window.close();
    global.MessageChannel = savedMessageChannel;
});
