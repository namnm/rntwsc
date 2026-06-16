// nodejs code here
// should not import from @/nodejs to make the depedency smaller

import path from 'node:path'
import type { Config } from 'tailwindcss'

export const config: Config = {
  content: [path.join(__dirname, '../**/*.{ts,tsx}')],
}
