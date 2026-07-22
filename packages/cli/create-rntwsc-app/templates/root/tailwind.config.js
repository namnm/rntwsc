// reexport config at root to be compatible with vscode intellisense
require('tsx/cjs')
require('rntwsc/libs/lodash').mergeWithArray(
  {},
  require('rntwsc/tw/tailwind-config').config,
  require('rntwsc/tw/twrnc-config').twrncConfig,
)
