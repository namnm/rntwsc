import { binRequireResolve, cmd, exec } from 'rntwsc/devtools/exec'
import { glob } from 'rntwsc/devtools/glob'

export const doctocCmd = async (repoRoot: string) => {
  const md = await glob('**/*.md', {
    cwd: repoRoot,
  })

  const promises = md.map(async p =>
    cmd({
      bin: await binRequireResolve('rntwsc/devtools/doctoc', undefined, repoRoot),
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
