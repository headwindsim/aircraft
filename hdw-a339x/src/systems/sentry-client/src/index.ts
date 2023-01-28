import { FbwAircraftSentryClient } from './FbwAircraftSentryClient';

declare const process: any;

new FbwAircraftSentryClient().onInstrumentLoaded({
    dsn: process.env.SENTRY_DSN,
    buildInfoFilePrefix: 'a339x',
    root: false,
    enableTracing: false,
});
