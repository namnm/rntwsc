import child_process from 'node:child_process'

import { path, resolvePath, resolvePathErr } from '@/devtools/path'
import { jsonSafe } from '@/libs/json-safe'

export const exec = (cmd: string) =>
  new Promise<void>((resolve, reject) => {
    const p = child_process.spawn(cmd, {
      stdio: 'inherit',
      shell: true,
    })
    p.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Process exited with code ${code}`))
      }
    })
    p.on('error', reject)
  })

export const execSync = async (cmd: string, cwd: string) =>
  child_process.execSync(cmd, {
    stdio: 'inherit',
    cwd,
  })

export type Cmd = {
  bin: string
  args?: string[][]
  argsJoinUsingSpace?: boolean
  target?: string
}
export const cmd = (c: Cmd) => {
  const b = jsonSafe(c.bin)
  const eq = c.argsJoinUsingSpace ? ' ' : '='
  let args = ''
  c.args?.forEach(a => {
    if (a.length === 2) {
      args += ` ${a[0]}${eq}${jsonSafe(a[1])}`
    } else if (a.length === 1) {
      args += ` ${a[0]}`
    } else {
      throw new Error(`${path.basename(c.bin)} invalid arg.length=${a.length}`)
    }
  })
  const target = c.target ? ` ${jsonSafe(c.target)}` : ''
  return `${b}${args}${target}`
}

export const bin = async (dir: string, name: string, repoRoot: string) => {
  let current = dir
  while (true) {
    try {
      return await resolvePath(current, `node_modules/.bin/${name}`)
    } catch {
      if (!path.relative(current, repoRoot) || current === '/') {
        throw resolvePathErr(`bin: ${name}`)
      }
      current = path.dirname(current)
    }
  }
}
export const binRequireResolve = (
  pkg: string,
  name = path.basename(pkg),
  repoRoot: string,
) => bin(path.dirname(require.resolve(pkg)), name, repoRoot)
