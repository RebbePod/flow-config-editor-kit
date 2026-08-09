const lwcConfig = require("@salesforce/eslint-config-lwc");

module.exports = [
  ...lwcConfig.configs.recommended,
  {
    ignores: [".localdevserver/**", "coverage/**", "node_modules/**"]
  },
  {
    files: ["**/__tests__/**/*.test.js"],
    rules: {
      "@lwc/lwc/no-unexpected-wire-adapter-usages": "off"
    }
  }
];
