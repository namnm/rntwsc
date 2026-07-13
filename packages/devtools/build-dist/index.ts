import { run as buildCssExtractVariablesJsons } from '@/devtools/css-extract-variables'
import { fs } from '@/devtools/fs'
import { glob, globby } from '@/devtools/glob'
import { log } from '@/devtools/log'
import { path } from '@/devtools/path'
import type { StrMap } from '@/libs/utility-types'

type Config = {
  name?: string
  version: string
  packages?: string
  dist?: string
  modules?: string[]
  flatten?: string[]
  extraCopy?: StrMap<string[]>
}
type ParsedConfig = Omit<Required<Config>, 'packages' | 'dist'> & {
  repoRoot: string
  packagesRoot: string
  distRoot: string
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export const run = async (repoRoot: string) => {
  const packageJsonRoot = await fs.readJson(path.join(repoRoot, 'package.json'))
  const config: Config = packageJsonRoot.dist
  if (!config) {
    log.fatal('Missing "dist" in repo root package.json')
  }

  const name = config.name || 'rntwsc'
  const version = config.version
  if (!version) {
    log.fatal('Missing "dist.version" in root package.json')
  }

  const packagesRoot = path.join(repoRoot, config.packages || 'packages')
  const distRoot = path.join(repoRoot, config.dist || 'dist')
  const modules = config.modules || ['core', 'libs', 'devtools']
  // Modules copied directly into the dist root instead of a named subfolder.
  const flatten = config.flatten || ['core']
  const extraCopy = config.extraCopy || {
    core: [],
    libs: [],
    devtools: ['tsconfig.base.json'],
  }

  const c: ParsedConfig = {
    repoRoot,
    name,
    version,
    packagesRoot,
    distRoot,
    modules,
    flatten,
    extraCopy,
  }

  await fs.remove(c.distRoot)
  // copy every module's assets and raw ts/tsx directly
  await Promise.all(modules.map(m => copy(c, m)))
  // generate css extract variables jsons
  await buildCssExtractVariablesJsons(c.distRoot, false)
  // generate css browser variants json
  await buildBrowserVariantsJson(c)
  // build the merged package.json's dependencies and exports map
  // must run after the generation steps above have populated dist
  await writePackageJson(c)
  // rewrite alias imports across the whole merged package
  await rewriteAlias(c)
}

// ---------------------------------------------------------------------------
// Module destination prefix
// ---------------------------------------------------------------------------

// Resolve the dist-relative folder a module's files are copied into. Flattened
// modules (e.g. "core") land directly at the dist root; others keep their name
// as a subfolder (e.g. "libs" -> dist/libs, "devtools" -> dist/devtools).
const destPrefix = (c: ParsedConfig, mod: string): string =>
  c.flatten.includes(mod) ? '' : mod

// ---------------------------------------------------------------------------
// Copy code & assets
// ---------------------------------------------------------------------------

const copy = async (c: ParsedConfig, mod: string) => {
  const src = path.join(c.packagesRoot, mod)
  const dst = path.join(c.distRoot, destPrefix(c, mod))

  const srcFiles = await glob('**/*.{ts,tsx,js,svg,css,scss,patch}', {
    cwd: src,
    ignore: ['**/*.test.*'],
  })

  const promises = srcFiles.map(async srcFull => {
    const rel = path.relative(src, srcFull)
    const dstFull = path.join(dst, rel)
    await fs.copy(srcFull, dstFull)
  })

  const extraCopyPromisees = c.extraCopy[mod]?.map(f =>
    fs.copy(path.join(c.repoRoot, f), path.join(dst, f)),
  )

  await Promise.all([...promises, ...(extraCopyPromisees || [])])
}

// ---------------------------------------------------------------------------
// Browser resolve alias map
// ---------------------------------------------------------------------------

const indexBrowserRegex = /(^|\/)index\.browser\.[jt]sx?$/
const browserRegex = /\.browser\.[jt]sx?$/

const buildBrowserVariantsJson = async (c: ParsedConfig) => {
  const map: StrMap<string> = {}

  await Promise.all(
    c.modules.map(async m => {
      const prefix = destPrefix(c, m)
      const files = await glob('**/*.browser.{ts,tsx}', {
        cwd: path.join(c.distRoot, prefix),
        relative: true,
        gitignore: false,
      })
      for (const f of files) {
        const isIndex = indexBrowserRegex.test(f)
        const base = f.replace(isIndex ? indexBrowserRegex : browserRegex, '')
        const rel = [prefix, base].filter(Boolean).join('/')
        const key = `${c.name}${rel ? `/${rel}` : ''}`
        map[key] = isIndex ? `${key}/index.browser` : `${key}.browser`
      }
    }),
  )

  await fs.outputJson(
    path.join(c.distRoot, 'devtools/next-config/browser-variants.json'),
    map,
  )
}

// ---------------------------------------------------------------------------
// Merge package.json
// ---------------------------------------------------------------------------

// Write the single dist package.json with merged deps and exports map.
const writePackageJson = async (c: ParsedConfig) => {
  const [deps, exports] = await Promise.all([mergeDeps(c), buildExports(c)])

  const pkg: PkgJson = {
    name: c.name,
    version: c.version,
    type: 'commonjs',
    exports,
  }
  depKeys
    .filter(k => {
      if (k === 'devDependencies') {
        return
      }
      return Object.keys(deps[k]).length
    })
    .forEach(k => {
      if (k === 'devDependencies') {
        return
      }
      pkg[k] = deps[k]
    })

  await fs.outputJson(path.join(c.distRoot, 'package.json'), pkg)
}

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

// Merge dependencies from every sub-package.json across all modules into one
// flat set for the single published package.
const mergeDeps = async (c: ParsedConfig) => {
  const deps: Omit<Deps, 'devDependencies'> = {
    dependencies: {},
    peerDependencies: {},
  }

  const paths = await glob('**/package.json', {
    cwd: c.packagesRoot,
  })

  const promises = paths.map(async p => {
    const pkg = (await fs.readJson(p)) as SubPkgJson
    depKeys
      .filter(k => pkg[k])
      .forEach(k => {
        const mk = k === 'devDependencies' ? 'dependencies' : k
        Object.assign(deps[mk], pkg[k])
      })
  })
  await Promise.all(promises)

  return deps
}

const platformSuffixes: StrMap<string> = {
  '.native': 'react-native',
}

const buildExports = async (c: ParsedConfig): Promise<StrMap<ExportsValue>> => {
  const [codeFiles, assetFiles] = await Promise.all([
    glob('**/*.{ts,tsx}', {
      cwd: c.distRoot,
      ignore: ['**/*.test.*', '**/*.d.ts'],
      relative: true,
      gitignore: false,
    }),
    glob('**/*.{svg,css,scss,js,json}', {
      cwd: c.distRoot,
      relative: true,
      gitignore: false,
    }),
  ])

  const codeExt = /\.(tsx?|jsx?)$/
  for (const mod of c.modules) {
    const prefix = destPrefix(c, mod)
    const extra = (c.extraCopy[mod] || []).map(f =>
      prefix ? `${prefix}/${f}` : f,
    )
    codeFiles.push(...extra.filter(f => codeExt.test(f)))
    assetFiles.push(...extra.filter(f => !codeExt.test(f)))
  }

  const exports: StrMap<ExportsValue> = {}

  const conditions = new Map<string, StrMap<ExportsValue>>()
  const addCondition = (key: string, file: string, condition: string) => {
    let m = conditions.get(key)
    if (!m) {
      m = {}
      conditions.set(key, m)
    }
    m[condition] = `./${file}`
  }

  for (const f of codeFiles) {
    const noExt = f.replace(codeExt, '')
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
    // Exact file entry - never platform-conditional
    exports[`./${f}`] = `./${f}`
    // Explicit platform path without extension (e.g. ./foo.native)
    exports[`./${noExt}`] = `./${f}`
    // Base path entry with condition (./foo -> react-native or default)
    addCondition(`./${base}`, f, platform)
    // Directory entry when the base filename is 'index'
    if (path.basename(base) === 'index') {
      const dir = path.dirname(base)
      addCondition(dir === '.' ? '.' : `./${dir}`, f, platform)
    }
  }

  // Emit conditional entries. Entries with only a 'default' stay as plain strings.
  // 'default' must be last in the conditions object per the exports spec.
  for (const [k, { default: d, ...platforms }] of conditions) {
    if (Object.keys(platforms).length) {
      if (d) {
        // default must be last
        exports[k] = {
          ...platforms,
          // @ts-ignore
          default: d,
        }
      } else {
        // @ts-ignore
        exports[k] = platforms
      }
    } else if (d) {
      exports[k] = d
    }
  }

  for (const f of assetFiles) {
    exports[`./${f}`] = `./${f}`
  }

  return exports
}

// ---------------------------------------------------------------------------
// Rewrite imports
// ---------------------------------------------------------------------------

const aliasRegex = /(['"`])(@\/[^'"`]+)\1/g

// Rewrite all @/ alias imports in dist files to the published package's scope
// so they resolve correctly after installation in node_modules.
const rewriteAlias = async (c: ParsedConfig): Promise<void> => {
  const files: string[] = await globby('**/*.{ts,tsx,js,css,scss}', {
    cwd: c.distRoot,
    gitignore: false,
    absolute: true,
    onlyFiles: true,
  })

  const errs = (
    await Promise.all(files.map(f => rewriteAliasInFile(c, f)))
  ).flat()
  if (!errs.length) {
    return
  }

  for (const e of errs) {
    log.error(e)
  }
  log.fatal(`${errs.length} unresolvable import(s)`)
}

// Rewrite aliases in a single file. Every module now lives under the same
// published package, so any @/<module>/... import simply maps to the dist
// path that module was copied to (empty prefix for flattened modules).
const rewriteAliasInFile = async (
  c: ParsedConfig,
  f: string,
): Promise<string[]> => {
  const errs: string[] = []
  const original = await fs.readFile(f, 'utf8')

  const rewritten = original.replace(
    aliasRegex,
    (m: string, q: string, importPath: string) => {
      const withoutAt = importPath.slice(2)
      const slashIdx = withoutAt.indexOf('/')
      const importMod =
        slashIdx === -1 ? withoutAt : withoutAt.slice(0, slashIdx)
      const subPath = slashIdx === -1 ? '' : withoutAt.slice(slashIdx + 1)

      if (!c.modules.includes(importMod)) {
        errs.push(
          `${path.relative(c.packagesRoot, f)}: unresolvable import "${importPath}" - "${importMod}" is not a known module`,
        )
        return m
      }

      const prefix = destPrefix(c, importMod)
      const rel = [prefix, subPath].filter(Boolean).join('/')
      const pkg = rel ? `${c.name}/${rel}` : c.name
      return `${q}${pkg}${q}`
    },
  )

  if (rewritten !== original) {
    await fs.outputFile(f, rewritten)
  }

  return errs
}
