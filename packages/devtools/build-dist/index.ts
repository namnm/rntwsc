import { repoRoot } from '@/nodejs/entrypoint/root'
import { fs } from '@/nodejs/fs'
import { glob, globby } from '@/nodejs/glob'
import { log } from '@/nodejs/log'
import { path } from '@/nodejs/path'
import type { StrMap } from '@/shared/ts-utils'

type Config = {
  git?: string
  scope?: string
  version: string
  packages?: string
  dist?: string
  modules?: string[]
  cross?: StrMap<string[] | undefined>
  extraCopy?: StrMap<string[] | undefined>
}

const packageJsonRoot = require(path.join(repoRoot, './package.json'))
const config: Config = packageJsonRoot.dist
if (!config) {
  log.fatal('Missing "dist" in root package.json')
}

const git = config.git || 'github:namnm/rntwsc'
const scope = config.scope || '@rntwsc'
const version = config.version
if (!version) {
  log.fatal('Missing "dist.version" in root package.json')
}

const packages = config.packages || 'packages'
const packagesRoot = path.join(repoRoot, packages)
const dist = config.dist || 'dist'
const distRoot = path.join(repoRoot, dist)

const modules = config.modules || ['shared', 'nodejs', 'core', 'devtools']

const cross = config.cross || {
  shared: [],
  nodejs: ['shared'],
  core: ['shared'],
  devtools: ['shared', 'nodejs', 'core'],
}
const extraCopy = config.extraCopy || {
  shared: [],
  nodejs: [],
  core: [],
  devtools: ['tsconfig.base.json'],
}

// private packages modules must have import paths start with @/..
const aliasRegex = /(['"`])(@\/[^'"`]+)\1/g

// ---------------------------------------------------------------------------
// Main

export const run = async () => {
  await fs.remove(distRoot)
  await Promise.all(modules.map(build))
}

const build = async (mod: string): Promise<void> => {
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
  exports: StrMap<ExportsValue>
}
type ExportsValue = string | StrMap<string>
type SubPkgJson = Partial<Deps>

// Merge dependencies from all sub-package.json files within a module into one
// flat set. Cross-module deps are added as peerDependencies so consumers
// install them explicitly rather than getting duplicate copies.
const mergeDeps = async (mod: string) => {
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

  for (const dep of getCross(mod)) {
    merged.dependencies[`${scope}/${dep}`] = `${git}#${version}&path:${dep}`
  }

  return merged
}

// Platform-specific file suffixes mapped to their exports condition names.
// 'default' is not listed here - it is used for files with no platform suffix.
const platformSuffixes: StrMap<string> = {
  '.native': 'react-native',
}

// Build an explicit exports map from source files so Node can resolve both
// bare directory imports (e.g. @rntwsc/nodejs/entrypoint -> index.ts) and
// exact file imports without relying on wildcard fallback arrays, which many
// runtimes (tsx, older Metro) do not implement correctly.
const buildExports = async (mod: string): Promise<StrMap<ExportsValue>> => {
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

  const codeExtRegex = /\.(tsx?|jsx?)$/
  const extraCopyFiles = getExtraCopy(mod)
  codeFiles.push(...extraCopyFiles.filter(f => codeExtRegex.test(f)))
  assetFiles.push(...extraCopyFiles.filter(f => !codeExtRegex.test(f)))

  const map: StrMap<ExportsValue> = {}

  // Accumulate conditional exports: key -> { condition -> file }
  const conditions = new Map<string, StrMap<string>>()
  const addCondition = (key: string, file: string, condition: string) => {
    let m = conditions.get(key)
    if (!m) {
      m = {}
      conditions.set(key, m)
    }
    m[condition] = file
  }

  for (const f of codeFiles) {
    const noExt = f.replace(codeExtRegex, '')
    // Detect platform suffix (e.g. foo.native -> base=foo, condition=react-native)
    let base = noExt
    let platform: string | undefined
    for (const [suffix, condition] of Object.entries(platformSuffixes)) {
      if (noExt.endsWith(suffix)) {
        base = noExt.slice(0, -suffix.length)
        platform = condition
        break
      }
    }
    if (!platform) {
      platform = 'default'
    }
    // Exact file entry - always a direct string, never conditional
    map[`./${f}`] = `./${f}`
    // Explicit platform path without extension (e.g. ./foo.native)
    map[`./${noExt}`] = `./${f}`
    // Base path entry with condition (./foo -> react-native or default)
    addCondition(`./${base}`, `./${f}`, platform)
    // Directory entry when the base filename is 'index'
    if (path.basename(base) === 'index') {
      const dir = path.dirname(base)
      addCondition(dir === '.' ? '.' : `./${dir}`, `./${f}`, platform)
    }
  }

  // Emit conditional entries. Entries with only a 'default' stay as plain strings.
  // 'default' must be last in the conditions object per the exports spec.
  for (const [k, c] of conditions) {
    const { default: d, ...platforms } = c
    if (Object.keys(platforms).length) {
      if (d) {
        // default must be last
        map[k] = {
          ...platforms,
          default: d,
        }
      } else {
        map[k] = platforms
      }
    } else if (d) {
      map[k] = d
    }
  }

  for (const f of assetFiles) {
    map[`./${f}`] = `./${f}`
  }

  return map
}

// Write the dist package.json with merged deps and exports map.
const writePackageJson = async (mod: string) => {
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

  await fs.outputJson(path.join(distRoot, mod, 'package.json'), pkg)
}

// ---------------------------------------------------------------------------
// Copy assets

// Copy source files as-is to dist. No transpilation - the consuming bundler
// (Metro, Vite) handles that. Extra root-level files (e.g. tsconfig.base.json)
// can be added per-module via extraCopy.
const copy = async (mod: string) => {
  const src = path.join(packagesRoot, mod)
  const dst = path.join(distRoot, mod)

  await fs.ensureDir(dst)

  const srcFiles = await glob('**/*.{ts,tsx,js,jsx,svg,css,scss,patch}', {
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
    ...getExtraCopy(mod).map(f =>
      fs.copyFile(path.join(repoRoot, f), path.join(dst, f)),
    ),
  ])
}

// ---------------------------------------------------------------------------
// Rewrite imports

// Rewrite all @/ alias imports in dist files to @rntwsc/ scoped package
// imports so they resolve correctly after installation in node_modules.
const rewriteAlias = async (mod: string): Promise<void> => {
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
  mod: string,
): Promise<string[]> => {
  const original = await fs.readFile(f, 'utf8')
  const errs: string[] = []
  const crossDeps = getCross(mod)

  const rewritten = original.replace(
    aliasRegex,
    (m: string, q: string, importPath: string) => {
      const withoutAt = importPath.slice(2)
      const slashIdx = withoutAt.indexOf('/')
      const importMod =
        slashIdx === -1 ? withoutAt : withoutAt.slice(0, slashIdx)
      const subPath = slashIdx === -1 ? '' : withoutAt.slice(slashIdx + 1)

      if (importMod !== mod && !crossDeps.includes(importMod)) {
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
    await fs.outputFile(f, rewritten)
  }

  return errs
}

const getCross = (mod: string) => cross[mod] || []
const getExtraCopy = (mod: string) => extraCopy[mod] || []
