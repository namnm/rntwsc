'use client'

import { useState } from 'react'
import type { PropsWithChildren } from 'react'

import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { LinkUntyped } from '@/rn/core/components/link-untyped'
import { NavLayout } from '#/components/nav-layout'
import { rYhHome, rYhCamera } from '#/pages/route-paths'

const PRIMARY = '#132C95'

type Tab = { key: string; label: string; href?: string }

const tabs: Tab[] = [
  { key: 'home', label: 'Trang chủ', href: rYhHome },
  { key: 'vaccine', label: 'Tiêm chủng' },
  { key: 'camera', label: 'Camera', href: rYhCamera },
  { key: 'medicine', label: 'Thuốc' },
  { key: 'account', label: 'Tài khoản' },
]

const emergencyContacts = [
  { id: '1', name: 'Cấp cứu', number: '115' },
  { id: '2', name: 'BV Bạch Mai', number: '024 3869 3731' },
  { id: '3', name: 'BV Việt Đức', number: '024 3825 3531' },
]

type Message = { id: string; role: 'user' | 'ai'; text: string; time: string }

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'ai',
    text: 'Xin chào! Tôi có thể giúp bạn tra cứu thuốc, giải thích kết quả xét nghiệm hoặc tìm hiểu lịch tiêm chủng. Bạn cần hỗ trợ gì?',
    time: '10:00',
  },
  {
    id: '2',
    role: 'user',
    text: 'Chỉ số HbA1c 7.2% trong đơn của tôi có nghĩa gì vậy?',
    time: '10:01',
  },
  {
    id: '3',
    role: 'ai',
    text: 'HbA1c 7.2% phản ánh mức đường huyết trung bình trong ~3 tháng gần nhất.\n\n* Bình thường: < 5.7%\n* Tiền tiểu đường: 5.7-6.4%\n* Tiểu đường: >= 6.5%\n\nMức 7.2% nằm trong ngưỡng tiểu đường. Tôi không thể đưa ra kết luận y khoa -- bạn nên trao đổi trực tiếp với bác sĩ.',
    time: '10:01',
  },
]

type YhLayoutProps = PropsWithChildren<{
  activeTab?: string
  title?: string
  showBack?: boolean
}>

export const YhLayout = ({ children, activeTab = 'home', title, showBack }: YhLayoutProps) => {
  const [showChat, setShowChat] = useState(false)
  const [hideFloating, setHideFloating] = useState(false)
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [messages] = useState<Message[]>(initialMessages)
  const [callConfirm, setCallConfirm] = useState<(typeof emergencyContacts)[0] | null>(null)

  return (
    <NavLayout>
      {/* page bg */}
      <View className='flex-1 items-center justify-start overflow-auto bg-gray-200 py-8'>

        {/* iPhone 15 Pro Max frame — 393 x 852 logical px */}
        <View
          className='relative flex-col overflow-hidden bg-white shadow-2xl'
          style={{
            width: 393,
            height: 852,
            borderRadius: 54,
            borderWidth: 2,
            borderColor: '#d1d5db',
          }}
        >
          {/* Status bar */}
          <View className='flex-row items-center justify-between bg-white px-8 pt-3 pb-1'>
            <Span className='text-[11px] font-semibold text-gray-900'>9:41</Span>
            {/* Dynamic Island */}
            <View
              className='absolute left-1/2 top-2 bg-black'
              style={{ width: 120, height: 34, borderRadius: 20, transform: [{ translateX: -60 }] }}
            />
            {/* Status icons */}
            <View className='flex-row items-center gap-1'>
              <svg width='17' height='12' viewBox='0 0 17 12' fill='#111827'>
                <rect x='0' y='6' width='3' height='6' rx='1' />
                <rect x='4.5' y='4' width='3' height='8' rx='1' />
                <rect x='9' y='2' width='3' height='10' rx='1' />
                <rect x='13.5' y='0' width='3' height='12' rx='1' />
              </svg>
              <svg width='16' height='12' viewBox='0 0 24 24' fill='none' stroke='#111827' strokeWidth='2.5' strokeLinecap='round'>
                <path d='M5 12.55a11 11 0 0 1 14.08 0' />
                <path d='M1.42 9a16 16 0 0 1 21.16 0' />
                <path d='M8.53 16.11a6 6 0 0 1 6.95 0' />
                <circle cx='12' cy='20' r='1' fill='#111827' stroke='none' />
              </svg>
              <View className='flex-row items-center'>
                <View className='h-3 w-6 items-center justify-start overflow-hidden rounded-[3px] border border-gray-800 p-px flex-row'>
                  <View className='h-full w-4 rounded-[2px] bg-gray-900' />
                </View>
                <View className='h-1.5 w-0.5 rounded-r-sm bg-gray-900' />
              </View>
            </View>
          </View>

          {/* App Header */}
          <View className='flex-row items-center border-b border-gray-100 bg-white px-4 py-2.5'>
            {showBack ? (
              <View className='mr-2 h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
                <Span className='text-gray-600'>{'<'}</Span>
              </View>
            ) : (
              <View className='flex-row items-center gap-1.5'>
                <View className='h-7 w-7 items-center justify-center rounded-lg bg-blue-600'>
                  <Span className='text-xs font-bold text-white'>YH</Span>
                </View>
                <View className='flex-row'>
                  <Span className='text-sm font-bold text-orange-500'>Your</Span>
                  <Span className='text-sm font-bold text-blue-600'>Health</Span>
                </View>
              </View>
            )}
            {title && (
              <Span className='flex-1 text-center text-sm font-semibold text-gray-800'>{title}</Span>
            )}
            <View className='ml-auto flex-row items-start gap-3.5'>
              {/* Emergency */}
              <View className='items-center gap-0.5'>
                <View className='relative h-6 w-6 items-center justify-center'>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#ef4444' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' />
                  </svg>
                  <View className='absolute -bottom-0.5 -right-0.5 h-3 w-3 items-center justify-center rounded-full border border-white bg-red-500'>
                    <Span className='text-[7px] font-bold text-white'>+</Span>
                  </View>
                </View>
                <Span className='text-[9px] font-medium text-red-500'>Khẩn cấp</Span>
              </View>
              {/* Notification */}
              <View className='items-center gap-0.5'>
                <View className='relative h-6 w-6 items-center justify-center rounded-full bg-gray-100'>
                  <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
                    <path d='M13.73 21a2 2 0 0 1-3.46 0' />
                  </svg>
                  <View className='absolute -right-0.5 -top-0.5 h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500'>
                    <Span className='text-[7px] font-bold text-white'>3</Span>
                  </View>
                </View>
                <Span className='text-[9px] text-gray-400'>Thông báo</Span>
              </View>
              {/* Avatar + name */}
              <View className='items-center gap-0.5'>
                <View className='h-6 w-6 items-center justify-center rounded-full bg-blue-600'>
                  <Span className='text-[9px] font-semibold text-white'>NA</Span>
                </View>
                <Span className='text-[8px] text-gray-500'>Nam A.</Span>
              </View>
            </View>
          </View>

          {/* Content area — relative so floating button + modal are contained */}
          <View className='relative flex-1 overflow-hidden'>
            {children}

            {/* Floating AI chat button */}
            {!showChat && !hideFloating && (
              <View className='absolute' style={{ bottom: 36, right: 24 }}>
                <Pressable
                  onPress={() => setShowChat(true)}
                  className='items-center justify-center rounded-full shadow-lg'
                  style={{ width: 48, height: 48, backgroundColor: PRIMARY }}
                >
                  <Span className='text-sm font-bold text-white'>AI</Span>
                </Pressable>
                {/* Dismiss X */}
                <Pressable
                  onPress={() => setHideFloating(true)}
                  className='absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-gray-500'
                >
                  <svg width='7' height='7' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='3' strokeLinecap='round'>
                    <line x1='18' y1='6' x2='6' y2='18' /><line x1='6' y1='6' x2='18' y2='18' />
                  </svg>
                </Pressable>
              </View>
            )}

            {/* Chat modal — covers content area */}
            {showChat && (
              <View className='absolute inset-0 z-50 flex-col bg-white'>
                {/* Modal header */}
                <View className='flex-row items-center justify-between border-b border-gray-100 px-4 py-3'>
                  <View className='flex-row items-center gap-2'>
                    <View className='h-6 w-6 items-center justify-center rounded-full' style={{ backgroundColor: PRIMARY }}>
                      <Span className='text-[9px] font-bold text-white'>AI</Span>
                    </View>
                    <Span className='text-sm font-semibold text-gray-800'>Trợ lý AI</Span>
                  </View>
                  <Pressable
                    onPress={() => setShowChat(false)}
                    className='h-7 w-7 items-center justify-center rounded-full bg-gray-100'
                  >
                    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='2.5' strokeLinecap='round'>
                      <line x1='18' y1='6' x2='6' y2='18' /><line x1='6' y1='6' x2='18' y2='18' />
                    </svg>
                  </Pressable>
                </View>

                {/* Emergency contacts */}
                <View className='border-b border-gray-100 bg-white'>
                  <Pressable
                    onPress={() => setEmergencyOpen(o => !o)}
                    className='flex-row items-center justify-between px-4 py-2.5'
                  >
                    <View className='flex-row items-center gap-2'>
                      <View className='h-6 w-6 items-center justify-center rounded-full bg-red-500'>
                        <Span className='text-[9px] font-bold text-white'>SOS</Span>
                      </View>
                      <Span className='text-xs font-semibold text-gray-700'>Liên hệ khẩn cấp</Span>
                    </View>
                    <View className='flex-row items-center gap-1'>
                      <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2.5' strokeLinecap='round'>
                        {emergencyOpen
                          ? <polyline points='18 15 12 9 6 15' />
                          : <polyline points='6 9 12 15 18 9' />}
                      </svg>
                    </View>
                  </Pressable>

                  {emergencyOpen && (
                    <View className='px-4 pb-3'>
                      {emergencyContacts.map(c => (
                        <Pressable
                          key={c.id}
                          onPress={() => setCallConfirm(c)}
                          className='mb-2 flex-row items-center justify-between rounded-xl bg-red-50 px-3 py-2'
                        >
                          <View>
                            <Span className='text-xs font-semibold text-gray-800'>{c.name}</Span>
                            <Span className='text-[10px] text-red-500'>{c.number}</Span>
                          </View>
                          <View className='h-7 w-7 items-center justify-center rounded-full bg-red-500'>
                            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                              <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' />
                            </svg>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Call confirmation */}
                {callConfirm && (
                  <View className='absolute inset-0 z-10 items-center justify-center bg-black/40 p-6'>
                    <View className='w-full rounded-2xl bg-white p-5 shadow-xl'>
                      <Span className='mb-1 text-center text-sm font-bold text-gray-800'>Gọi {callConfirm.name}?</Span>
                      <Span className='mb-4 text-center text-base font-semibold text-red-500'>{callConfirm.number}</Span>
                      <View className='flex-row gap-3'>
                        <Pressable onPress={() => setCallConfirm(null)} className='flex-1 items-center rounded-xl border border-gray-200 py-2.5'>
                          <Span className='text-xs font-medium text-gray-600'>Hủy</Span>
                        </Pressable>
                        <Pressable onPress={() => setCallConfirm(null)} className='flex-1 items-center rounded-xl bg-red-500 py-2.5'>
                          <Span className='text-xs font-semibold text-white'>Gọi ngay</Span>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}

                {/* Messages */}
                <ScrollView className='flex-1 px-3 py-3'>
                  {messages.map(msg => (
                    <View key={msg.id} className={['mb-3', msg.role === 'user' ? 'items-end' : 'items-start']}>
                      {msg.role === 'ai' && (
                        <View className='mb-1 flex-row items-center gap-1'>
                          <View className='h-5 w-5 items-center justify-center rounded-full bg-blue-600'>
                            <Span className='text-[8px] font-bold text-white'>AI</Span>
                          </View>
                          <Span className='text-[9px] text-gray-400'>YourHealth AI</Span>
                        </View>
                      )}
                      <View
                        className={[
                          'max-w-[85%] rounded-2xl px-3 py-2',
                          msg.role === 'user' ? 'rounded-tr-sm bg-blue-600' : 'rounded-tl-sm bg-gray-100',
                        ]}
                      >
                        <Span className={['text-[11px] leading-5', msg.role === 'user' ? 'text-white' : 'text-gray-800']}>
                          {msg.text}
                        </Span>
                      </View>
                      <Span className='mt-0.5 text-[9px] text-gray-400'>{msg.time}</Span>
                    </View>
                  ))}
                </ScrollView>

                {/* Disclaimer */}
                <View className='border-t border-gray-100 bg-amber-50 px-4 py-1.5'>
                  <Span className='text-center text-[9px] text-amber-600'>
                    Thông tin chỉ mang tính tham khảo, không thay thế tư vấn bác sĩ.
                  </Span>
                </View>

                {/* Input */}
                <View className='flex-row items-center gap-2 border-t border-gray-100 bg-white px-3 py-2'>
                  <Pressable className='h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <rect x='3' y='3' width='18' height='18' rx='2' /><circle cx='8.5' cy='8.5' r='1.5' /><polyline points='21 15 16 10 5 21' />
                    </svg>
                  </Pressable>
                  <View className='flex-1 rounded-full border border-gray-200 bg-slate-50 px-3 py-2'>
                    <Span className='text-[11px] text-gray-400'>Nhập câu hỏi về thuốc, xét nghiệm...</Span>
                  </View>
                  <Pressable className='h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z' /><path d='M19 10v2a7 7 0 0 1-14 0v-2' /><line x1='12' y1='19' x2='12' y2='23' /><line x1='8' y1='23' x2='16' y2='23' />
                    </svg>
                  </Pressable>
                  <Pressable className='h-8 w-8 items-center justify-center rounded-full' style={{ backgroundColor: PRIMARY }}>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <line x1='22' y1='2' x2='11' y2='13' /><polygon points='22 2 15 22 11 13 2 9 22 2' />
                    </svg>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Bottom Tab Bar */}
          <View className='flex-row border-t border-gray-100 bg-white pb-4 pt-1'>
            {tabs.map(tab => {
              const isActive = tab.key === activeTab
              const inner = (
                <View key={tab.key} className='flex-1 items-center py-1'>
                  <View
                    className={[
                      'mb-0.5 h-5 w-5 items-center justify-center rounded-full',
                      isActive ? 'bg-blue-600' : 'bg-gray-200',
                    ]}
                  >
                    <Span className='text-[8px] font-bold text-white'>
                      {tab.key === 'home' ? 'H' : tab.key === 'vaccine' ? 'V' : tab.key === 'camera' ? 'C' : tab.key === 'medicine' ? 'Rx' : 'A'}
                    </Span>
                  </View>
                  <Span className={['text-[9px] transition', isActive ? 'font-semibold text-blue-600' : 'text-gray-400']}>
                    {tab.label}
                  </Span>
                </View>
              )
              return tab.href ? (
                <LinkUntyped key={tab.key} pathname={tab.href} className='flex-1'>
                  {inner}
                </LinkUntyped>
              ) : (
                <View key={tab.key} className='flex-1'>
                  {inner}
                </View>
              )
            })}
          </View>
        </View>
      </View>
    </NavLayout>
  )
}
