// shortcut to run devtools scripts

import { run as buildDist } from '@/devtools/build-dist'
import { run as cssExtractVariables } from '@/devtools/css-extract-variables'
import { run as doctoc } from '@/devtools/doctoc'
import { run as eslint } from '@/devtools/eslint'
import { log } from '@/devtools/log'
import { run as normalize } from '@/devtools/normalize'
import { run as prettier } from '@/devtools/prettier'
import { run as stylelint } from '@/devtools/stylelint'
import { run as tsc } from '@/devtools/tsc'
import { run as typeCoverage } from '@/devtools/type-coverage'

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
  checkAndPush(promises, 'build-dist', o)

  await Promise.all(promises).catch((err: Error) => log.stack(err, 'fatal'))
}
