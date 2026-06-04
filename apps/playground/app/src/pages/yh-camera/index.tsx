'use client'

import { useState } from 'react'

import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { View } from '@/rn/core/components/view'
import { YhLayout } from '#/components/yh-layout'

type Phase = 'camera' | 'processing' | 'form'

const groupOptions = [
  'Nội khoa',
  'Nhi khoa',
  'Tim mạch',
  'Sản phụ khoa',
  'Khác',
]

export const YhCameraPage = () => {
  const [phase, setPhase] = useState<Phase>('camera')
  const [group, setGroup] = useState('Nội khoa')

  return (
    <YhLayout activeTab='camera' hideHeader>
      <View className='flex-1'>
        {phase === 'camera' && (
          <View className='flex-1 flex-col bg-black'>
            {/* Viewfinder - fills all available space */}
            <View className='relative flex-1 overflow-hidden bg-gray-900'>
              {/* Corner guides */}
              <View className='absolute inset-6'>
                <View className='absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-white' />
                <View className='absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-white' />
                <View className='absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-white' />
                <View className='absolute right-0 bottom-0 h-8 w-8 border-r-2 border-b-2 border-white' />
              </View>
              <View className='absolute inset-0 items-center justify-center'>
                <Span className='text-center text-xs text-white/60'>
                  Đưa hồ sơ y tế vào khung{'\n'}để chụp và trích xuất thông tin
                </Span>
              </View>
              {/* Scan line */}
              <View className='absolute top-1/2 right-6 left-6 h-0.5 bg-blue-400/50' />
            </View>

            {/* Camera controls - flush against tab bar */}
            <View className='flex-row items-center justify-around bg-black px-6 py-5'>
              {/* Album */}
              <Pressable className='items-center gap-1.5'>
                <View className='h-12 w-12 items-center justify-center rounded-2xl bg-gray-700'>
                  <Span className='text-xl text-gray-300'>&#128444;</Span>
                </View>
                <Span className='text-[10px] text-gray-400'>Album</Span>
              </Pressable>

              {/* Capture */}
              <Pressable
                onPress={() => {
                  setPhase('processing')
                  setTimeout(() => setPhase('form'), 1500)
                }}
                className='items-center'
              >
                <View className='h-16 w-16 items-center justify-center rounded-full border-4 border-white'>
                  <View className='h-12 w-12 rounded-full bg-white' />
                </View>
              </Pressable>

              {/* Upload file */}
              <Pressable
                onPress={() => {
                  setPhase('processing')
                  setTimeout(() => setPhase('form'), 1500)
                }}
                className='items-center gap-1.5'
              >
                <View className='h-12 w-12 items-center justify-center rounded-2xl bg-gray-700'>
                  <Span className='text-xl text-gray-300'>&#128196;</Span>
                </View>
                <Span className='text-[10px] text-gray-400'>Tải file</Span>
              </Pressable>
            </View>
          </View>
        )}

        {phase === 'processing' && (
          <View className='flex-1 items-center justify-center py-20'>
            <View className='mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
              <Span className='text-2xl'>&#128269;</Span>
            </View>
            <Span className='mb-1 text-sm font-semibold text-gray-800'>
              Đang xử lý OCR...
            </Span>
            <Span className='text-xs text-gray-400'>
              Đang trích xuất thông tin từ hồ sơ
            </Span>
          </View>
        )}

        {phase === 'form' && (
          <View className='flex-1 p-4'>
            {/* OCR success banner */}
            <View className='mb-4 flex-row items-center gap-2 rounded-xl bg-emerald-50 p-3'>
              <View className='h-5 w-5 items-center justify-center rounded-full bg-emerald-600'>
                <Span className='text-[10px] font-bold text-white'>✓</Span>
              </View>
              <Span className='flex-1 text-[10px] text-emerald-700'>
                OCR đọc thành công. Kiểm tra lại thông tin trước khi lưu.
              </Span>
            </View>

            {/* Thumbnail */}
            <View className='mb-4 h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-200'>
              <Span className='text-4xl text-gray-400'>&#128444;</Span>
              <Span className='mt-1 text-[10px] text-gray-400'>
                Hồ sơ đã chụp
              </Span>
            </View>

            {/* Form fields */}
            <View className='gap-3'>
              <View>
                <Span className='mb-1 text-[10px] font-medium text-gray-500'>
                  TÊN BỆNH *
                </Span>
                <View className='flex-row items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5'>
                  <Span className='flex-1 text-xs text-gray-800'>
                    Viêm phổi cộng đồng
                  </Span>
                  <View className='h-4 w-4 items-center justify-center rounded-full bg-emerald-100'>
                    <Span className='text-[8px] text-emerald-600'>✓</Span>
                  </View>
                </View>
              </View>

              <View>
                <Span className='mb-1 text-[10px] font-medium text-gray-500'>
                  NƠI ĐIỀU TRỊ *
                </Span>
                <View className='flex-row items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5'>
                  <Span className='flex-1 text-xs text-gray-800'>
                    BV Bạch Mai — Hà Nội
                  </Span>
                  <View className='h-4 w-4 items-center justify-center rounded-full bg-emerald-100'>
                    <Span className='text-[8px] text-emerald-600'>✓</Span>
                  </View>
                </View>
              </View>

              <View>
                <Span className='mb-1 text-[10px] font-medium text-gray-500'>
                  NGÀY KHÁM *
                </Span>
                <View className='flex-row items-center rounded-xl border border-orange-300 bg-orange-50 px-3 py-2.5'>
                  <Span className='flex-1 text-xs text-gray-400'>
                    Nhập ngày khám...
                  </Span>
                  <View className='h-4 w-4 items-center justify-center rounded-full bg-orange-200'>
                    <Span className='text-[8px] text-orange-600'>!</Span>
                  </View>
                </View>
                <Span className='mt-0.5 text-[9px] text-orange-500'>
                  Cần bổ sung thủ công
                </Span>
              </View>

              <View>
                <Span className='mb-1 text-[10px] font-medium text-gray-500'>
                  NHÓM
                </Span>
                <View className='flex-row flex-wrap gap-1.5'>
                  {groupOptions.map(g => (
                    <Pressable
                      key={g}
                      onPress={() => setGroup(g)}
                      className={[
                        'rounded-full border px-3 py-1',
                        group === g
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-200 bg-white',
                      ]}
                    >
                      <Span
                        className={[
                          'text-[10px]',
                          group === g
                            ? 'font-medium text-white'
                            : 'text-gray-500',
                        ]}
                      >
                        {g}
                      </Span>
                    </Pressable>
                  ))}
                  <Pressable className='h-6 w-6 items-center justify-center rounded-full border border-dashed border-gray-300'>
                    <Span className='text-xs text-gray-400'>+</Span>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View className='mt-5 flex-row gap-3'>
              <Pressable
                onPress={() => setPhase('camera')}
                className='flex-1 items-center rounded-xl border border-gray-200 bg-white py-3'
              >
                <Span className='text-xs font-medium text-gray-600'>
                  Hủy bỏ
                </Span>
              </Pressable>
              <Pressable
                onPress={() => setPhase('camera')}
                className='flex-1 items-center rounded-xl bg-blue-600 py-3'
              >
                <Span className='text-xs font-semibold text-white'>
                  Lưu lại
                </Span>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </YhLayout>
  )
}
