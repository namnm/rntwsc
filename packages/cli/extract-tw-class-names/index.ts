import { twrncConfig } from '#/core/tw/twrnc-config'
import { extract } from '#/devtools/babel-extract'
import { fs } from '#/devtools/fs'
import { path } from '#/devtools/path'

// Pre-computes the tw-class -> minified-name mapping for playground/app.
// See contribution/dev.md#extracting-minified-class-names.
export const extractTwClassNames = (repoRoot: string) => {
  process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES = '1'
  const { dependencies } = fs.readJsonSync(
    path.join(repoRoot, 'playground/app/package.json'),
  )
  return extract({
    repoRoot,
    extractClassNameOutputPath: path.join(repoRoot, 'playground/app'),
    reactNativeVersion: dependencies['react-native'],
    twrncConfig,
    ignore: ['**/packages/devtools/**', '**/packages/cli/**'],
  })
}
