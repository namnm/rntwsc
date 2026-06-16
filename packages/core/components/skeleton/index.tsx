import type { ViewProps } from '@/core/tw/components/view'
import { View } from '@/core/tw/components/view'

export type SkeletonProps = Omit<ViewProps, 'children'>

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <View
    {...props}
    className={['w-full animate-pulse rounded-md bg-gray-500', className]}
  />
)
