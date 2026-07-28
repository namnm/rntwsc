import type { ChildProcess } from 'node:child_process'
import { execSync } from 'node:child_process'

import type { Falsish } from '#/libs/utility-types'

export const kill = (proc: ChildProcess | Falsish) => {
  if (!proc) {
    return
  }
  try {
    proc.stdin?.write('q')
    proc.stdin?.end()
  } catch (err) {
    void err
  }
  killPid(proc.pid)
  if (proc.pid && isAlive(proc.pid)) {
    try {
      proc.kill()
    } catch (err) {
      void err
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
  }
  if (proc.pid && isAlive(proc.pid)) {
    try {
      proc.kill('SIGKILL')
    } catch (err) {
      void err
    }
  }
}

export const killSelfChildren = () => {
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${process.pid} /f /t`)
    } catch (err) {
      void err
    }
    return
  }
  const children = getChildrenUnix(process.pid)
  children.forEach(child => killRecursively(child))
}

const killPid = (pid: number | Falsish) => {
  if (!pid) {
    return
  }
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${pid} /f /t`)
    } catch (err) {
      void err
    }
    return
  }
  killRecursively(pid)
}

const killRecursively = (pid: number) => {
  const children = getChildrenUnix(pid)
  try {
    process.kill(pid, 'SIGTERM')
  } catch (err) {
    void err
  }
  children.forEach(child => killRecursively(child))
}

const getChildrenUnix = (pid: number): number[] => {
  const children: number[] = []
  try {
    const output = execSync(`ps -opid="" -oppid="" | grep ${pid}`, {
      stdio: ['pipe', 'pipe', 'pipe'],
    }).toString()
    output
      .trim()
      .split(/\n/)
      .map(pgroup => pgroup.trim())
      .filter(pgroup => pgroup)
      .forEach(pgroup => {
        const arr = pgroup.split(/\s+/)
        const child = parseInt(arr[0], 10)
        const parent = parseInt(arr[1], 10)
        if (isNaN(child) || isNaN(parent) || parent !== pid) {
          return
        }
        children.push(child)
      })
  } catch (err) {
    void err
  }
  return children
}

const isAlive = (pid: number) => {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}
