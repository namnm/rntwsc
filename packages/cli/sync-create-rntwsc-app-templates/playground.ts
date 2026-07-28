import { execFileSync } from 'node:child_process'
import { promises as fsp } from 'node:fs'

import { structuralManifest } from '#/cli/create-rntwsc-app/src/manifest'
import { path } from '#/devtools/path'

const baseTokenPairs: [string, string][] = [
  ['com.awesomeproject', '__APP_PACKAGE_ID__'],
  ['AwesomeProject', '__APP_NAME_PASCAL__'],
]
const rootRelativePair: [string, string] = ['../../', '__ROOT_RELATIVE__']
const rootRelativeFiles = new Set(['app/metro.config.js', 'web/next.config.ts'])

const tokenizeName = (input: string): string =>
  baseTokenPairs.reduce(
    (s, [value, token]) => s.split(value).join(token),
    input,
  )

const tokenizeContent = (input: string, templateSrc: string): string => {
  const pairs = rootRelativeFiles.has(templateSrc)
    ? [...baseTokenPairs, rootRelativePair]
    : baseTokenPairs
  return pairs.reduce((s, [value, token]) => s.split(value).join(token), input)
}

const textExtensions = new Set([
  '',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.scss',
  '.css',
  '.cjs',
  '.mjs',
  '.yaml',
  '.yml',
  '.gradle',
  '.properties',
  '.pro',
  '.xml',
  '.kt',
  '.swift',
  '.plist',
  '.pbxproj',
  '.storyboard',
  '.xcscheme',
  '.xcworkspacedata',
  '.xcprivacy',
])
const isTextFile = (fileName: string): boolean =>
  textExtensions.has(path.extname(fileName))

const listTrackedFiles = (repoRoot: string, relDir: string): string[] =>
  execFileSync('git', ['ls-files', relDir], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)

const copyFile = async (
  srcPath: string,
  destPath: string,
  templateSrc: string,
) => {
  await fsp.mkdir(path.dirname(destPath), {
    recursive: true,
  })
  if (isTextFile(srcPath)) {
    const content = await fsp.readFile(srcPath, 'utf8')
    await fsp.writeFile(destPath, tokenizeContent(content, templateSrc))
    return
  }
  await fsp.copyFile(srcPath, destPath)
}

const copyTrackedDir = async (
  repoRoot: string,
  srcDir: string,
  destDir: string,
  templateSrcDir: string,
) => {
  const relSrcDir = path.relative(repoRoot, srcDir)
  const trackedFiles = listTrackedFiles(repoRoot, relSrcDir)
  for (const relFile of trackedFiles) {
    const absSrc = path.join(repoRoot, relFile)
    const relInsideDir = path.relative(srcDir, absSrc)
    const relParts = relInsideDir.split(path.sep)
    const tokenizedRel = relParts.map(tokenizeName).join(path.sep)
    const templateSrc = [templateSrcDir, ...relParts].join('/')
    await copyFile(absSrc, path.join(destDir, tokenizedRel), templateSrc)
  }
}

const playgroundPath = (dest: string): string =>
  dest.startsWith('web/') ? `turbopack/${dest.slice('web/'.length)}` : dest

const collapseJavaPackagePath = async (androidDir: string) => {
  const javaDir = path.join(androidDir, 'app/src/main/java')
  const packageDir = path.join(javaDir, 'com/awesomeproject')
  const placeholder = path.join(javaDir, '__APP_PACKAGE_PATH__')

  await fsp.mkdir(placeholder, {
    recursive: true,
  })
  const entries = await fsp.readdir(packageDir, {
    withFileTypes: true,
  })
  for (const entry of entries) {
    await fsp.rename(
      path.join(packageDir, entry.name),
      path.join(placeholder, entry.name),
    )
  }
  await fsp.rmdir(packageDir)
  await fsp.rmdir(path.dirname(packageDir))
}

export const syncPlayground = async (repoRoot: string) => {
  const playgroundRoot = path.join(repoRoot, 'playground')
  const templatesRoot = path.join(
    repoRoot,
    'packages/cli/create-rntwsc-app/.templates',
  )

  for (const entry of structuralManifest) {
    const srcPath = path.join(playgroundRoot, playgroundPath(entry.dest))
    const destPath = path.join(templatesRoot, entry.src)
    const st = await fsp.stat(srcPath)
    if (st.isDirectory()) {
      await copyTrackedDir(repoRoot, srcPath, destPath, entry.src)
      continue
    }
    await copyFile(srcPath, destPath, entry.src)
  }

  if (structuralManifest.some(e => e.src === 'native/android')) {
    const androidDir = path.join(templatesRoot, 'native/android')
    await collapseJavaPackagePath(androidDir)
    await fsp.chmod(path.join(androidDir, 'gradlew'), 0o755).catch(() => {})
  }
}
