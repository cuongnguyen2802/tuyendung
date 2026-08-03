'use strict'

// Entry point for Vercel serverless deployment.
// dist/ is compiled by buildCommand (nest build) before this runs.
const { handler } = require('../dist/serverless')
module.exports = handler
