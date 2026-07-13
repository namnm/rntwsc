// react native metro doesnt support typescript in this file
// we need to use js here
require('tsx/cjs')
const { path } = require('rntwsc/devtools/path')

module.exports = require('rntwsc/devtools/metro-config').config({
  dir: __dirname,
  repoRoot: path.join(__dirname, '../../'),
})
