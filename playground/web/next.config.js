// since we are in commonjs webpack
// we need to use js here
require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  target: __dirname,
  alias: false,
})

module.exports = require('@/devtools/next-config').config({
  dir: __dirname,
})
