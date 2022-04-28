// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @type {import('vls').VeturConfig} */
module.exports = {
  // support monorepos
  projects: [
    './client', // shorthand for only root.
    './client/packages/object-inspector', // shorthand for only root.
  ]
}
