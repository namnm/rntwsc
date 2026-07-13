import fs from 'fs-extra'
import json5 from 'json5'

import { path } from '@/devtools/path'

export { fs }

export const readJson5 = async (...paths: string[]) => {
  const f = await fs.readFile(path.join(...paths), 'utf-8')
  return json5.parse(f)
}
export const readJson5Sync = (...paths: string[]) => {
  const f = fs.readFileSync(path.join(...paths), 'utf-8')
  return json5.parse(f)
}
