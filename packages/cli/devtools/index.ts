// shortcut to run devtools scripts

import { buildDistCli } from '#/cli/build-cli'
import { buildDist } from '#/cli/build-dist'
import { syncCreateRntwscAppTemplates } from '#/cli/sync-create-rntwsc-app-templates'
import { cssExtractVariables } from '#/devtools/css-extract-variables'
import { doctoc } from '#/devtools/doctoc'
import { eslint } from '#/devtools/eslint'
import { log } from '#/devtools/log'
import { normalize } from '#/devtools/normalize'
import { prettier } from '#/devtools/prettier'
import { stylelint } from '#/devtools/stylelint'
import { tsc } from '#/devtools/tsc'
import { typeCoverage } from '#/devtools/type-coverage'

const fns = {
  doctoc,
  normalize,
  eslint,
  stylelint,
  prettier,
  tsc,
  'type-coverage': typeCoverage,
  'css-extract-variables': cssExtractVariables,
  'build-dist': buildDist,
  'build-cli': buildDistCli,
  'sync-create-rntwsc-app-templates': syncCreateRntwscAppTemplates,
}
type Pkg = keyof typeof fns
const supported = Object.keys(fns) as Pkg[]

const argv = process.argv[2]?.split(',').filter(v => v)
if (!argv?.length) {
  log.fatal(`Invalid devtools argv ${process.argv[2]}`)
}
argv.forEach(argvPkg => {
  if (!supported.some(v => v === argvPkg)) {
    log.fatal(`Invalid devtools script ${argvPkg}`)
  }
})

type Options = {
  repoRoot: string
}

const r = async (p: Pkg, { repoRoot }: Options) => {
  await fns[p](repoRoot)
}

const checkAndPush = (promises: Promise<unknown>[], p: Pkg, o: Options) => {
  if (!argv.includes(p)) {
    return
  }
  promises.push(r(p, o))
}

// need to run in this order to avoid conflicts between commands
export const run = async (o: Options) => {
  let promises: Promise<unknown>[] = []
  checkAndPush(promises, 'normalize', o)

  const fmtPromises: Promise<unknown>[] = []
  checkAndPush(fmtPromises, 'doctoc', o)
  checkAndPush(fmtPromises, 'eslint', o)
  checkAndPush(fmtPromises, 'stylelint', o)
  if (fmtPromises.length) {
    await Promise.all(promises)
    promises = []
    await Promise.all(fmtPromises)
  }

  await r('prettier', o)

  checkAndPush(promises, 'tsc', o)
  checkAndPush(promises, 'type-coverage', o)

  checkAndPush(promises, 'css-extract-variables', o)

  checkAndPush(promises, 'build-dist', o)
  checkAndPush(promises, 'build-cli', o)
  checkAndPush(promises, 'sync-create-rntwsc-app-templates', o)

  await Promise.all(promises).catch((err: Error) => log.stack(err, 'fatal'))
}
