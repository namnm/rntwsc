// reexport config at root to be compatible with vscode intellisense
require('tsx/cjs')
module.exports = require('rntwsc/devtools/eslint/config').config({
  dir: __dirname,
  repoRoot: __dirname,
})
