// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    globals: {
        NODE_ENV: 'test',
        __DEV__: true
    },
    // Indicates whether each individual test should be reported during the run
    verbose: true,
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
    // The directory where Jest should output its   files
    coverageDirectory: 'coverage',
    // The glob patterns Jest uses to detect test files
    testMatch: [
        '<rootDir>/test/**/*.(js|jsx)'
    ],
    // An array of directory names to be searched recursively up from the requiring module's location
    moduleDirectories: ['node_modules', 'src'],
    // An array of file extensions your modules use
    moduleFileExtensions: ['js', 'json', 'jsx'],
    // A map from regular expressions to module names that allow to stub out resources with a single module
    moduleNameMapper: {
        '^conf(.*)$': '<rootDir>/src/conf$1',
        '^styles(.*)$': '<rootDir>/src/styles$1',
        '^utils(.*)$': '<rootDir>/src/utils$1',
        '^images(.*)$': '<rootDir>/src/images$1',
        '^constants(.*)$': '<rootDir>/src/constants$1',
        '^services(.*)$': '<rootDir>/src/services$1',
        '^components(.*)$': '<rootDir>/src/components$1',
        '^containers(.*)$': '<rootDir>/src/containers$1',
        '\\.(css|less|scss)$': 'identity-obj-proxy'
    },
    // A map from regular expressions to paths to transformers
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/fileTransformer.js'
    }
};