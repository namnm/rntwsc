import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { generate } from '#/cli/create-rntwsc-app/src/generate'
import type { ManifestEntry } from '#/cli/create-rntwsc-app/src/manifest'

const tokens = {
  PROJECT_NAME: 'my-app',
  APP_NAME_PASCAL: 'MyApp',
  APP_PACKAGE_ID: 'com.myapp',
  RNTWSC_VERSION: '1.2.3',
  ROOT_RELATIVE: '../',
}

describe('generate', () => {
  let dir: string
  let templatesRoot: string
  let targetRoot: string

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'rntwsc-generate-test-'))
    templatesRoot = path.join(dir, 'templates')
    targetRoot = path.join(dir, 'target')
    await fs.mkdir(templatesRoot, {
      recursive: true,
    })
  })

  afterEach(async () => {
    await fs.rm(dir, {
      recursive: true,
      force: true,
    })
  })

  it('substitutes tokens in both file content and file names for a single file entry', async () => {
    await fs.writeFile(
      path.join(templatesRoot, 'package.template.json'),
      '{"name":"__PROJECT_NAME__","rntwsc":"__RNTWSC_VERSION__"}',
    )
    const manifest: ManifestEntry[] = [
      {
        src: 'package.template.json',
        dest: 'package.json',
      },
    ]
    await generate({
      templatesRoot,
      targetRoot,
      tokens,
      manifest,
    })

    const out = await fs.readFile(path.join(targetRoot, 'package.json'), 'utf8')
    expect(out).toBe('{"name":"my-app","rntwsc":"1.2.3"}')
  })

  it('substitutes tokens inside the destination path itself', async () => {
    await fs.writeFile(path.join(templatesRoot, 'app.json'), 'app content')
    const manifest: ManifestEntry[] = [
      {
        src: 'app.json',
        dest: '__PROJECT_NAME__/app.json',
      },
    ]
    await generate({
      templatesRoot,
      targetRoot,
      tokens,
      manifest,
    })

    await expect(
      fs.readFile(path.join(targetRoot, 'my-app/app.json'), 'utf8'),
    ).resolves.toBe('app content')
  })

  it('recursively copies a directory entry, preserving structure', async () => {
    await fs.mkdir(path.join(templatesRoot, 'src/nested'), {
      recursive: true,
    })
    await fs.writeFile(path.join(templatesRoot, 'src/a.ts'), 'const a = 1')
    await fs.writeFile(
      path.join(templatesRoot, 'src/nested/b.ts'),
      'const b = 2',
    )
    const manifest: ManifestEntry[] = [
      {
        src: 'src',
        dest: 'src',
      },
    ]
    await generate({
      templatesRoot,
      targetRoot,
      tokens,
      manifest,
    })

    await expect(
      fs.readFile(path.join(targetRoot, 'src/a.ts'), 'utf8'),
    ).resolves.toBe('const a = 1')
    await expect(
      fs.readFile(path.join(targetRoot, 'src/nested/b.ts'), 'utf8'),
    ).resolves.toBe('const b = 2')
  })

  it('copies non-text files (e.g. binary assets) byte-for-byte without substitution', async () => {
    const binary = Buffer.from([0, 1, 2, 255, 254])
    await fs.writeFile(path.join(templatesRoot, 'icon.png'), binary)
    const manifest: ManifestEntry[] = [
      {
        src: 'icon.png',
        dest: 'icon.png',
      },
    ]
    await generate({
      templatesRoot,
      targetRoot,
      tokens,
      manifest,
    })

    const out = await fs.readFile(path.join(targetRoot, 'icon.png'))
    expect(out).toEqual(binary)
  })

  it('skips a stray node_modules directory inside a copied template dir', async () => {
    await fs.mkdir(path.join(templatesRoot, 'app/node_modules/pkg'), {
      recursive: true,
    })
    await fs.writeFile(
      path.join(templatesRoot, 'app/node_modules/pkg/index.js'),
      'junk',
    )
    await fs.writeFile(path.join(templatesRoot, 'app/index.js'), 'real')
    const manifest: ManifestEntry[] = [
      {
        src: 'app',
        dest: 'app',
      },
    ]
    await generate({
      templatesRoot,
      targetRoot,
      tokens,
      manifest,
    })

    await expect(
      fs.readFile(path.join(targetRoot, 'app/index.js'), 'utf8'),
    ).resolves.toBe('real')
    await expect(
      fs.stat(path.join(targetRoot, 'app/node_modules')),
    ).rejects.toThrow()
  })

  it('preserves managed-block marker comments verbatim (not stripped)', async () => {
    await fs.writeFile(
      path.join(templatesRoot, '.gitignore.template'),
      '# AUTOMATED PRAGMA - BEGIN\n**/node_modules/\n# AUTOMATED PRAGMA - END\n',
    )
    const manifest: ManifestEntry[] = [
      {
        src: '.gitignore.template',
        dest: '.gitignore',
      },
    ]
    await generate({
      templatesRoot,
      targetRoot,
      tokens,
      manifest,
    })

    const out = await fs.readFile(path.join(targetRoot, '.gitignore'), 'utf8')
    expect(out).toContain('# AUTOMATED PRAGMA - BEGIN')
    expect(out).toContain('# AUTOMATED PRAGMA - END')
  })

  it('explodes __APP_PACKAGE_PATH__ into nested java package directories matching the package id', async () => {
    await fs.mkdir(
      path.join(
        templatesRoot,
        'native/android/app/src/main/java/__APP_PACKAGE_PATH__',
      ),
      {
        recursive: true,
      },
    )
    await fs.writeFile(
      path.join(
        templatesRoot,
        'native/android/app/src/main/java/__APP_PACKAGE_PATH__/MainActivity.kt',
      ),
      'package __APP_PACKAGE_ID__',
    )
    await fs.writeFile(
      path.join(templatesRoot, 'native/android/gradlew'),
      '#!/bin/sh',
    )
    const manifest: ManifestEntry[] = [
      {
        src: 'native/android',
        dest: 'app/android',
      },
    ]
    await generate({
      templatesRoot,
      targetRoot,
      tokens,
      manifest,
    })

    const finalPath = path.join(
      targetRoot,
      'app/android/app/src/main/java/com/myapp/MainActivity.kt',
    )
    await expect(fs.readFile(finalPath, 'utf8')).resolves.toContain(
      'package com.myapp',
    )
    await expect(
      fs.stat(
        path.join(
          targetRoot,
          'app/android/app/src/main/java/__APP_PACKAGE_PATH__',
        ),
      ),
    ).rejects.toThrow()
  })

  it('makes gradlew executable after exploding the android package path', async () => {
    await fs.mkdir(
      path.join(
        templatesRoot,
        'native/android/app/src/main/java/__APP_PACKAGE_PATH__',
      ),
      {
        recursive: true,
      },
    )
    await fs.writeFile(
      path.join(templatesRoot, 'native/android/gradlew'),
      '#!/bin/sh',
    )
    const manifest: ManifestEntry[] = [
      {
        src: 'native/android',
        dest: 'app/android',
      },
    ]
    await generate({
      templatesRoot,
      targetRoot,
      tokens,
      manifest,
    })

    const stat = await fs.stat(path.join(targetRoot, 'app/android/gradlew'))
    // rwxr-xr-x = 0o755
    expect(stat.mode & 0o777).toBe(0o755)
  })

  it('processes multiple manifest entries in order', async () => {
    await fs.writeFile(path.join(templatesRoot, 'a.ts'), 'a: __PROJECT_NAME__')
    await fs.writeFile(path.join(templatesRoot, 'b.ts'), 'b: __PROJECT_NAME__')
    const manifest: ManifestEntry[] = [
      {
        src: 'a.ts',
        dest: 'a.ts',
      },
      {
        src: 'b.ts',
        dest: 'b.ts',
      },
    ]
    await generate({
      templatesRoot,
      targetRoot,
      tokens,
      manifest,
    })

    await expect(
      fs.readFile(path.join(targetRoot, 'a.ts'), 'utf8'),
    ).resolves.toBe('a: my-app')
    await expect(
      fs.readFile(path.join(targetRoot, 'b.ts'), 'utf8'),
    ).resolves.toBe('b: my-app')
  })
})
