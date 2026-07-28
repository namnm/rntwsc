// react native metro doesnt support typescript in this file
// we need to use js here
require('tsx/cjs')
module.exports = require('rntwsc/devtools/babel-config').config({
  dir: __dirname,
  target: 'rn',
  ...require('./babel-plugin-tw-config'),
})
