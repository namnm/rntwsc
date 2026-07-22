import { fs } from '@/devtools/fs'
import {
  endMarkerMsg,
  writeTsconfigExclude,
} from '@/devtools/normalize/gitignore'
import { path } from '@/devtools/path'

const templateRoot = 'packages/cli/create-rntwsc-app/templates/root'

export const syncTemplateTsconfigBase = async (repoRoot: string) => {
  const dir = path.join(repoRoot, templateRoot)
  const templateTsconfigPath = path.join(dir, 'tsconfig.base.template.json')

  const raw = await fs.readFile(
    path.join(repoRoot, 'tsconfig.base.json'),
    'utf8',
  )
  await fs.outputFile(templateTsconfigPath, stripTrailingExcludeEntries(raw))

  const templateGitignore = await fs.readFile(
    path.join(dir, '.gitignore.template'),
    'utf8',
  )
  await writeTsconfigExclude(templateGitignore, templateTsconfigPath)
}

const stripTrailingExcludeEntries = (raw: string): string => {
  const tsEndMarker = `// ${endMarkerMsg}`
  const endIdx = raw.indexOf(tsEndMarker)
  if (endIdx === -1) {
    return raw
  }
  const afterEnd = endIdx + tsEndMarker.length
  const closeIdx = raw.indexOf(']', afterEnd)
  if (closeIdx === -1) {
    return raw
  }
  return `${raw.slice(0, afterEnd)}\n${raw.slice(closeIdx)}`
}
