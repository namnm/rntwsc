'use client'

import { createMMKV } from 'react-native-mmkv'

import { setAdapter } from 'rntwsc/libs/storage'

const mmkv = createMMKV()

setAdapter({
  getItem: async key => {
    const v = mmkv.getString(key)
    return v !== undefined ? v : null
  },
  setItem: async (key, value) => {
    mmkv.set(key, value)
  },
  removeItem: async key => {
    mmkv.remove(key)
  },
})

export * from 'react-native-mmkv'
