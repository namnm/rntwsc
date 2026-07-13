// reexport config at root to be compatible with vscode intellisense
require('tsx/cjs')
module.exports = require('@/devtools/stylelint/config').config
