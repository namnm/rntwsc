import { fs } from '@/devtools/fs'
import { path } from '@/devtools/path'

const githubBlobUrl = 'https://github.com/namnm/rntwsc/blob/master/'
const readmeLinkRegex = /(\]\()(?!\w+:|#)([^)]+)(\))/g

export const readReadmeWithGithubLinks = async (
  repoRoot: string,
): Promise<string> => {
  const original = await fs.readFile(path.join(repoRoot, 'README.md'), 'utf8')
  return original.replace(
    readmeLinkRegex,
    (_m, open: string, link: string, close: string) =>
      `${open}${githubBlobUrl}${link}${close}`,
  )
}

export const writeReadmeWithGithubLinks = async (
  repoRoot: string,
  distRoot: string,
): Promise<void> => {
  const content = await readReadmeWithGithubLinks(repoRoot)
  await fs.outputFile(path.join(distRoot, 'README.md'), content)
}
