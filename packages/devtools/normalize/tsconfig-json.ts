import ts from 'typescript'

import { fs, readJson5 } from '#/devtools/fs'
import { path } from '#/devtools/path'
import { jsonSafe } from '#/libs/json-safe'
import type { StrMap } from '#/libs/utility-types'

type CompilerOption = {
  name: string
  type: unknown
  isCommandLineOnly?: boolean
  category?: {
    message?: string
  }
  description?: {
    message?: string
  }
}
const options: CompilerOption[] = (ts as any).optionDeclarations

export const normalizeTsconfigJson = async (repoRoot: string) => {
  const tsconfigBasePath = path.join(repoRoot, 'tsconfig.base.json')
  const raw = await fs.readFile(tsconfigBasePath, 'utf8')
  const config = await readJson5(tsconfigBasePath)
  const existingCompilerOptions: StrMap<unknown> = config.compilerOptions || {}

  const groups: StrMap<CompilerOption[]> = {}
  for (const o of options) {
    if (o.isCommandLineOnly) {
      continue
    }
    const cat: string = o.category?.message || 'Other'
    if (!groups[cat]) {
      groups[cat] = []
    }
    groups[cat].push(o)
  }

  const compilerOptions: string[] = []
  for (const [cat, opts] of Object.entries(groups)) {
    compilerOptions.push('', `/* ===== ${cat} ===== */`)
    for (const o of opts) {
      const desc: string = o.description?.message || ''
      compilerOptions.push(`// ${desc}`)
      if (o.name in existingCompilerOptions) {
        const existing = existingCompilerOptions[o.name]
        compilerOptions.push(`"${o.name}": ${jsonSafe(existing)},`)
      } else {
        compilerOptions.push(`// "${o.name}": ${defaultPlaceholder(o)},`)
      }
    }
  }

  const lines = ['"compilerOptions": {', ...compilerOptions, '}']
  const compilerKeyIdx = raw.indexOf('"compilerOptions"')
  if (compilerKeyIdx !== -1) {
    const openIdx = raw.indexOf('{', compilerKeyIdx)
    let depth = 1
    let pos = openIdx + 1
    while (pos < raw.length && depth > 0) {
      if (raw[pos] === '{') {
        depth++
      } else if (raw[pos] === '}') {
        depth--
      }
      pos++
    }
    lines.unshift(raw.slice(0, compilerKeyIdx))
    lines.push(raw.slice(pos))
  } else {
    const rootCloseIdx = raw.lastIndexOf('}')
    const prefix = raw.slice(0, rootCloseIdx).trimEnd()
    const insideRoot = prefix.slice(prefix.indexOf('{') + 1).trim()
    const sep = insideRoot ? ',' : ''
    lines.unshift(prefix + sep)
    lines.push('}')
  }
  lines.push('')

  await fs.writeFile(tsconfigBasePath, lines.join('\n'), 'utf8')
}

const defaultPlaceholder = (o: CompilerOption): string => {
  switch (o.type) {
    case 'boolean':
      return 'false'
    case 'number':
      return '0'
    case 'string':
      return '""'
    case 'list':
      return '[]'
    default:
      if (o.type instanceof Map) {
        return jsonSafe([...o.type.keys()])
      }
      return 'null'
  }
}
