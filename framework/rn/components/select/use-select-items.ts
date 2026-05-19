import { useState } from 'react'

import type { ItemsFn, SelectItem, SelectItems } from './select-cva'

export const useSelectItems = (items: SelectItems) => {
  const [asyncItems, setAsyncItems] = useState<SelectItem[]>([])
  const [loading, setLoading] = useState(false)

  const isItemsFn = typeof items === 'function'
  const resolvedItems = isItemsFn ? asyncItems : (items as SelectItem[])

  const handleOpen = () => {
    if (!isItemsFn) return
    const result = (items as ItemsFn)()
    if (result instanceof Promise) {
      setLoading(true)
      result
        .then(data => setAsyncItems(data))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setAsyncItems(result)
    }
  }

  return { resolvedItems, loading, handleOpen }
}
