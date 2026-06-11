import type { TransformOptions } from '@babel/core'

declare const babelrc: TransformOptions & { extensions: string[] }
export = babelrc
