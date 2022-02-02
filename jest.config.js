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
    '^@config': '<rootDir>/config.js',
    '^@models/(.*)$': '<rootDir>/lib/models/$1',
    '^@routes/(.*)$': '<rootDir>/lib/routes/$1',

    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  moduleFileExtensions: ['js'],

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/_.*\\.js',
    '<rootDir>/tests/.eslintrc.js',
    '<rootDir>/tests/test-files/*'
  ],

  setupFiles: ['<rootDir>/tests/_env.js']
}
