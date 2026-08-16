import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Vite loads this file via Node's native TS stripping, which refuses to
// strip node_modules - tsx/cjs works around it, see contribution/vite.md
require('tsx/cjs')
const { config } = require('rntwsc/devtools/vite-config')
const { path } = require('rntwsc/devtools/path')
const babelPluginTwConfig = require('../app/babel-plugin-tw-config')

// playground/app/src and this playground's own src are both served raw
// by Vite, so both must stay ESM - see contribution/vite.md
export default config({
  repoRoot: path.join(__dirname, '../../'),
  dir: __dirname,
  esmDirs: [__dirname, path.join(__dirname, '../app')],
  ...babelPluginTwConfig,
})
