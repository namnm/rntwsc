'use client'

import { useEffect, useRef } from 'react'

import { Span } from '@/core/components/text'
import { isWeb } from '@/core/platform'
import type { FlatListRn } from '@/core/tw/components/flat-list'
import { FlatList } from '@/core/tw/components/flat-list'
import type { InputRn } from '@/core/tw/components/input'
import { Input } from '@/core/tw/components/input'
import type { PressableRn } from '@/core/tw/components/pressable'
import { Pressable } from '@/core/tw/components/pressable'
import type { ScrollViewRn } from '@/core/tw/components/scroll-view'
import { ScrollView } from '@/core/tw/components/scroll-view'
import type { TextRn } from '@/core/tw/components/text'
import { TextWithoutContext } from '@/core/tw/components/text'
import type { ViewRn } from '@/core/tw/components/view'
import { View } from '@/core/tw/components/view'
import { useImmer } from '@/core/utils/immer'
import { camelCase } from '@/shared/lodash'
import type { StrMap } from '@/shared/ts-utils'

export const RefsClient = () => {
  const [state, setState] = useImmer<StrMap<boolean>>({})

  const textRef = useRef<TextRn>(null)
  const viewRef = useRef<ViewRn>(null)
  const scrollViewRef = useRef<ScrollViewRn>(null)
  const pressableRef = useRef<PressableRn>(null)
  const inputRef = useRef<InputRn>(null)
  const flatListRef = useRef<FlatListRn>(null)

  useEffect(() => {
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
  }, [])

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
