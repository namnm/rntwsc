import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { simpleLog } from '#/libs/simple-log'

describe('simpleLog', () => {
  const spies: Partial<Record<'debug' | 'info' | 'warn' | 'error', any>> = {}

  beforeEach(() => {
    spies.debug = vi.spyOn(console, 'debug').mockImplementation(() => {})
    spies.info = vi.spyOn(console, 'info').mockImplementation(() => {})
    spies.warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    spies.error = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs the message alone when condition is true (default)', () => {
    simpleLog.info('hello')
    expect(spies.info).toHaveBeenCalledWith('hello')
    expect(spies.info).toHaveBeenCalledTimes(1)
  })

  it('skips logging entirely when condition is falsy', () => {
    simpleLog.warn('hello', false)
    simpleLog.warn('hello', 0)
    simpleLog.warn('hello', '')
    expect(spies.warn).not.toHaveBeenCalled()
  })

  it('appends a string condition to the message', () => {
    simpleLog.debug('hello', 'world')
    expect(spies.debug).toHaveBeenCalledWith('hello\nworld')
  })

  it('trims a string condition before appending', () => {
    simpleLog.debug('hello', '  world  ')
    expect(spies.debug).toHaveBeenCalledWith('hello\nworld')
  })

  it('stringifies a non-boolean, non-string condition (e.g. object) via jsonSafe', () => {
    simpleLog.info('hello', {
      a: 1,
    })
    expect(spies.info).toHaveBeenCalledWith('hello\n{"a":1}')
  })

  it('logs the Error object itself in addition to the message for Error conditions', () => {
    const err = new Error('boom')
    simpleLog.error('hello', err)
    expect(spies.error).toHaveBeenCalledTimes(2)
    expect(spies.error).toHaveBeenNthCalledWith(2, err)
  })

  it('routes to the correct console method per level', () => {
    simpleLog.debug('d')
    simpleLog.info('i')
    simpleLog.warn('w')
    simpleLog.error('e')
    expect(spies.debug).toHaveBeenCalledWith('d')
    expect(spies.info).toHaveBeenCalledWith('i')
    expect(spies.warn).toHaveBeenCalledWith('w')
    expect(spies.error).toHaveBeenCalledWith('e')
  })
})
