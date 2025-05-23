import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    env: {
      CLIENT_ID: '',
      CLIENT_SECRET: '',
      AIRCRAFT_PROJECT_PREFIX: 'a339x',
    },
    environment: 'jsdom',
    setupFiles: ['./build-common/src/jest/setupJestMock.ts'],
    onConsoleLog: console.log,
  },
});
