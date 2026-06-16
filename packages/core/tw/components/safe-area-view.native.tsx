import { useSafeAreaPadding } from '@/core/responsive/use-safe-area'
import type { ViewProps } from '@/core/tw/components/view'
import { View } from '@/core/tw/components/view'

export const SafeAreaView = ({ className, ...props }: ViewProps) => {
  const padding = useSafeAreaPadding()
  return <View {...props} className={[padding, className]} />
}
