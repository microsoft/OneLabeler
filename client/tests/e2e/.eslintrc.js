// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  plugins: [
    'cypress',
  ],
  env: {
    mocha: true,
    'cypress/globals': true,
  },
  rules: {
    strict: 'off',
  },
};
