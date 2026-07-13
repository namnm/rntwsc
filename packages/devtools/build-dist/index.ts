import type { StrMap } from '@/core/ts-utils'
import { run as buildCssExtractVariablesJsons } from '@/devtools/css-extract-variables'
import { fs } from '@/devtools/fs'
import { glob, globby } from '@/devtools/glob'
import { log } from '@/devtools/log'
import { path } from '@/devtools/path'

type Config = {
  git?: string
  scope?: string
  version: string
  packages?: string
  dist?: string
  modules?: string[]
  cross?: StrMap<string[]>
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

  const git = config.git || 'github:namnm/rntwsc'
  const scope = config.scope || '@rntwsc'
  const version = config.version
  if (!version) {
    log.fatal('Missing "dist.version" in root package.json')
  }

  const packagesRoot = path.join(repoRoot, config.packages || 'packages')
  const distRoot = path.join(repoRoot, config.dist || 'dist')
  const modules = config.modules || ['core', 'devtools']
  const cross = config.cross || {
    core: [],
    devtools: ['core'],
  }
  const extraCopy = config.extraCopy || {
    core: [],
    devtools: ['tsconfig.base.json'],
  }

  const c: ParsedConfig = {
    repoRoot,
    git,
    scope,
    version,
    packagesRoot,
    distRoot,
    modules,
    cross,
    extraCopy,
  }

  await fs.remove(c.distRoot)
  // copy every module's assets and raw ts/tsx directly
  await Promise.all(modules.map(m => copy(c, m)))
  // generate css extract variables jsons
  await buildCssExtractVariablesJsons(c.distRoot, false)
  // generate css browser variants json
  await buildBrowserVariantsJson(c)
  // build exports map and rewrite alias
  // must run after the generation steps above have populated it
  await Promise.all(modules.map(m => writePackageJson(c, m)))
  await Promise.all(modules.map(m => rewriteAlias(c, m)))
}

// ---------------------------------------------------------------------------
// Copy code & assets
// ---------------------------------------------------------------------------

const copy = async (c: ParsedConfig, mod: string) => {
  const src = path.join(c.packagesRoot, mod)
  const dst = path.join(c.distRoot, mod)

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
      const files = await glob('**/*.browser.{ts,tsx}', {
        cwd: path.join(c.distRoot, m),
        relative: true,
        gitignore: false,
      })
      for (const f of files) {
        const isIndex = indexBrowserRegex.test(f)
        const base = f.replace(isIndex ? indexBrowserRegex : browserRegex, '')
        const key = `${c.scope}/${m}${base ? `/${base}` : ''}`
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

// Write the dist package.json with merged deps and exports map.
const writePackageJson = async (c: ParsedConfig, mod: string) => {
  const [deps, exports] = await Promise.all([
    mergeDeps(c, mod),
    buildExports(c, mod),
  ])

  const pkg: PkgJson = {
    name: `${c.scope}/${mod}`,
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

  await fs.outputJson(path.join(c.distRoot, mod, 'package.json'), pkg)
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

// Merge dependencies from all sub-package.json files within a module into one
// flat set. Cross-module deps are added as peerDependencies so consumers
// install them explicitly rather than getting duplicate copies.
const mergeDeps = async (c: ParsedConfig, mod: string) => {
  const deps: Omit<Deps, 'devDependencies'> = {
    dependencies: {},
    peerDependencies: {},
  }

  const paths = await glob('**/package.json', {
    cwd: path.join(c.packagesRoot, mod),
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
  const cross = c.cross[mod] || []
  for (const dep of cross) {
    deps.dependencies[`${c.scope}/${dep}`] = `${c.git}#${c.version}&path:${dep}`
  }

  return deps
}

const platformSuffixes: StrMap<string> = {
  '.native': 'react-native',
}

const buildExports = async (
  c: ParsedConfig,
  mod: string,
): Promise<StrMap<ExportsValue>> => {
  const srcMod = path.join(c.distRoot, mod)
  const [codeFiles, assetFiles] = await Promise.all([
    glob('**/*.{ts,tsx}', {
      cwd: srcMod,
      ignore: ['**/*.test.*', '**/*.d.ts'],
      relative: true,
      gitignore: false,
    }),
    glob('**/*.{svg,css,scss,js,json}', {
      cwd: srcMod,
      relative: true,
      gitignore: false,
    }),
  ])

  const codeExt = /\.(tsx?|jsx?)$/
  const extraCopy = c.extraCopy[mod] || []
  codeFiles.push(...extraCopy.filter(f => codeExt.test(f)))
  assetFiles.push(...extraCopy.filter(f => !codeExt.test(f)))

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

// Rewrite all @/ alias imports in dist files to @rntwsc/ scoped package
// imports so they resolve correctly after installation in node_modules.
const rewriteAlias = async (c: ParsedConfig, mod: string): Promise<void> => {
  const distMod = path.join(c.distRoot, mod)

  const files: string[] = await globby('**/*.{ts,tsx,js,css,scss}', {
    cwd: distMod,
    gitignore: false,
    absolute: true,
    onlyFiles: true,
  })

  const errs = (
    await Promise.all(files.map(f => rewriteAliasInFile(c, f, mod)))
  ).flat()
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
  c: ParsedConfig,
  f: string,
  mod: string,
): Promise<string[]> => {
  const errs: string[] = []
  const cross = c.cross[mod] || []
  const original = await fs.readFile(f, 'utf8')

  const rewritten = original.replace(
    aliasRegex,
    (m: string, q: string, importPath: string) => {
      const withoutAt = importPath.slice(2)
      const slashIdx = withoutAt.indexOf('/')
      const importMod =
        slashIdx === -1 ? withoutAt : withoutAt.slice(0, slashIdx)
      const subPath = slashIdx === -1 ? '' : withoutAt.slice(slashIdx + 1)

      if (importMod !== mod && !cross.includes(importMod)) {
        errs.push(
          `${path.relative(c.packagesRoot, f)}: unresolvable import "${importPath}" - "${importMod}" is not in cross deps for "${mod}"`,
        )
        return m
      }

      const pkg = subPath
        ? `${c.scope}/${importMod}/${subPath}`
        : `${c.scope}/${importMod}`
      return `${q}${pkg}${q}`
    },
  )

  if (rewritten !== original) {
    await fs.outputFile(f, rewritten)
  }

  return errs
}
