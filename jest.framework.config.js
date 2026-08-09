const baseConfig = require("./jest.config");

module.exports = {
  ...baseConfig,
  collectCoverageFrom: [
    "force-app/main/default/lwc/flowConfig*/**/*.js",
    "!force-app/main/default/lwc/flowConfig*/__tests__/**"
  ],
  testMatch: [
    "<rootDir>/force-app/main/default/lwc/flowConfig*/__tests__/**/*.test.js",
    "<rootDir>/examples/main/default/lwc/flowConfig*/__tests__/**/*.test.js"
  ],
  coverageDirectory: "coverage/flow-config",
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
