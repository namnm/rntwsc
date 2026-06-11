// shortcut to run devtools scripts

import { minimal as log } from '@/nodejs/log'

const supported = [
  'doctoc',
  'normalize',
  'eslint',
  'stylelint',
  'prettier',
  'tsc',
  'type-coverage',
  'build-dist',
] as const
type Pkg = (typeof supported)[number]

const argvPkgs = process.argv[2].split(',') as Pkg[]
argvPkgs.forEach(argvPkg => {
  if (!supported.some(v => v === argvPkg)) {
    log.fatal(`Invalid devtools script ${argvPkg}`)
  }
})

type Options = {
  dir: string
}

const r = async (p: Pkg, { dir }: Options) => {
  await require(`@/devtools/${p}`).run(dir)
}

const checkAndPush = (promises: Promise<unknown>[], p: Pkg, o: Options) => {
  if (!argvPkgs.includes(p)) {
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

  await Promise.all(promises).catch((err: Error) => log.stack(err, 'fatal'))
}
