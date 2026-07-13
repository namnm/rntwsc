// must not import tsx, it will conflict with nextjs
import { config } from 'rntwsc/devtools/next-config'
import { path } from 'rntwsc/devtools/path'

import babelPluginTwConfig from '../app/babel-plugin-tw-config'

const dir = __dirname

export default config({
  repoRoot: path.join(dir, '../../'),
  dir,
  esmDirs: [],
  ...babelPluginTwConfig,
})
