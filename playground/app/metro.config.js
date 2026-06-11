// react native metro doesnt support typescript in this file
// we need to use js here

require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  target: __dirname,
  alias: false,
})

module.exports = require('@/devtools/metro-config').config({
  dir: __dirname,
})
