import { fs } from '#/devtools/fs'
import { getGitignorePath } from '#/devtools/gitignore'
import { log } from '#/devtools/log'
import { path } from '#/devtools/path'

const extraEslintignore = `
**/min/**/*
**/.templates/**/*
**/*.min.*
**/*.template.*
`
export const extraPrettierignore = `
# other files those dont need prettier
**/package-lock.json
**/yarn.lock
**/pnpm-lock.yaml

# match with eslint ignore
${extraEslintignore.trim()}
`
export const extraDockerignore = `
**/.git/
**/.gitignore
`

const validLineRegex = /^(\*\*\/|!\*\*\/)/

const linesEqual = (a: string, b: string) => {
  const [linesA, linesB] = [a.split('\n'), b.split('\n')].map(arr =>
    arr.map(v => v.trim()),
  )
  return (
    linesA.length === linesB.length &&
    linesA.every((line, i) => line === linesB[i])
  )
}

export const beginMarkerMsg = 'AUTOMATED PRAGMA - BEGIN'
export const endMarkerMsg = 'AUTOMATED PRAGMA - END'
export const beginMarker = `# ${beginMarkerMsg}`
export const endMarker = `# ${endMarkerMsg}`

export const getNormalizedGitignore = async (
  repoRoot: string,
  includeExtra?: boolean,
): Promise<string> => {
  const gitignorePath = getGitignorePath(repoRoot)
  const raw = await fs.readFile(gitignorePath, 'utf8')

  const beginIdx = raw.indexOf(beginMarker)
  const endIdx = raw.indexOf(endMarker)
  if (beginIdx === -1 || endIdx === -1) {
    log.fatal(
      `.gitignore is missing the "${beginMarkerMsg}"/"${endMarkerMsg}" markers`,
    )
  }
  const gitignore = includeExtra
    ? raw
    : raw.slice(beginIdx + beginMarker.length, endIdx)

  const lines = gitignore.split('\n')
  const normalizedLines = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.endsWith(beginMarkerMsg) || trimmed.endsWith(endMarkerMsg)) {
      continue
    }
    if (!trimmed && !normalizedLines[normalizedLines.length - 1]) {
      continue
    }
    normalizedLines.push(trimmed)
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    if (!validLineRegex.test(trimmed)) {
      log.warn(`gitignore line must start with **/ or !**/: ${trimmed}`)
    }
  }

  return normalizedLines.join('\n')
}

export const normalizeGitignore = async (repoRoot: string) => {
  const normalized = await getNormalizedGitignore(repoRoot, true)

  await Promise.all([
    writePrettierignore(normalized, repoRoot),
    writeDockerignore(normalized, repoRoot),
    writeTsconfigExclude(normalized, path.join(repoRoot, 'tsconfig.base.json')),
  ])
}

export const writeManagedFile = async (
  targetPath: string,
  gitignore: string,
  extra: string,
) => {
  const existing = await fs.readFile(targetPath, 'utf8').catch(() => null)

  let userContent = ''
  if (existing !== null) {
    const beginIdx = existing.indexOf(beginMarker)
    const endIdx = existing.indexOf(endMarker)
    if (beginIdx !== -1 && endIdx !== -1) {
      userContent = existing.slice(endIdx + endMarker.length).trimStart()
    } else if (existing.trim()) {
      userContent = existing.trimStart()
    }
  }

  const lines = [beginMarker, '', gitignore.trim()]
  if (extra.trim()) {
    lines.push(extra.trimEnd())
  }
  lines.push('', endMarker)
  if (userContent) {
    lines.push('', userContent.trimEnd())
  }
  lines.push('')

  const content = lines.join('\n')
  if (existing !== null && linesEqual(content, existing)) {
    return
  }
  await fs.outputFile(targetPath, content, 'utf8')
}

const writePrettierignore = (gitignore: string, repoRoot: string) =>
  writeManagedFile(
    path.join(repoRoot, '.prettierignore'),
    gitignore,
    extraPrettierignore,
  )

const writeDockerignore = (gitignore: string, repoRoot: string) =>
  writeManagedFile(
    path.join(repoRoot, '.dockerignore'),
    gitignore,
    extraDockerignore,
  )

export const writeTsconfigExclude = async (
  gitignore: string,
  tsconfigBasePath: string,
) => {
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

  const tsBeginMarker = `// ${beginMarkerMsg}`
  const tsEndMarker = `// ${endMarkerMsg}`

  const managed = [
    tsBeginMarker,
    ...dirs.map(d => `"${d}",`),
    '// match with eslint',
    ...eslint.map(l => `"${l}",`),
    tsEndMarker,
  ].join('\n')

  const beginIdx = existing.indexOf(tsBeginMarker)
  const endIdx = existing.indexOf(tsEndMarker)
  const excludeKeyIdx = existing.indexOf('"exclude"')

  let result: string
  if (beginIdx !== -1 && endIdx !== -1) {
    result =
      existing.slice(0, beginIdx) +
      managed +
      existing.slice(endIdx + tsEndMarker.length)
  } else if (excludeKeyIdx === -1) {
    const rootCloseIdx = existing.lastIndexOf('}')
    result = [
      existing.slice(0, rootCloseIdx).trimEnd() + ',',
      '"exclude": [',
      managed,
      ']',
      '}',
      '',
    ].join('\n')
  } else {
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
      existing.slice(pos - 1),
    ].join('\n')
  }

  if (linesEqual(result, existing)) {
    return
  }
  await fs.writeFile(tsconfigBasePath, result, 'utf8')
}
