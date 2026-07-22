import { bin, cmd, exec } from '@/devtools/exec'
import { fs } from '@/devtools/fs'
import { glob } from '@/devtools/glob'
import { path } from '@/devtools/path'

export const tscCmd = async (repoRoot: string) => {
  const tsconfig = await getTsconfig(repoRoot)

  const tsc = tsconfig.map(async p =>
    cmd({
      bin: await bin(repoRoot, 'tsc', repoRoot),
      args: [
        ['--noEmit'],
        ['--project', p],
        //
      ],
      argsJoinUsingSpace: true,
    }),
  )

  return Promise.all([...tsc])
}

let tsconfig: Promise<string[]> | undefined = undefined
export const getTsconfig = async (repoRoot: string) => {
  if (!tsconfig) {
    tsconfig = getTsconfigUncached(repoRoot)
  }
  return tsconfig
}

const getTsconfigUncached = async (repoRoot: string) => {
  const arr: string[] = []
  const paths = await glob('**/tsconfig.json', {
    cwd: repoRoot,
  })

  const promises = paths.map(async t => {
    const p = path.join(path.dirname(t), 'package.json')
    if (!(await fs.exists(p))) {
      return
    }
    if (require(p).ignoreTsc) {
      return
    }
    arr.push(t)
  })
  await Promise.all(promises)

  return arr
}

export const tsc = (repoRoot: string) =>
  tscCmd(repoRoot).then(cmds => Promise.all(cmds.map(c => exec(c))))
