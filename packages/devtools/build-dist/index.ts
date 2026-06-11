import { repoRoot } from '@/nodejs/entrypoint/root'
import { fs } from '@/nodejs/fs'
import { glob, globby } from '@/nodejs/glob'
import { log } from '@/nodejs/log'
import { path } from '@/nodejs/path'
import type { StrMap } from '@/shared/ts-utils'

const packages = 'packages'
const packagesRoot = path.join(repoRoot, packages)
const dist = 'dist'
const distRoot = path.join(repoRoot, dist)
const scope = '@rntwsc'
const version = '0.0.0'

// Our private packages modules with import paths start with @/..
const aliasRegex = /(['"`])(@\/[^'"`]+)\1/g

type ModuleName = 'shared' | 'nodejs' | 'rn' | 'devtools'
const modules: ModuleName[] = ['shared', 'nodejs', 'rn', 'devtools']

const cross: Record<ModuleName, ModuleName[]> = {
  shared: [],
  nodejs: ['shared'],
  rn: ['shared'],
  devtools: ['shared', 'nodejs', 'rn'],
}
const extraCopy: Record<ModuleName, string[]> = {
  shared: [],
  nodejs: [],
  rn: [],
  devtools: ['tsconfig.base.json'],
}

// ---------------------------------------------------------------------------
// Main

export const run = async () => {
  await fs.remove(distRoot)
  await fs.ensureDir(distRoot)
  await Promise.all(modules.map(build))
}

const build = async (mod: ModuleName): Promise<void> => {
  await Promise.all([copy(mod), writePackageJson(mod)])
  await rewriteAlias(mod)
}

// ---------------------------------------------------------------------------
// Merge package.json

type Deps = {
  dependencies: StrMap<string>
  peerDependencies: StrMap<string>
  devDependencies: StrMap<string>
}
const depKeys: (keyof Deps)[] = [
  'dependencies',
  'peerDependencies',
  'devDependencies',
]
type PkgJson = Partial<Deps> & {
  name: string
  version: string
  type: string
  exports: Record<string, string>
}
type SubPkgJson = Partial<Deps>

// Merge dependencies from all sub-package.json files within a module into one
// flat set. Cross-module deps are added as peerDependencies so consumers
// install them explicitly rather than getting duplicate copies.
const mergeDeps = async (mod: ModuleName) => {
  const merged: Deps = {
    dependencies: {},
    peerDependencies: {},
    devDependencies: {},
  }

  const paths = await glob('**/package.json', {
    cwd: path.join(packagesRoot, mod),
  })

  const promises = paths.map(async p => {
    const pkg = (await fs.readJson(p)) as SubPkgJson
    depKeys
      .filter(k => pkg[k])
      .forEach(k => {
        Object.assign(merged[k], pkg[k])
      })
  })
  await Promise.all(promises)

  for (const dep of cross[mod]) {
    merged.peerDependencies[`${scope}/${dep}`] = '*'
  }

  return merged
}

// Build an explicit exports map from source files so Node can resolve both
// bare directory imports (e.g. @rntwsc/nodejs/entrypoint -> index.ts) and
// exact file imports without relying on wildcard fallback arrays, which many
// runtimes (tsx, older Metro) do not implement correctly.
const buildExports = async (
  mod: ModuleName,
): Promise<Record<string, string>> => {
  const srcMod = path.join(packagesRoot, mod)
  const [codeFiles, assetFiles] = await Promise.all([
    glob('**/*.{ts,tsx,js,jsx}', {
      cwd: srcMod,
      ignore: ['**/*.test.*'],
      relative: true,
    }),
    glob('**/*.{svg,css,scss}', {
      cwd: srcMod,
      relative: true,
    }),
  ])

  const result: Record<string, string> = {}

  for (const f of codeFiles) {
    const noExt = f.replace(/\.(tsx?|jsx?)$/, '')
    result[`./${f}`] = `./${f}`
    result[`./${noExt}`] = `./${f}`
    if (path.basename(noExt) === 'index') {
      const dir = path.dirname(noExt)
      result[dir === '.' ? '.' : `./${dir}`] = `./${f}`
    }
  }

  for (const f of assetFiles) {
    result[`./${f}`] = `./${f}`
  }

  for (const f of extraCopy[mod]) {
    result[`./${f}`] = `./${f}`
  }

  return result
}

// Write the dist package.json with merged deps and exports map.
const writePackageJson = async (mod: ModuleName) => {
  const [deps, exports] = await Promise.all([mergeDeps(mod), buildExports(mod)])

  const pkg: PkgJson = {
    name: `${scope}/${mod}`,
    version,
    type: 'commonjs',
    exports,
  }
  depKeys
    .filter(k => Object.keys(deps[k]).length)
    .forEach(k => {
      pkg[k] = deps[k]
    })

  await fs.writeJson(path.join(distRoot, mod, 'package.json'), pkg)
}

// ---------------------------------------------------------------------------
// Copy assets

// Copy source files as-is to dist. No transpilation - the consuming bundler
// (Metro, Vite) handles that. Extra root-level files (e.g. tsconfig.base.json)
// can be added per-module via extraCopy.
const copy = async (mod: ModuleName) => {
  const src = path.join(packagesRoot, mod)
  const dst = path.join(distRoot, mod)

  await fs.ensureDir(dst)

  const srcFiles = await glob('**/*.{ts,tsx,js,jsx,svg,css,scss}', {
    cwd: src,
    ignore: ['**/*.test.*'],
  })

  const promises = srcFiles.map(async srcFull => {
    const rel = path.relative(src, srcFull)
    const dstFull = path.join(dst, rel)
    await fs.ensureDir(path.dirname(dstFull))
    await fs.copyFile(srcFull, dstFull)
  })
  await Promise.all([
    ...promises,
    ...extraCopy[mod].map(f =>
      fs.copyFile(path.join(repoRoot, f), path.join(dst, f)),
    ),
  ])
}

// ---------------------------------------------------------------------------
// Rewrite imports

// Rewrite all @/ alias imports in dist files to @rntwsc/ scoped package
// imports so they resolve correctly after installation in node_modules.
const rewriteAlias = async (mod: ModuleName): Promise<void> => {
  const distMod = path.join(distRoot, mod)

  const files: string[] = await globby('**/*.{ts,tsx,js,jsx}', {
    cwd: distMod,
    gitignore: false,
    absolute: true,
    onlyFiles: true,
  })

  const results = await Promise.all(files.map(f => rewriteAliasInFile(f, mod)))

  const errs = results.flat()
  if (!errs.length) {
    return
  }

  for (const e of errs) {
    log.error(e)
  }
  log.fatal(`${errs.length} unresolvable import(s) in module "${mod}"`)
}

// Rewrite aliases in a single file. Same-module and cross-module imports both
// become @rntwsc/ paths - same-module self-references resolve via the exports
// map generated by buildExports.
const rewriteAliasInFile = async (
  f: string,
  mod: ModuleName,
): Promise<string[]> => {
  const original = await fs.readFile(f, 'utf8')
  const errs: string[] = []

  const rewritten = original.replace(
    aliasRegex,
    (m: string, q: string, importPath: string) => {
      const withoutAt = importPath.slice(2)
      const slashIdx = withoutAt.indexOf('/')
      const importMod =
        slashIdx === -1 ? withoutAt : withoutAt.slice(0, slashIdx)
      const subPath = slashIdx === -1 ? '' : withoutAt.slice(slashIdx + 1)

      if (importMod !== mod && !cross[mod].includes(importMod as ModuleName)) {
        errs.push(
          `${path.relative(packagesRoot, f)}: unresolvable import "${importPath}" - "${importMod}" is not in cross deps for "${mod}"`,
        )
        return m
      }

      const pkg = subPath
        ? `${scope}/${importMod}/${subPath}`
        : `${scope}/${importMod}`
      return `${q}${pkg}${q}`
    },
  )

  if (rewritten !== original) {
    await fs.writeFile(f, rewritten)
  }

  return errs
}
