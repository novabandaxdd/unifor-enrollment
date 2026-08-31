/* eslint-disable */
module.exports = {
  displayName: 'enrollment-app',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.(ts|mjs|js|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
        diagnostics: { ignoreCodes: ['TS151001'] },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|keycloak-js|keycloak-angular))',
  ],
  moduleNameMapper: {
    '^@unifor/shared-auth$':
      '<rootDir>/../../libs/shared-auth/src/index.ts',
    '^@unifor/shared-data-access$':
      '<rootDir>/../../libs/shared-data-access/src/index.ts',
    '^@unifor/shared-ui$':
      '<rootDir>/../../libs/shared-ui/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'js', 'mjs', 'cjs', 'html'],
  coverageDirectory: '../../coverage/apps/enrollment-app',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/test-setup.ts',
  ],
};
