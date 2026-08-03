'use strict'

// Entry point for Vercel serverless deployment.
// NestJS is pre-compiled to dist/ by the build command (nest build).
// This file is CommonJS so Vercel's Node.js runtime loads it directly.
const { handler } = require('../dist/serverless')
module.exports = handler
