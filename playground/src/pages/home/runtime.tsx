import { Span } from '@/rn/components/text'
import { runtimeStyle } from '@/rn/core/tw/runtime-style'
import { jsonSafe } from '@/shared/json-safe'

export const DemoRuntime = () => {
  const cn = 'text-red-500'
  return (
    <Span className='text-foreground mt-5 text-center transition'>
      Runtime Style '{cn}' = {jsonSafe(runtimeStyle(cn))}
    </Span>
  )
}
