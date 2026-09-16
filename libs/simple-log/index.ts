import { jsonSafe } from 'rntwsc/libs/json-safe'

type Level = 'debug' | 'info' | 'warn' | 'error'
const createSimpleLog =
  (l: Level) =>
  (msg: string, condition: unknown = true) => {
    if (!condition) {
      return
    }
    // must check before reassigning condition to its jsonSafe string below,
    // or both checks would always read false
    const isErrInstance = condition instanceof Error
    if (typeof condition === 'string') {
      msg = msg + '\n' + condition.trim()
    } else if (typeof condition !== 'boolean') {
      msg = msg + '\n' + jsonSafe(condition)
    }

    const fn = console[l].bind(console)
    fn(msg)
    if (isErrInstance) {
      fn(condition)
    }
  }

// for non-nodejs env such as react native or browser
export type SimpleLog = {
  debug: SimpleLogFn
  info: SimpleLogFn
  warn: SimpleLogFn
  error: SimpleLogFn
}
export type SimpleLogFn = (msg: string, condition?: unknown) => void

export const simpleLog: SimpleLog = {
  debug: createSimpleLog('debug'),
  info: createSimpleLog('info'),
  warn: createSimpleLog('warn'),
  error: createSimpleLog('error'),
}
