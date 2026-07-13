// reexport config at root to be compatible with vscode intellisense
require('tsx/cjs')
require('@/libs/lodash').mergeWithArray(
  {},
  require('@/core/tw/tailwind-config').config,
  require('@/core/tw/twrnc-config').twrncConfig,
)
