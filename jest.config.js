/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./build-common/src/jest/setupJestMock.js'],
  globals: {
    'ts-jest': {
      // Babel assumes isolated modules, therefore enable it here as well.
      // This also speeds up the unit testing performance.
      isolatedModules: true,
      diagnostics: {
        ignoreCodes: ['TS151001'],
      },
    },
  },
  modulePathIgnorePatterns: [
    'hdw-a333x/src/systems/fmgc/src/flightplanning',
    'hdw-a339x/src/systems/fmgc/src/flightplanning',
    'hdw-su95x/src/systems/fmgc/src/flightplanning',
  ],
  moduleNameMapper: {
    '@flybywiresim/fbw-sdk': '<rootDir>/hdw-common/src/systems/index.ts',
  },
};
