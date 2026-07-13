import { binRequireResolve, cmd, exec } from '@/devtools/exec'
import { glob } from '@/devtools/glob'

export const doctoc = async (repoRoot: string) => {
  const md = await glob('**/*.md', {
    cwd: repoRoot,
  })

  const promises = md.map(async p =>
    cmd({
      bin: await binRequireResolve('@/devtools/doctoc', undefined, repoRoot),
      args: [
        ['--loglevel', 'warn'],
        ['--github'],
        [p],
        //
      ],
      argsJoinUsingSpace: true,
    }),
  )

  return Promise.all(promises)
}

export const run = (repoRoot: string) =>
  doctoc(repoRoot).then(cmds => Promise.all(cmds.map(c => exec(c))))
