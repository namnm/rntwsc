'use client'

import { useRef } from 'react'

import { useOnMounted } from 'rntwsc/libs/hooks'

export const useParentDOM = (fn: (dom: HTMLElement) => () => void) => {
  const r = useRef<HTMLSpanElement>(null)

  useOnMounted(() => {
    const parent = r.current?.parentElement
    if (!parent) {
      return
    }
    return fn(parent)
  })

  return <span ref={r} className='hidden' />
}

export const isClickDOM = (e: MouseEvent, dom: HTMLElement) =>
  !(
    e.button !== 0 ||
    dom.getAttribute('aria-disabled') === 'true' ||
    (dom as HTMLButtonElement).disabled
  )
