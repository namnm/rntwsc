import { binRequireResolve, cmd, exec } from 'rntwsc/devtools/exec'
import { fs } from 'rntwsc/devtools/fs'
import { glob } from 'rntwsc/devtools/glob'

export const doctocCmd = async (repoRoot: string, target = repoRoot) => {
  const md = target.endsWith('.md')
    ? [target]
    : await glob('**/*.md', {
        cwd: target,
      })
  const files = await withoutFrontmatter(md)

  const promises = files.map(async p =>
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

// doctoc writes its block above YAML frontmatter, which stops the leading ---
// being the first line and silently kills the frontmatter - see contribution/dev.md
const withoutFrontmatter = async (paths: string[]) => {
  const keep = await Promise.all(
    paths.map(async p => !(await fs.readFile(p, 'utf-8')).startsWith('---')),
  )
  return paths.filter((_, i) => keep[i])
}

export const doctoc = (repoRoot: string, target = repoRoot) =>
  doctocCmd(repoRoot, target).then(cmds => Promise.all(cmds.map(c => exec(c))))
