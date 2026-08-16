// shortcut to run devtools scripts

import { buildDistCli } from '#/cli/build-cli'
import { buildDist } from '#/cli/build-dist'
import { checkI18nLabels } from '#/cli/check-i18n-labels'
import { e2eCreateRntwscApp } from '#/cli/e2e-create-rntwsc-app'
import { extractTwClassNames } from '#/cli/extract-tw-class-names'
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
  'extract-tw-class-names': extractTwClassNames,
  'check-i18n-labels': checkI18nLabels,
  'build-dist': buildDist,
  'build-cli': buildDistCli,
  'sync-create-rntwsc-app-templates': syncCreateRntwscAppTemplates,
  // slow, real pnpm install + build - not part of pnpm fmt, run on demand
  'e2e-create-rntwsc-app': e2eCreateRntwscApp,
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

  checkAndPush(promises, 'prettier', o)

  checkAndPush(promises, 'tsc', o)
  checkAndPush(promises, 'type-coverage', o)
  checkAndPush(promises, 'check-i18n-labels', o)

  checkAndPush(promises, 'css-extract-variables', o)
  checkAndPush(promises, 'extract-tw-class-names', o)

  checkAndPush(promises, 'build-dist', o)
  checkAndPush(promises, 'build-cli', o)
  checkAndPush(promises, 'sync-create-rntwsc-app-templates', o)
  checkAndPush(promises, 'e2e-create-rntwsc-app', o)

  await Promise.all(promises).catch((err: Error) => log.stack(err, 'fatal'))
}
