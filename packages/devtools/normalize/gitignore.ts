import { repoRoot } from '@/nodejs/entrypoint/root'
import { fs } from '@/nodejs/fs'
import { gitignorePath } from '@/nodejs/gitignore'
import { log } from '@/nodejs/log'
import { path } from '@/nodejs/path'

const extraEslintignore = `
**/*.min.*
`
const extraPrettierignore = `
# yaml templates
**/*template.yaml
**/*template*/**/*.yaml
# other files those dont need prettier
**/package-lock.json
**/yarn.lock
**/pnpm-lock.yaml
# match with eslint ignore
${extraEslintignore.trim()}
`
const extraDockerignore = `
**/.git/
**/.gitignore
`

const validLineRegex = /^(\*\*\/|!\*\*\/)/

const prettierignorePath = path.join(repoRoot, '.prettierignore')
const dockerignorePath = path.join(repoRoot, '.dockerignore')
const tsconfigBasePath = path.join(repoRoot, 'tsconfig.base.json')

const beginMarkerMsg = 'AUTOMATICALLY INHERIT FROM GITIGNORE - BEGIN'
const endMarkerMsg = 'AUTOMATICALLY INHERIT FROM GITIGNORE - END'
const beginMarker = `# ${beginMarkerMsg}`
const endMarker = `# ${endMarkerMsg}`

export const normalizeGitignore = async () => {
  const gitignore = await fs.readFile(gitignorePath, 'utf8')
  const lines = gitignore.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    if (!validLineRegex.test(trimmed)) {
      log.warn(`gitignore line must start with **/ or !**/: ${trimmed}`)
    }
  }

  await Promise.all([
    writePrettierignore(gitignore),
    writeDockerignore(gitignore),
    writeTsconfigBase(gitignore),
  ])
}

const writePrettierignore = async (gitignore: string) => {
  const existing = await fs.readFile(prettierignorePath, 'utf8').catch(() => '')
  const beginIdx = existing.indexOf(beginMarker)
  const endIdx = existing.indexOf(endMarker)

  let userContent = ''
  if (beginIdx !== -1 && endIdx !== -1) {
    userContent = existing.slice(endIdx + endMarker.length).trimStart()
  } else if (existing.trim()) {
    userContent = existing.trimStart()
  }

  const lines = [
    beginMarker,
    gitignore.trimEnd(),
    extraPrettierignore.trimEnd(),
    endMarker,
  ]
  if (userContent) {
    lines.push('', userContent.trimEnd())
  }
  lines.push('')

  await fs.writeFile(prettierignorePath, lines.join('\n'), 'utf8')
}

const writeDockerignore = async (gitignore: string) => {
  const existing = await fs.readFile(dockerignorePath, 'utf8').catch(() => null)
  if (existing === null) {
    return
  }
  const beginIdx = existing.indexOf(beginMarker)
  const endIdx = existing.indexOf(endMarker)

  let userContent = ''
  if (beginIdx !== -1 && endIdx !== -1) {
    userContent = existing.slice(endIdx + endMarker.length).trimStart()
  } else if (existing.trim()) {
    userContent = existing.trimStart()
  }

  const lines = [
    beginMarker,
    gitignore.trimEnd(),
    extraDockerignore.trimEnd(),
    endMarker,
  ]
  if (userContent) {
    lines.push('', userContent.trimEnd())
  }
  lines.push('')

  await fs.writeFile(dockerignorePath, lines.join('\n'), 'utf8')
}

const writeTsconfigBase = async (gitignore: string) => {
  const existing = await fs.readFile(tsconfigBasePath, 'utf8')

  const dirs = [
    ...new Set(
      gitignore
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#') && l.endsWith('/')),
    ),
  ]

  const eslint = extraEslintignore
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))

  const pad = '    '
  const tsBeginMarker = `${pad}// ${beginMarkerMsg}`
  const tsEndMarker = `${pad}// ${endMarkerMsg}`

  const managed = [
    tsBeginMarker,
    ...dirs.map(d => `${pad}"${d}",`),
    `${pad}// match with eslint`,
    ...eslint.map(l => `${pad}"${l}",`),
    tsEndMarker,
  ].join('\n')

  const beginIdx = existing.indexOf(tsBeginMarker)
  const endIdx = existing.indexOf(tsEndMarker)

  let result: string
  if (beginIdx !== -1 && endIdx !== -1) {
    result =
      existing.slice(0, beginIdx) +
      managed +
      existing.slice(endIdx + tsEndMarker.length)
  } else {
    const excludeKeyIdx = existing.indexOf('"exclude"')
    const openIdx = existing.indexOf('[', excludeKeyIdx)
    let depth = 1
    let pos = openIdx + 1
    while (pos < existing.length && depth > 0) {
      if (existing[pos] === '[') {
        depth++
      } else if (existing[pos] === ']') {
        depth--
      }
      pos++
    }
    result = [
      existing.slice(0, openIdx + 1),
      managed,
      '  ' + existing.slice(pos - 1),
    ].join('\n')
  }

  await fs.writeFile(tsconfigBasePath, result, 'utf8')
}
