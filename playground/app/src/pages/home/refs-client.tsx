'use client'

import { Span } from '@rntwsc/core/components/text'
import { camelCase } from '@rntwsc/core/lodash'
import { isWeb } from '@rntwsc/core/platform'
import type { StrMap } from '@rntwsc/core/ts-utils'
import type { FlatListRn } from '@rntwsc/core/tw/components/flat-list'
import { FlatList } from '@rntwsc/core/tw/components/flat-list'
import type { InputRn } from '@rntwsc/core/tw/components/input'
import { Input } from '@rntwsc/core/tw/components/input'
import type { PressableRn } from '@rntwsc/core/tw/components/pressable'
import { Pressable } from '@rntwsc/core/tw/components/pressable'
import type { ScrollViewRn } from '@rntwsc/core/tw/components/scroll-view'
import { ScrollView } from '@rntwsc/core/tw/components/scroll-view'
import type { TextRn } from '@rntwsc/core/tw/components/text'
import { TextWithoutContext } from '@rntwsc/core/tw/components/text'
import type { ViewRn } from '@rntwsc/core/tw/components/view'
import { View } from '@rntwsc/core/tw/components/view'
import { useImmer } from '@rntwsc/core/utils/immer'
import { useOnMounted } from '@rntwsc/core/utils/use-mounted'
import { useRef } from 'react'

export const RefsClient = () => {
  const [state, setState] = useImmer<StrMap<boolean>>({})

  const textRef = useRef<TextRn>(null)
  const viewRef = useRef<ViewRn>(null)
  const scrollViewRef = useRef<ScrollViewRn>(null)
  const pressableRef = useRef<PressableRn>(null)
  const inputRef = useRef<InputRn>(null)
  const flatListRef = useRef<FlatListRn>(null)

  useOnMounted(() => {
    setState(d => {
      if (textRef.current?.measureLayout) {
        d.text = true
      }
      if (viewRef.current?.measureLayout) {
        d.view = true
      }
      if (scrollViewRef.current?.measureLayout) {
        d.scrollView = true
      }
      if (pressableRef.current?.measureLayout) {
        d.pressable = true
      }
      if (inputRef.current?.measureLayout) {
        d.input = true
      }
      if (flatListRef.current?.scrollToItem) {
        d.flatList = true
      }
    })
  })

  const comma = (
    <Span className='text-foreground text-center transition'>{', '}</Span>
  )
  const item = (k: string) => (
    <Span
      className={[
        'text-center',
        state[camelCase(k)] ? 'text-green-500' : 'text-red-500',
      ]}
    >
      {k}
    </Span>
  )

  const nativeRefs = (
    <>
      <TextWithoutContext ref={textRef} className='hidden' />
      <View ref={viewRef} className='hidden' />
      <ScrollView ref={scrollViewRef} className='hidden' />
      <Pressable ref={pressableRef} className='hidden' />
      <Input ref={inputRef} className='hidden' />
      <FlatList
        ref={flatListRef}
        data={[]}
        renderItem={() => null}
        className='hidden'
      />
    </>
  )

  const refs = (
    <>
      {isWeb && nativeRefs}
      <View className='mx-auto mt-5 max-w-100'>
        <Span className='text-foreground text-center font-medium transition'>
          Native Refs
        </Span>
        <View className='flex flex-row'>
          {item('Text')}
          {comma}
          {item('View')}
          {comma}
          {item('ScrollView')}
          {comma}
          {item('Pressable')}
          {comma}
          {item('Input')}
          {comma}
          {item('FlatList')}
        </View>
      </View>
    </>
  )

  // need to render outside of scroll view on native
  return isWeb ? refs : [refs, nativeRefs]
}
