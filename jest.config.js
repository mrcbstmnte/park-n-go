'use strict'

module.exports = {
  verbose: true,
  resetMocks: true,
  resetModules: true,
  restoreMocks: true,

  testEnvironment: 'node',

  roots: ['<rootDir>'],
  modulePaths: [
    '<rootDir>'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@models/(.*)$': '<rootDir>/lib/models/$1',
    '^@routes/(.*)$': '<rootDir>/lib/routes/$1',

    '^@tests/(.*)$': '<rootDir>/__tests__/$1'
  },
  moduleFileExtensions: ['js'],

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/_.*\\.js',
    '<rootDir>/__tests__/.eslintrc.js',
    '<rootDir>/__tests__/test-files/*'
  ],

  setupFiles: ['<rootDir>/__tests__/_env.js']
}
