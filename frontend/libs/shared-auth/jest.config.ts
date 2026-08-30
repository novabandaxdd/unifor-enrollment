/* eslint-disable */
export default {
  displayName: 'shared-auth',
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
    '^@unifor/shared-auth$':
      '<rootDir>/src/index.ts',
    '^@unifor/shared-data-access$':
      '<rootDir>/../shared-data-access/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/libs/shared-auth',
};
