// nextjs doesnt support typescript in this file
// we need to use commonjs here

require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  cwd: __dirname,
})

module.exports = require('@/devtools/babel-config').config({
  dir: __dirname,
  target: 'nextjs',
  twrncConfig: require('#/twrnc-config').twrncConfig,
})
