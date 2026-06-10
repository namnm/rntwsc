import ignore from 'ignore'

import { repoRoot } from '@/nodejs/entrypoint/root'
import { fs } from '@/nodejs/fs'
import { gitignorePath } from '@/nodejs/gitignore'
import { path } from '@/nodejs/path'

const ig = ignore().add(fs.readFileSync(gitignorePath, 'utf-8'))
export const isInGitignore = (abs: string) =>
  ig.ignores(path.relative(repoRoot, abs))
