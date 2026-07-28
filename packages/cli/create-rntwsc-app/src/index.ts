// Runs directly at import time - no exported run(), see bin/create-rntwsc-app.js.

import { execFileSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { generate } from '#/cli/create-rntwsc-app/src/generate'
import { fullManifest } from '#/cli/create-rntwsc-app/src/manifest'
import {
  defaultPackageId,
  toKebabCase,
  toPascalCase,
} from '#/cli/create-rntwsc-app/src/names'

const packageRoot = path.join(__dirname, '..')
const templatesRoot = path.join(packageRoot, 'templates')

const usage = `
Usage: create-rntwsc-app <project-directory> [options]

Options:
  --package-name <id>    Android package / iOS bundle id (default: derived from project name)
  --rntwsc-version <v>   override the rntwsc version pin (default: baked-in current version)
  -h, --help             show this message
`

const fail = (message: string): never => {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

const parseArgs = (argv: string[]) => {
  let projectDir: string | undefined
  let packageName: string | undefined
  let rntwscVersion: string | undefined

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(usage)
      process.exit(0)
    }
    if (arg === '--package-name') {
      packageName = argv[++i]
      continue
    }
    if (arg === '--rntwsc-version') {
      rntwscVersion = argv[++i]
      continue
    }
    if (arg.startsWith('-')) {
      fail(`Unknown option "${arg}"${usage}`)
    }
    if (projectDir) {
      fail(`Unexpected extra argument "${arg}"${usage}`)
    }
    projectDir = arg
  }

  if (!projectDir) {
    fail(`Missing required <project-directory> argument${usage}`)
    throw new Error('unreachable')
  }

  return {
    projectDir,
    packageName,
    rntwscVersion,
  }
}

const readDefaultRntwscVersion = async (): Promise<string> => {
  const raw = await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8')
  const pkg = JSON.parse(raw) as { version: string }
  return pkg.version
}

const initProject = (targetRoot: string) => {
  const run = (bin: string, args: string[], silent = false) =>
    execFileSync(bin, args, {
      cwd: targetRoot,
      stdio: silent ? 'ignore' : 'inherit',
    })

  process.stdout.write('Created boilerplate, installing dependencies...\n')
  run('pnpm', ['dedupe'])

  process.stdout.write('Normalizing code standard...\n')
  run('pnpm', ['fmt'])

  process.stdout.write('Initializing git...\n')
  run('git', ['init'], true)
  run('git', ['add', '-A'], true)
  run('git', ['commit', '-m', 'Initial commit'], true)
}

const ensureEmptyTarget = async (targetRoot: string) => {
  const st = await fs.stat(targetRoot).catch(() => undefined)
  if (!st) {
    return
  }
  if (!st.isDirectory()) {
    fail(`"${targetRoot}" already exists and is not a directory`)
  }
  const entries = await fs.readdir(targetRoot)
  if (entries.length) {
    fail(`"${targetRoot}" already exists and is not empty`)
  }
}

const main = async () => {
  const { projectDir, packageName, rntwscVersion } = parseArgs(
    process.argv.slice(2),
  )

  const targetRoot = path.resolve(process.cwd(), projectDir)
  await ensureEmptyTarget(targetRoot)

  const projectName = toKebabCase(path.basename(targetRoot))
  const appNamePascal = toPascalCase(projectName)
  const appPackageId = packageName || defaultPackageId(projectName)
  const version = rntwscVersion || (await readDefaultRntwscVersion())

  await generate({
    templatesRoot,
    targetRoot,
    manifest: fullManifest,
    tokens: {
      PROJECT_NAME: projectName,
      APP_NAME_PASCAL: appNamePascal,
      APP_PACKAGE_ID: appPackageId,
      RNTWSC_VERSION: version,
      ROOT_RELATIVE: '../',
    },
  })

  initProject(targetRoot)

  process.stdout.write(`
Created ${projectName} at ${targetRoot}

Next steps:

  # web (Next.js, turbopack)
  cd ${projectDir}/web
  pnpm start

  # native (React Native, Metro)
  cd ${projectDir}/app
  pnpm start
  pnpm android
`)
}

main().catch((err: Error) => {
  process.stderr.write(`${err.stack || err.message}\n`)
  process.exit(1)
})
