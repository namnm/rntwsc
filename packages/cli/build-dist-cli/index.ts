import { writeReadmeWithGithubLinks } from '@/cli/readme'
import { fs } from '@/devtools/fs'
import { glob, globby } from '@/devtools/glob'
import { path } from '@/devtools/path'

const copyDir = async (src: string, dst: string) => {
  const files = await glob('**/*', {
    cwd: src,
    dot: true,
  })
  await Promise.all(
    files.map(f => fs.copy(f, path.join(dst, path.relative(src, f)))),
  )
}

export const run = async (repoRoot: string) => {
  const cliRoot = path.join(repoRoot, 'packages/cli/create-rntwsc-app')
  const distRoot = path.join(repoRoot, 'dist-cli')

  const [cliPackageJson, rootPackageJson] = await Promise.all([
    fs.readJson(path.join(cliRoot, 'package.json')),
    fs.readJson(path.join(repoRoot, 'package.json')),
  ])

  const rntwscVersion: string | undefined = rootPackageJson.dist?.version
  if (!rntwscVersion) {
    throw new Error('Missing "dist.version" in root package.json')
  }

  await fs.remove(distRoot)
  await Promise.all([
    copyDir(path.join(cliRoot, 'bin'), path.join(distRoot, 'bin')),
    copyDir(path.join(cliRoot, 'src'), path.join(distRoot, 'src')),
    copyDir(path.join(cliRoot, 'templates'), path.join(distRoot, 'templates')),
    writeReadmeWithGithubLinks(repoRoot, distRoot),
  ])

  await rewriteSelfAlias(path.join(distRoot, 'src'))

  await fs.outputJson(
    path.join(distRoot, 'package.json'),
    {
      name: 'create-rntwsc-app',
      version: rntwscVersion,
      type: cliPackageJson.type,
      bin: cliPackageJson.bin,
      engines: cliPackageJson.engines,
      dependencies: cliPackageJson.dependencies,
      files: ['bin', 'src', 'templates'],
    },
    {
      spaces: 2,
    },
  )
}

// ---------------------------------------------------------------------------
// Rewrite self-referential @/ alias imports to relative imports
// ---------------------------------------------------------------------------

const aliasPrefix = '@/cli/create-rntwsc-app/src/'
const aliasRegex = /(['"`])(@\/cli\/create-rntwsc-app\/src\/[^'"`]+)\1/g

const rewriteSelfAlias = async (srcRoot: string) => {
  const files = await globby('**/*.{ts,tsx}', {
    cwd: srcRoot,
    gitignore: false,
    absolute: true,
    onlyFiles: true,
  })

  await Promise.all(files.map(f => rewriteSelfAliasInFile(f, srcRoot)))
}

const rewriteSelfAliasInFile = async (filePath: string, srcRoot: string) => {
  const original = await fs.readFile(filePath, 'utf8')

  const rewritten = original.replace(
    aliasRegex,
    (m, q: string, importPath: string) => {
      const rel = importPath.slice(aliasPrefix.length)
      const targetAbs = path.join(srcRoot, rel)
      let relImport = path.relative(path.dirname(filePath), targetAbs)
      if (!relImport.startsWith('.')) {
        relImport = `./${relImport}`
      }
      return `${q}${relImport}${q}`
    },
  )

  if (rewritten !== original) {
    await fs.outputFile(filePath, rewritten)
  }
}
