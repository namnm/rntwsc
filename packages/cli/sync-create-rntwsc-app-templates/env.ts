import { fs } from '@/devtools/fs'
import { path } from '@/devtools/path'

export const syncTemplateEnv = async (repoRoot: string) => {
  const content = await fs.readFile(path.join(repoRoot, '.env.example'), 'utf8')
  const dir = path.join(
    repoRoot,
    'packages/cli/create-rntwsc-app/templates/root',
  )
  await Promise.all([
    fs.outputFile(path.join(dir, '.env.template'), content),
    fs.outputFile(path.join(dir, '.env.example'), content),
  ])
}
