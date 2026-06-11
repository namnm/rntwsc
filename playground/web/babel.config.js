// nextjs doesnt support typescript in this file
// we need to use commonjs here

require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  target: __dirname,
  babel: false,
  alias: false,
})

module.exports = require('@/devtools/babel-config').config({
  dir: __dirname,
  target: 'nextjs',
  twrncConfig: require('#/twrnc-config').twrncConfig,
})
