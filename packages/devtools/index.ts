// shortcut to run devtools scripts - published as rntwsc/devtools
// also usable by a consumer monorepo to run the same eslint/prettier/stylelint/tsc

import { cssExtractVariables } from '#/devtools/css-extract-variables'
import { doctoc } from '#/devtools/doctoc'
import { eslint } from '#/devtools/eslint'
import { log } from '#/devtools/log'
import { normalize } from '#/devtools/normalize'
import { path } from '#/devtools/path'
import { prettier } from '#/devtools/prettier'
import { stylelint } from '#/devtools/stylelint'
import { tsc } from '#/devtools/tsc'
import { typeCoverage } from '#/devtools/type-coverage'

// take an optional file or directory as argv[3], see contribution/dev.md
const targetableFns = {
  doctoc,
  eslint,
  stylelint,
  prettier,
}
const wholeRepoFns = {
  normalize,
  tsc,
  'type-coverage': typeCoverage,
  'css-extract-variables': cssExtractVariables,
}
const fns = {
  ...targetableFns,
  ...wholeRepoFns,
}
type Pkg = keyof typeof fns
type TargetablePkg = keyof typeof targetableFns
const supported = Object.keys(fns) as Pkg[]
const targetable = Object.keys(targetableFns) as Pkg[]

const argv = process.argv[2]?.split(',').filter(v => v)
if (!argv?.length) {
  log.fatal(`Invalid devtools argv ${process.argv[2]}`)
}
argv.forEach(argvPkg => {
  if (!supported.some(v => v === argvPkg)) {
    log.fatal(`Invalid devtools script ${argvPkg}`)
  }
})

const argvTarget = process.argv[3]
if (argvTarget) {
  const wholeRepoOnly = argv.filter(p => !targetable.some(v => v === p))
  if (wholeRepoOnly.length) {
    log.fatal(
      `devtools ${wholeRepoOnly.join(',')} always runs on the whole repo, drop the path ${argvTarget}`,
    )
  }
}
const target = argvTarget ? path.resolve(argvTarget) : undefined

type Options = {
  repoRoot: string
}

const r = async (p: Pkg, { repoRoot }: Options) => {
  if (targetable.some(v => v === p)) {
    await targetableFns[p as TargetablePkg](repoRoot, target ?? repoRoot)
    return
  }
  await fns[p](repoRoot)
}

const checkAndPush = (promises: Promise<unknown>[], p: Pkg, o: Options) => {
  if (!argv.includes(p)) {
    return
  }
  promises.push(r(p, o))
}

export const run = async (o: Options) => {
  let promises: Promise<unknown>[] = []
  checkAndPush(promises, 'normalize', o)

  // need to run in this order to avoid conflicts between commands
  const fmtPromises: Promise<unknown>[] = []
  checkAndPush(fmtPromises, 'doctoc', o)
  checkAndPush(fmtPromises, 'eslint', o)
  checkAndPush(fmtPromises, 'stylelint', o)
  if (fmtPromises.length) {
    await Promise.all(promises)
    promises = []
    await Promise.all(fmtPromises)
  }

  checkAndPush(promises, 'prettier', o)

  checkAndPush(promises, 'tsc', o)
  checkAndPush(promises, 'type-coverage', o)

  checkAndPush(promises, 'css-extract-variables', o)

  await Promise.all(promises).catch((err: Error) => log.stack(err, 'fatal'))
}
