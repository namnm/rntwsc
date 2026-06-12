/** @param {import('.').EntrypointOptions} options */
module.exports = ({
  target,
  repoRoot,
  env,
  alias = true,
  babel = true,
  req,
} = {}) => {
  if (!target) {
    // in some cases like IDE eslint, prettier.. the cwd could be invalid
    throw new Error('Missing target in entrypoint')
  }

  // --------------------------------------------------------------------------
  // verify and set repo root
  const fs = require('node:fs')
  const path = require('node:path')
  if (!repoRoot) {
    let dir = target
    while (dir !== path.dirname(dir)) {
      const pnpm = path.join(dir, 'pnpm-workspace.yaml')
      if (fs.existsSync(pnpm)) {
        repoRoot = dir
        break
      }
      dir = path.dirname(dir)
    }
    if (!repoRoot) {
      throw new Error(`Failed to find pnpm-workspace.yaml from ${target}`)
    }
  } else {
    const pnpm = path.join(repoRoot, 'pnpm-workspace.yaml')
    if (!fs.existsSync(pnpm)) {
      throw new Error(`Missing pnpm-workspace.yaml at repo root ${repoRoot}`)
    }
  }
  require('./root').setRepoRoot(repoRoot)

  // --------------------------------------------------------------------------
  // try to load .env and .env.example all together from dir up to root
  if (env) {
    // transpiler is not registered yet, can not import typescript, need to copy from `@/nodejs/path`
    /** @param {string} p */
    const isInRepo = p => !path.relative(repoRoot, p).startsWith('.')
    /** @param {string} d */
    const isRepoRoot = d => !path.relative(repoRoot, d)

    /** @type {string[]} */
    const envDirs = []
    let currentDir = target
    if (isInRepo(currentDir)) {
      while (isInRepo(currentDir)) {
        envDirs.push(currentDir)
        currentDir = path.dirname(currentDir)
      }
    } else {
      envDirs.push(currentDir)
    }
    if (!envDirs.some(isRepoRoot)) {
      envDirs.push(repoRoot)
    }

    const dotenv = require('dotenv')

    for (const f of ['./.env', './.env.example']) {
      for (const d of envDirs) {
        const e = path.join(d, f)
        if (!fs.existsSync(e)) {
          continue
        }
        dotenv.config({
          path: e,
          override: false,
          debug: false,
          quiet: true,
        })
      }
    }
  }

  // --------------------------------------------------------------------------
  // register json5 if not yet
  const exts = require.extensions
  if (!exts['.json5']) {
    require('json5/lib/register')
    // treat json extension as json5 to import json with comments
    Object.assign(exts, {
      '.json': exts['.json5'],
    })
  }

  // --------------------------------------------------------------------------
  // register tsconfig-paths to use aliases
  if (alias) {
    const tsconfig = path.join(target, 'tsconfig.json')
    const paths = require(tsconfig).compilerOptions.paths
    require('tsconfig-paths').register({
      cwd: target,
      baseUrl: target,
      paths,
    })
  }

  // --------------------------------------------------------------------------
  // register transpiler to be able to import typescript
  if (babel) {
    const babelrc = require('@/nodejs/babelrc')
    require('@babel/register')(babelrc)
  } else {
    require('tsx/cjs')
  }
  // --------------------------------------------------------------------------
  // now we should be able to import typescript from now on
  // req is the shortcut to require a module together in this call
  // with some clean up and global error handlers
  if (!req) {
    return
  }

  // clear stdout
  if (process.env.NODE_ENV === 'development') {
    process.stdout.write(
      process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H',
    )
  }

  // global error handlers
  const { log } = require('@/nodejs/log')
  process.on('uncaughtException', log.stack)
  process.on('unhandledRejection', log.stack)

  // check circular imports
  /** @type {import('@/nodejs/circular-imports') | undefined} */
  let circularImports
  if (process.env.NODE_ENV === 'development') {
    circularImports = require('@/nodejs/circular-imports')
    setImmediate(circularImports.check)
  }
  circularImports?.setEntryPoint(req)

  // require and return
  try {
    return require(req)
  } catch (err) {
    log.stack(err, 'fatal')
  }
}
