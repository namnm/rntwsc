import type { PluginObj } from '@babel/core'

import { createVisitor } from 'rntwsc/devtools/babel-plugin-tw/visitor'

export const twPlugin = (): PluginObj => ({
  visitor: createVisitor(),
})
