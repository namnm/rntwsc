// reexport config at root to be compatible with vscode intellisense
require('./devtools-register')
const { mergeWithArray } = require('@/shared/lodash')

module.exports = mergeWithArray(
  {},
  require('@/core/tw/tailwind-config').config,
  require('@/core/tw/twrnc-config').twrncConfig,
)
