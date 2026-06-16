// nextjs doesnt support typescript mix with cjs
// we need to use js here
require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  target: __dirname,
  alias: false,
})
const { mergeWithArray } = require('@/shared/lodash')

module.exports = mergeWithArray(
  {},
  require('#/tailwind-config').config,
  require('#/twrnc-config').twrncConfig,
)
