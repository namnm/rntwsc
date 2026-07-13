import { Span } from 'rntwsc/components/text'
import { jsonSafe } from 'rntwsc/libs/json-safe'
import { runtimeStyle } from 'rntwsc/tw/runtime-style'

export const DemoRuntime = () => {
  const cn = 'text-red-500'
  return (
    <Span className='text-foreground mt-5 text-center transition'>
      Runtime Style '{cn}' = {jsonSafe(runtimeStyle(cn))}
    </Span>
  )
}
