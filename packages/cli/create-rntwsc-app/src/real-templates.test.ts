import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { generate } from '#/cli/create-rntwsc-app/src/generate'
import { fullManifest } from '#/cli/create-rntwsc-app/src/manifest'

// Generates a real project from the actual .templates + fullManifest once,
// then runs cheap static checks against the output - catches broken @/
// imports and mismatched i18n keys without paying for a real pnpm
// install/tsc run. See packages/cli/e2e-create-rntwsc-app for the slow,
// real-install version of this check.

const templatesRoot = path.join(__dirname, '../.templates')

const tokens = {
  PROJECT_NAME: 'demo-app',
  APP_NAME_PASCAL: 'DemoApp',
  APP_PACKAGE_ID: 'com.demoapp',
  RNTWSC_VERSION:
    'github:namnm/rntwsc#0000000000000000000000000000000000000000',
  ROOT_RELATIVE: '../',
}

const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md'])

const walk = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, {
    withFileTypes: true,
  })
  const files = await Promise.all(
    entries.map(async e => {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        return walk(full)
      }
      return [full]
    }),
  )
  return files.flat()
}

describe('real .templates generation', () => {
  let dir: string
  let targetRoot: string
  let allFiles: string[]

  beforeAll(async () => {
    dir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'rntwsc-real-templates-test-'),
    )
    targetRoot = path.join(dir, 'demo-app')
    await generate({
      templatesRoot,
      targetRoot,
      tokens,
      manifest: fullManifest,
    })
    allFiles = await walk(targetRoot)
  })

  afterAll(async () => {
    await fs.rm(dir, {
      recursive: true,
      force: true,
    })
  })

  it('leaves no unsubstituted __TOKEN__ placeholder in any generated text file', async () => {
    const textFiles = allFiles.filter(f => textExtensions.has(path.extname(f)))
    const offenders: string[] = []
    for (const f of textFiles) {
      const content = await fs.readFile(f, 'utf8')
      if (/__[A-Z_]+__/.test(content)) {
        offenders.push(path.relative(targetRoot, f))
      }
    }
    expect(offenders).toEqual([])
  })

  it('resolves every @/ import in app/src and web/src to a real file', async () => {
    const appSrc = path.join(targetRoot, 'app/src')
    const codeFiles = allFiles.filter(
      f =>
        (f.startsWith(path.join(targetRoot, 'app/src')) ||
          f.startsWith(path.join(targetRoot, 'web/src'))) &&
        /\.tsx?$/.test(f),
    )

    const importRegex = /from\s+['"](@\/[^'"]+)['"]/g
    const candidateExtensions = ['', '.ts', '.tsx', '/index.ts', '/index.tsx']
    const unresolved: string[] = []

    for (const f of codeFiles) {
      const content = await fs.readFile(f, 'utf8')
      for (const m of content.matchAll(importRegex)) {
        const specifier = m[1]
        const rel = specifier.slice('@/'.length)
        const resolved = await Promise.all(
          candidateExtensions.map(async ext => {
            const candidate = path.join(appSrc, `${rel}${ext}`)
            return fs
              .access(candidate)
              .then(() => true)
              .catch(() => false)
          }),
        )
        if (!resolved.some(Boolean)) {
          unresolved.push(`${path.relative(targetRoot, f)}: ${specifier}`)
        }
      }
    }
    expect(unresolved).toEqual([])
  })

  it('has a matching key in every locale for every t(...) call in app/src', async () => {
    const labelsDir = path.join(targetRoot, 'app/src/i18n/labels')
    const localeEntries = await fs.readdir(labelsDir, {
      withFileTypes: true,
    })
    const locales = localeEntries.filter(e => e.isDirectory()).map(e => e.name)
    const localeKeys = new Map<string, Set<string>>()
    for (const locale of locales) {
      const raw = await fs.readFile(
        path.join(labelsDir, locale, 'common.json'),
        'utf8',
      )
      localeKeys.set(locale, new Set(Object.keys(JSON.parse(raw))))
    }

    const codeFiles = allFiles.filter(
      f => f.startsWith(path.join(targetRoot, 'app/src')) && /\.tsx?$/.test(f),
    )
    const tCallRegex = /\bt\(\s*['"]([a-zA-Z0-9_]+)['"]\s*\)/g
    const missing: string[] = []

    for (const f of codeFiles) {
      const content = await fs.readFile(f, 'utf8')
      for (const m of content.matchAll(tCallRegex)) {
        const key = m[1]
        for (const [locale, keys] of localeKeys) {
          if (!keys.has(key)) {
            missing.push(`${path.relative(targetRoot, f)}: ${key} (${locale})`)
          }
        }
      }
    }
    expect(missing).toEqual([])
  })
})
