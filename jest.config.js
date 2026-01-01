module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/core/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@domain/(.*)$': '<rootDir>/domain/$1',
    '^@infrastructure/(.*)$': '<rootDir>/infrastructure/$1',
    '^@application/(.*)$': '<rootDir>/application/$1',
    '^@presentation/(.*)$': '<rootDir>/presentation/$1',
  },
};
