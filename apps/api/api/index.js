'use strict'

// Entry point for Vercel serverless deployment.
// dist/ is copied alongside this file during installCommand (cp -r apps/api/dist apps/api/api/dist)
// so that @vercel/node can package it correctly.
const { handler } = require('./dist/serverless')
module.exports = handler
