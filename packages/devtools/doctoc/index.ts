import { binRequireResolve, cmd, exec } from '@/devtools/exec'
import { glob } from '@/devtools/glob'

export const doctocCmd = async (repoRoot: string) => {
  const md = await glob('**/*.md', {
    cwd: repoRoot,
  })

  const promises = md.map(async p =>
    cmd({
      bin: await binRequireResolve('@/devtools/doctoc', undefined, repoRoot),
      args: [
        ['--loglevel', 'warn'],
        ['--toc-pragma-style', 'compact'],
        ['--notitle'],
        ['--github'],
        [p],
        //
      ],
      argsJoinUsingSpace: true,
    }),
  )

  return Promise.all(promises)
}

export const doctoc = (repoRoot: string) =>
  doctocCmd(repoRoot).then(cmds => Promise.all(cmds.map(c => exec(c))))
