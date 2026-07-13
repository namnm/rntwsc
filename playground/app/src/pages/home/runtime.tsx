import { Span } from '@rntwsc/core/components/text'
import { jsonSafe } from '@rntwsc/core/json-safe'
import { runtimeStyle } from '@rntwsc/core/tw/runtime-style'

export const DemoRuntime = () => {
  const cn = 'text-red-500'
  return (
    <Span className='text-foreground mt-5 text-center transition'>
      Runtime Style '{cn}' = {jsonSafe(runtimeStyle(cn))}
    </Span>
  )
}
