import { Span } from '@/rn/components/text'
import { View } from '@/rn/core/components/view'

export const DemoGrid = () => (
  <>
    <Span className='text-foreground mt-5 text-center font-medium transition'>
      Basic Grid Columns
    </Span>
    <View className='m-auto grid w-full max-w-150 grid-cols-3 gap-2.5 p-2.5'>
      <View className='bg-primary-200 dark:bg-primary-900 h-50 rounded-md transition' />
      <View className='bg-secondary-200 dark:bg-secondary-900 h-50 rounded-md transition'>
        <View className='grid grid-cols-[20px_1fr_20px] gap-2.5 p-2.5'>
          <View className='bg-primary-200 dark:bg-primary-900 h-10 rounded-md transition' />
          <View className='bg-error-200 dark:bg-error-900 h-10 rounded-md transition' />
          <View className='bg-primary-200 dark:bg-primary-900 h-10 rounded-md transition' />
        </View>
      </View>
      <View className='bg-primary-200 dark:bg-primary-900 h-50 rounded-md transition' />
    </View>
  </>
)
