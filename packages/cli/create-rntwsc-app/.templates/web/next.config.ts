// must not import tsx, it will conflict with nextjs
import {
 config 
} from 'rntwsc/devtools/next-config'
import {
 path 
} from 'rntwsc/devtools/path'

import babelPluginTwConfig from '../app/babel-plugin-tw-config'

const dir = import.meta.dirname

export default config({
  repoRoot: path.join(dir, '__ROOT_RELATIVE__'),
  dir,
  esmDirs: [dir],
  ...babelPluginTwConfig,
})
