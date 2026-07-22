import { promises as fs } from 'node:fs'
import path from 'node:path'

import type { ManifestEntry } from '@/cli/create-rntwsc-app/src/manifest'

export type Tokens = {
  PROJECT_NAME: string
  APP_NAME_PASCAL: string
  APP_PACKAGE_ID: string
  RNTWSC_VERSION: string
  // '../' for a flat generated project (app/, web/ one level under root),
  // '../../' when applied to playground/app + playground/turbopack.
  ROOT_RELATIVE: string
}

const tokenPairs = (tokens: Tokens): [string, string][] => [
  ['__PROJECT_NAME__', tokens.PROJECT_NAME],
  ['__APP_NAME_PASCAL__', tokens.APP_NAME_PASCAL],
  ['__APP_PACKAGE_ID__', tokens.APP_PACKAGE_ID],
  ['__RNTWSC_VERSION__', tokens.RNTWSC_VERSION],
  ['__ROOT_RELATIVE__', tokens.ROOT_RELATIVE],
]

const substitute = (input: string, tokens: Tokens): string =>
  tokenPairs(tokens).reduce((s, [k, v]) => s.split(k).join(v), input)

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
  '.template',
])

const isTextFile = (fileName: string): boolean =>
  textExtensions.has(path.extname(fileName))

const skippedDirNames = new Set(['node_modules'])

const copyDir = async (src: string, dest: string, tokens: Tokens) => {
  await fs.mkdir(dest, {
    recursive: true,
  })
  const entries = await fs.readdir(src, {
    withFileTypes: true,
  })
  for (const entry of entries) {
    if (entry.isDirectory() && skippedDirNames.has(entry.name)) {
      continue
    }
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, substitute(entry.name, tokens))
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, tokens)
      continue
    }
    await copyFile(srcPath, destPath, tokens)
  }
}

const copyFile = async (srcPath: string, destPath: string, tokens: Tokens) => {
  await fs.mkdir(path.dirname(destPath), {
    recursive: true,
  })
  if (isTextFile(srcPath)) {
    const content = await fs.readFile(srcPath, 'utf8')
    await fs.writeFile(destPath, substitute(content, tokens))
    return
  }
  await fs.copyFile(srcPath, destPath)
}

const copyEntry = async (
  templatesRoot: string,
  targetRoot: string,
  entry: ManifestEntry,
  tokens: Tokens,
) => {
  const srcPath = path.join(templatesRoot, entry.src)
  const destPath = path.join(targetRoot, substitute(entry.dest, tokens))
  const st = await fs.stat(srcPath)
  if (st.isDirectory()) {
    await copyDir(srcPath, destPath, tokens)
    return
  }
  await copyFile(srcPath, destPath, tokens)
}

const explodeJavaPackagePath = async (
  androidDir: string,
  packageId: string,
) => {
  const javaDir = path.join(androidDir, 'app/src/main/java')
  const placeholder = path.join(javaDir, '__APP_PACKAGE_PATH__')
  const segments = packageId.split('.').filter(Boolean)
  const finalDir = path.join(javaDir, ...segments)

  await fs.mkdir(finalDir, {
    recursive: true,
  })
  const entries = await fs.readdir(placeholder, {
    withFileTypes: true,
  })
  for (const entry of entries) {
    await fs.rename(
      path.join(placeholder, entry.name),
      path.join(finalDir, entry.name),
    )
  }
  await fs.rmdir(placeholder)
}

export type GenerateOptions = {
  templatesRoot: string
  targetRoot: string
  tokens: Tokens
  manifest: ManifestEntry[]
}

export const generate = async ({
  templatesRoot,
  targetRoot,
  tokens,
  manifest,
}: GenerateOptions) => {
  for (const entry of manifest) {
    await copyEntry(templatesRoot, targetRoot, entry, tokens)
  }

  if (manifest.some(e => e.src === 'native/android')) {
    await explodeJavaPackagePath(
      path.join(targetRoot, 'app/android'),
      tokens.APP_PACKAGE_ID,
    )
    await fs
      .chmod(path.join(targetRoot, 'app/android/gradlew'), 0o755)
      .catch(() => {})
  }
}
