export default {
  displayName: 'enrollment-app',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/enrollment-app',
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
      '<rootDir>/../../libs/shared-auth/src/index.ts',
    '^@unifor/shared-data-access$':
      '<rootDir>/../../libs/shared-data-access/src/index.ts',
    '^@unifor/shared-ui$':
      '<rootDir>/../../libs/shared-ui/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.ts',
    '../../libs/**/*.ts',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/test-setup.ts',
  ],
};
