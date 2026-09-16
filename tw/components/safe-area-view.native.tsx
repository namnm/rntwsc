import { useSafeAreaPadding } from 'rntwsc/responsive/use-safe-area'
import type { ViewProps } from 'rntwsc/tw/components/view'
import { View } from 'rntwsc/tw/components/view'

export const SafeAreaView = ({ className, ...props }: ViewProps) => {
  const padding = useSafeAreaPadding()
  return <View {...props} className={[padding, className]} />
}
