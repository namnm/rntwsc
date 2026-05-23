'use client'

import { useState } from 'react'

import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { YhLayout } from '#/components/yh-layout'

const emergencyContacts = [
  { id: '1', name: 'Cấp cứu', number: '115', isDefault: true },
  { id: '2', name: 'BV Bạch Mai', number: '024 3869 3731', isDefault: false },
  { id: '3', name: 'BV Việt Đức', number: '024 3825 3531', isDefault: false },
]

type Message = {
  id: string
  role: 'user' | 'ai'
  text: string
  time: string
}

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
    text: 'HbA1c 7.2% phản ánh mức đường huyết trung bình trong ~3 tháng gần nhất.\n\n• Bình thường: < 5.7%\n• Tiền tiểu đường: 5.7–6.4%\n• Tiểu đường: ≥ 6.5%\n\nMức 7.2% nằm trong ngưỡng tiểu đường. Bác sĩ thường hướng đến mục tiêu < 7% ở người đang điều trị.\n\nTôi không thể đưa ra kết luận y khoa — bạn nên trao đổi trực tiếp với bác sĩ để được tư vấn điều chỉnh điều trị.',
    time: '10:01',
  },
]

export const YhChatPage = () => {
  const [emergencyOpen, setEmergencyOpen] = useState(true)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [callConfirm, setCallConfirm] = useState<(typeof emergencyContacts)[0] | null>(null)

  const sendMessage = () => {
    if (!input.trim()) return
    const newMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      text: input,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [
      ...prev,
      newMsg,
      {
        id: String(Date.now() + 1),
        role: 'ai',
        text: 'Cảm ơn câu hỏi của bạn. Tôi đang tra cứu thông tin — vui lòng đợi trong giây lát.',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInput('')
  }

  return (
    <YhLayout activeTab='home' title='Trợ lý AI'>
      <View className='flex-1 bg-slate-50'>
        {/* Emergency contacts panel */}
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
            <View className='flex-row items-center gap-2'>
              <Pressable className='rounded-lg bg-gray-100 px-2 py-0.5'>
                <Span className='text-[9px] text-gray-500'>Chỉnh sửa</Span>
              </Pressable>
              <Span className='text-gray-400'>{emergencyOpen ? '▲' : '▼'}</Span>
            </View>
          </Pressable>

          {emergencyOpen && (
            <View className='px-4 pb-3'>
              {emergencyContacts.map(c => (
                <Pressable
                  key={c.id}
                  onPress={() => setCallConfirm(c)}
                  className='mb-2 flex-row items-center justify-between rounded-xl bg-red-50 px-3 py-2 last:mb-0'
                >
                  <View>
                    <Span className='text-xs font-semibold text-gray-800'>{c.name}</Span>
                    <Span className='text-[10px] text-red-500'>{c.number}</Span>
                  </View>
                  <View className='h-7 w-7 items-center justify-center rounded-full bg-red-500'>
                    <Span className='text-xs text-white'>&#128222;</Span>
                  </View>
                </Pressable>
              ))}
              <Pressable className='mt-1 flex-row items-center gap-2 rounded-xl border border-dashed border-gray-200 px-3 py-2'>
                <Span className='text-xs font-medium text-gray-400'>+ Thêm liên hệ</Span>
              </Pressable>
            </View>
          )}
        </View>

        {/* Call confirmation dialog */}
        {callConfirm && (
          <View className='absolute inset-0 z-10 items-center justify-center bg-black/40 p-6'>
            <View className='w-full rounded-2xl bg-white p-5 shadow-xl'>
              <Span className='mb-1 text-center text-sm font-bold text-gray-800'>
                Gọi {callConfirm.name}?
              </Span>
              <Span className='mb-4 text-center text-base font-semibold text-red-500'>
                {callConfirm.number}
              </Span>
              <View className='flex-row gap-3'>
                <Pressable
                  onPress={() => setCallConfirm(null)}
                  className='flex-1 items-center rounded-xl border border-gray-200 py-2.5'
                >
                  <Span className='text-xs font-medium text-gray-600'>Hủy</Span>
                </Pressable>
                <Pressable
                  onPress={() => setCallConfirm(null)}
                  className='flex-1 items-center rounded-xl bg-red-500 py-2.5'
                >
                  <Span className='text-xs font-semibold text-white'>Gọi ngay</Span>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Messages */}
        <ScrollView className='flex-1 px-3 py-3'>
          {messages.map(msg => (
            <View
              key={msg.id}
              className={['mb-3', msg.role === 'user' ? 'items-end' : 'items-start']}
            >
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
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-blue-600'
                    : 'rounded-tl-sm bg-white shadow-sm',
                ]}
              >
                <Span
                  className={[
                    'text-[11px] leading-5',
                    msg.role === 'user' ? 'text-white' : 'text-gray-800',
                  ]}
                >
                  {msg.text}
                </Span>
              </View>
              <View className='mt-0.5 flex-row items-center gap-2'>
                <Span className='text-[9px] text-gray-400'>{msg.time}</Span>
                {msg.role === 'ai' && (
                  <Pressable>
                    <Span className='text-[9px] text-gray-300'>&#128078;</Span>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Disclaimer */}
        <View className='border-t border-gray-100 bg-amber-50 px-4 py-1.5'>
          <Span className='text-center text-[9px] text-amber-600'>
            Thông tin chỉ mang tính tham khảo, không thay thế tư vấn bác sĩ.
          </Span>
        </View>

        {/* Input area */}
        <View className='flex-row items-center gap-2 border-t border-gray-100 bg-white px-3 py-2'>
          <Pressable className='h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
            <Span className='text-sm text-gray-500'>&#128204;</Span>
          </Pressable>
          <View className='flex-1 rounded-full border border-gray-200 bg-slate-50 px-3 py-2'>
            <Span className='text-[11px] text-gray-400'>Nhập câu hỏi về thuốc, xét nghiệm...</Span>
          </View>
          <Pressable className='h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
            <Span className='text-sm text-gray-500'>&#127908;</Span>
          </Pressable>
          <Pressable
            onPress={sendMessage}
            className='h-8 w-8 items-center justify-center rounded-full bg-blue-600'
          >
            <Span className='text-sm font-bold text-white'>&#10148;</Span>
          </Pressable>
        </View>
      </View>
    </YhLayout>
  )
}
