/* eslint-disable */
export default {
  displayName: 'shared-data-access',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: [],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        useESM: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@unifor/shared-data-access$':
      '<rootDir>/src/index.ts',
    '^@unifor/shared-auth$':
      '<rootDir>/../shared-auth/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/libs/shared-data-access',
};
