// nextjs doesnt support typescript in this file
// we need to use js here

require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  cwd: __dirname,
})
const { path } = require('@/nodejs/path')

module.exports = require('@/devtools/postcss-config').config({
  twExtractOutputPath: path.join(__dirname, '../app'),
})
