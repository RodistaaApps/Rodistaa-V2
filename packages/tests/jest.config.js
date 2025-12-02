module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/unit'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    '../**/*.ts',
    '!../**/*.d.ts',
    '!../**/node_modules/**',
  ],
};

