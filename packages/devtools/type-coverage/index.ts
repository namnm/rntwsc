import { binRequireResolve, cmd, exec } from '@/devtools/exec'
import { getTsconfig } from '@/devtools/tsc'

export const typeCoverageCmd = async (repoRoot: string) => {
  const tsconfig = await getTsconfig(repoRoot)

  const coverage = tsconfig.map(async p =>
    cmd({
      bin: await binRequireResolve(__dirname, 'type-coverage', repoRoot),
      args: [
        ['--suppressError'],
        ['--at-least', '0'],
        ['--project', p],
        //
      ],
      argsJoinUsingSpace: true,
    }),
  )

  return Promise.all([...coverage])
}

export const typeCoverage = (repoRoot: string) =>
  typeCoverageCmd(repoRoot).then(cmds => Promise.all(cmds.map(c => exec(c))))
