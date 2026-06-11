import { repoRoot } from '@/nodejs/entrypoint/root'
import { bin, cmd, exec } from '@/nodejs/exec'
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

// our private packages modules with import paths start with '@/...'
const aliasRegex = /(['"])(@\/[^'"]+)\1/g

type ModuleName = 'shared' | 'nodejs' | 'rn' | 'devtools'
const modules: ModuleName[] = ['shared', 'nodejs', 'rn', 'devtools']

const cross: Record<ModuleName, ModuleName[]> = {
  shared: [],
  nodejs: ['shared'],
  rn: ['shared'],
  devtools: ['shared', 'nodejs', 'rn'],
}

// ---------------------------------------------------------------------------
// package.json merging

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
}
type SubPkgJson = Partial<Deps>

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

const writePackageJson = async (mod: ModuleName) => {
  const deps = await mergeDeps(mod)

  const pkg: PkgJson = {
    name: `${scope}/${mod}`,
    version,
    type: 'commonjs',
  }
  depKeys
    .filter(k => Object.keys(deps[k]).length)
    .forEach(k => {
      pkg[k] = deps[k]
    })

  await fs.writeJson(path.join(distRoot, mod, 'package.json'), pkg)
}

// ---------------------------------------------------------------------------
// prepare types

// those packages have their own declaration without @types
const prepareTypesExtra = new Set(['ulidx'])

const prepareTypes = async () => {
  const paths = await glob('**/package.json')
  const repoRootNodeModules = path.join(repoRoot, 'node_modules')

  const promises = paths.map(async p => {
    const pkg = (await fs.readJson(p)) as SubPkgJson
    const pkgDir = path.dirname(p)

    const allPkgNames = Object.keys({
      ...pkg.dependencies,
      ...pkg.peerDependencies,
      ...pkg.devDependencies,
    })
    const toLink = allPkgNames.filter(
      k => k.startsWith('@types/') || prepareTypesExtra.has(k),
    )

    await Promise.all(
      toLink.map(async typesPkg => {
        const src = path.join(pkgDir, 'node_modules', typesPkg)
        const dst = path.join(repoRootNodeModules, typesPkg)
        const [srcExists] = await Promise.all([
          fs.exists(src),
          fs.ensureDir(path.dirname(dst)),
        ])
        if (!srcExists) {
          return
        }
        return fs.symlink(src, dst).catch(() => {})
      }),
    )
  })

  await Promise.all(promises)
}

// ---------------------------------------------------------------------------
// tsc

const writeTsconfig = async (mod: ModuleName) => {
  // Build explicit paths only - no broad @/* fallback
  // will become "cannot find module" errors which are suppressed by noEmitOnError:false
  // This prevents TypeScript from following unknown @/ aliases and emitting stray declaration
  const paths: Record<string, string[]> = {
    [`@/${mod}/*`]: [`./${packages}/${mod}/*`],
  }
  for (const dep of cross[mod]) {
    paths[`@/${dep}/*`] = [`./${dist}/${dep}/*`]
  }

  const config = {
    extends: './tsconfig.base.json',
    compilerOptions: {
      rootDir: `./${packages}/${mod}`,
      outDir: `./${dist}/${mod}`,
      module: 'esnext',
      moduleResolution: 'bundler',
      types: [],
      allowJs: false,
      checkJs: false,
      declaration: true,
      noEmit: false,
      paths,
    },
    include: [`./${packages}/${mod}/**/*`, `./${packages}/**/*.d.ts`],
    exclude: [`./${packages}/${mod}/**/*.test.*`],
  }

  const tmp = path.join(repoRoot, `tsconfig.${mod}.local.json`)
  await fs.writeJson(tmp, config)
  return tmp
}

const compile = async (mod: ModuleName, tsconfigPath: string) => {
  const execCmd = cmd({
    bin: await bin(repoRoot, 'tsc'),
    args: [['--project', tsconfigPath]],
    argsJoinUsingSpace: true,
  })
  await exec(execCmd)

  const distMod = path.join(distRoot, mod)
  if (!(await fs.exists(distMod))) {
    log.fatal(`tsc produced no output for ${mod}`)
  }
}

// ---------------------------------------------------------------------------
// Asset copying (non-TS files tsc doesn't handle)

const copyAssets = async (mod: ModuleName) => {
  const src = path.join(packagesRoot, mod)
  const dst = path.join(distRoot, mod)

  const srcFiles = await glob('**/*.{js,d.ts,svg,css,scss}', {
    cwd: src,
  })
  const promises = srcFiles.map(async srcFull => {
    const rel = path.relative(src, srcFull)
    const dstFull = path.join(dst, rel)
    await fs.ensureDir(path.dirname(dstFull))
    await fs.copyFile(srcFull, dstFull)
  })
  await Promise.all(promises)
}

// ---------------------------------------------------------------------------
// Import rewriting

const rewriteFile = async (
  filePath: string,
  mod: ModuleName,
  distModDir: string,
): Promise<string[]> => {
  const original = await fs.readFile(filePath, 'utf8')
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
        const relative = path.relative(packagesRoot, filePath)
        errs.push(
          `${relative}: unresolvable import "${importPath}" - "${importMod}" is not in cross deps for "${mod}"`,
        )
        return m
      }

      if (importMod === mod) {
        const fileDir = path.dirname(filePath)
        const target = subPath ? path.join(distModDir, subPath) : distModDir
        let rel = path.relative(fileDir, target).replace(/\\/g, '/')
        if (!rel.startsWith('.')) {
          rel = `./${rel}`
        }
        return `${q}${rel}${q}`
      }

      const pkg = subPath
        ? `${scope}/${importMod}/${subPath}`
        : `${scope}/${importMod}`
      return `${q}${pkg}${q}`
    },
  )

  if (rewritten !== original) {
    await fs.writeFile(filePath, rewritten)
  }

  return errs
}

const rewriteAll = async (mod: ModuleName): Promise<void> => {
  const distModDir = path.join(distRoot, mod)

  const files = await globby('**/*.{js,d.ts}', {
    cwd: distModDir,
    gitignore: false,
    absolute: true,
    onlyFiles: true,
  })

  const results = await Promise.all(
    files.map(fileFull => rewriteFile(fileFull, mod, distModDir)),
  )

  const errs = results.flat()
  if (errs.length > 0) {
    for (const e of errs) {
      log.error(e)
    }
    log.fatal(`${errs.length} unresolvable import(s) in module "${mod}"`)
  }
}

// ---------------------------------------------------------------------------
// Main

const build = async (mod: ModuleName): Promise<void> => {
  const tsconfigPath = await writeTsconfig(mod)
  try {
    await compile(mod, tsconfigPath)
    await Promise.all([copyAssets(mod), rewriteAll(mod), writePackageJson(mod)])
  } finally {
    await fs.remove(tsconfigPath)
  }
}

const main = async () => {
  await prepareTypes()
  await fs.remove(distRoot)
  await fs.ensureDir(distRoot)
  for (const mod of modules) {
    await build(mod)
  }
}
main().catch(err => log.stack(err, 'fatal'))
