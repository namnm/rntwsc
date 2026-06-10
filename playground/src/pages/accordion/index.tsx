'use client'

import { Accordion } from '@/rn/components/accordion'
import { H1, Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { Minus } from '@/rn/svg-icons/minus'
import { Plus } from '@/rn/svg-icons/plus'
import { NavLayout } from '#/components/nav-layout'

const gaps = ['sm', 'md', 'lg'] as const

const basicItems = [
  {
    value: 'item-1',
    title: 'First item',
    content: 'Basic usage is a single mode with no border wrapper.',
  },
  {
    value: 'item-2',
    title: 'Second item',
    content: 'Borderless is useful for custom containers.',
  },
]

const borderItems = [
  {
    value: 'item-1',
    title: 'First item',
    content: 'Border is applied automatically.',
  },
  {
    value: 'item-2',
    title: 'Second item',
    content: 'No extra wrapper needed.',
  },
]

const multipleItems = [
  {
    value: 'item-1',
    title: 'First item',
    content: 'Multiple items can be open at the same time.',
  },
  {
    value: 'item-2',
    title: 'Second item',
    content: 'This one is also open by default.',
  },
  {
    value: 'item-3',
    title: 'Third item',
    content: 'Click any trigger to toggle independently.',
  },
]

const gapItems = [
  {
    value: 'item-1',
    title: 'First item',
    content:
      'The gap prop controls the padding inside each trigger and content area.',
  },
  {
    value: 'item-2',
    title: 'Second item',
    content:
      'Smaller gap fits compact layouts, larger gap gives more breathing room.',
  },
]

const customTriggerItems = [
  {
    value: 'item-1',
    title: (open: boolean) => {
      const text = open ? 'Collapse' : 'Expand'
      const Icon = open ? Minus : Plus
      return (
        <>
          <Span>{text}</Span>
          <Icon className='text-gray-500' />
        </>
      )
    },
    content: 'The trigger can be rendered based on the open state.',
  },
]

const collapsibleItems = [
  {
    value: 'item-1',
    title: 'Always one open',
    content:
      'Click this trigger again - it will not close. One item must always remain open.',
  },
  {
    value: 'item-2',
    title: 'Switch between items',
    content:
      'You can switch to another item, but the accordion will never be fully collapsed.',
  },
]

const disabledItems = [
  {
    value: 'item-1',
    title: 'Enabled',
    content: 'This item can be toggled.',
    disabled: false,
  },
  {
    value: 'item-2',
    title: 'Disabled',
    content: 'This content is not reachable.',
    disabled: true,
  },
]

const disabledRootItems = [
  {
    value: 'item-1',
    title: 'All items disabled',
    content:
      'The entire accordion is disabled from the root - no item can be toggled.',
  },
  {
    value: 'item-2',
    title: 'No interaction',
    content:
      'Use root disabled when the accordion should be read-only based on app state.',
  },
]

export const AccordionPage = () => {
  const padding = useSafeAreaPadding()

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <View className='flex-row items-center gap-3'>
            <H1 className='text-foreground text-2xl font-semibold transition'>
              Accordion
            </H1>
          </View>

          <View className='gap-4'>
            <Span className='text-foreground text-lg font-semibold transition'>
              basic
            </Span>
            <View className='gap-2'>
              <Accordion defaultValue='item-1'>
                {basicItems.map(item => (
                  <Accordion.Item key={item.value} value={item.value}>
                    <Accordion.Trigger>
                      <Span>{item.title}</Span>
                    </Accordion.Trigger>
                    <Accordion.Content>
                      <Span>{item.content}</Span>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </View>
          </View>

          <View className='gap-4'>
            <Span className='text-foreground text-lg font-semibold transition'>
              with border
            </Span>
            <View className='gap-2'>
              <Accordion border defaultValue='item-1'>
                {borderItems.map(item => (
                  <Accordion.Item key={item.value} value={item.value}>
                    <Accordion.Trigger>
                      <Span>{item.title}</Span>
                    </Accordion.Trigger>
                    <Accordion.Content>
                      <Span>{item.content}</Span>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </View>
          </View>

          <View className='gap-4'>
            <Span className='text-foreground text-lg font-semibold transition'>
              multiple
            </Span>
            <Accordion multiple defaultValue={['item-1', 'item-2']}>
              {multipleItems.map(item => (
                <Accordion.Item key={item.value} value={item.value}>
                  <Accordion.Trigger>
                    <Span>{item.title}</Span>
                  </Accordion.Trigger>
                  <Accordion.Content>
                    <Span>{item.content}</Span>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion>
          </View>

          <View className='gap-4'>
            <Span className='text-foreground text-lg font-semibold transition'>
              gap
            </Span>
            {gaps.map((gap, i) => (
              <View key={gap} className='gap-2'>
                <Span className='text-foreground italic transition'>{gap}</Span>
                <Accordion
                  gap={gap}
                  defaultValue={i <= 1 ? `item-${i + 1}` : undefined}
                >
                  {gapItems.map(item => (
                    <Accordion.Item key={item.value} value={item.value}>
                      <Accordion.Trigger>
                        <Span>{item.title}</Span>
                      </Accordion.Trigger>
                      <Accordion.Content>
                        <Span>{item.content}</Span>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </View>
            ))}
          </View>

          <View className='gap-4'>
            <Span className='text-foreground text-lg font-semibold transition'>
              custom trigger
            </Span>
            <View className='gap-2'>
              <Accordion>
                {customTriggerItems.map(item => (
                  <Accordion.Item key={item.value} value={item.value}>
                    <Accordion.Trigger>{item.title}</Accordion.Trigger>
                    <Accordion.Content>
                      <Span>{item.content}</Span>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </View>
          </View>

          <View className='gap-4'>
            <Span className='text-foreground text-lg font-semibold transition'>
              non collapsible
            </Span>
            <Span className='text-foreground italic transition'>
              only available in single mode
            </Span>
            <View className='gap-2'>
              <Accordion collapsible={false} defaultValue='item-1'>
                {collapsibleItems.map(item => (
                  <Accordion.Item key={item.value} value={item.value}>
                    <Accordion.Trigger>
                      <Span>{item.title}</Span>
                    </Accordion.Trigger>
                    <Accordion.Content>
                      <Span>{item.content}</Span>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </View>
          </View>

          <View className='gap-4'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled
            </Span>
            <View className='gap-2'>
              <Accordion>
                {disabledItems.map(item => (
                  <Accordion.Item
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled}
                  >
                    <Accordion.Trigger>
                      <Span>{item.title}</Span>
                    </Accordion.Trigger>
                    <Accordion.Content>
                      <Span>{item.content}</Span>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </View>
          </View>

          <View className='gap-4'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled (root)
            </Span>
            <View className='gap-2'>
              <Accordion disabled defaultValue='item-1'>
                {disabledRootItems.map(item => (
                  <Accordion.Item key={item.value} value={item.value}>
                    <Accordion.Trigger>
                      <Span>{item.title}</Span>
                    </Accordion.Trigger>
                    <Accordion.Content>
                      <Span>{item.content}</Span>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </View>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
