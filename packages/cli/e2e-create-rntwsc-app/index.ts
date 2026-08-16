import { execFileSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'

import { buildDistCli } from '#/cli/build-cli'
import { log } from '#/devtools/log'
import { path } from '#/devtools/path'

// Real, slow verification that a freshly generated project actually
// installs and compiles - generate.test.ts and real-templates.test.ts only
// check the copy/substitute engine and static @/ import resolution, neither
// touches a package registry or a real tsc/build. See contribution/build.md.
export const e2eCreateRntwscApp = async (repoRoot: string) => {
  const rootPkg = await fs.readFile(path.join(repoRoot, 'package.json'), 'utf8')
  const rntwscDependency: string | undefined =
    JSON.parse(rootPkg).dependencies?.rntwsc
  if (!rntwscDependency) {
    log.fatal('Missing "dependencies.rntwsc" in root package.json')
    throw new Error('unreachable')
  }

  // build the real dist-cli output first - the bin entry a consumer runs via
  // `npx create-rntwsc-app` only works against dist-cli/templates, not the
  // monorepo's own .templates, and this also exercises build-cli itself.
  // dist-cli's own default rntwsc pin stays a bare semver (not on npm yet),
  // so pass the real git dependency explicitly here for this test only.
  await buildDistCli(repoRoot)
  const cliBin = path.join(repoRoot, 'dist-cli/bin/create-rntwsc-app.js')

  const tmpParent = await fs.mkdtemp(
    path.join(os.tmpdir(), 'rntwsc-create-app-e2e-'),
  )
  const projectDir = path.join(tmpParent, 'demo-app')

  const run = (bin: string, args: string[], cwd: string) => {
    log.info(`$ ${bin} ${args.join(' ')}`, cwd)
    execFileSync(bin, args, {
      cwd,
      stdio: 'inherit',
    })
  }

  try {
    // runs generate() + pnpm dedupe + pnpm fmt + git init, same as a real user
    run(
      'node',
      [cliBin, projectDir, '--rntwsc-version', rntwscDependency],
      tmpParent,
    )

    run('pnpm', ['tsc'], projectDir)
    run('pnpm', ['--dir', 'web', 'build'], projectDir)

    log.info('e2e create-rntwsc-app passed', projectDir)
  } finally {
    await fs.rm(tmpParent, {
      recursive: true,
      force: true,
    })
  }
}
