'use client'

import { useState } from 'react'

import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { YhLayout } from '#/components/yh-layout'

const today = new Date(2026, 4, 21)

const getDaysLeft = (date: Date) =>
  Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

const formatDate = (date: Date) =>
  date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const reminders = [
  {
    id: '1',
    type: 'medicine' as const,
    label: 'Uống thuốc',
    scheduleLabel: 'Bạn cần uống thuốc vào',
    name: 'Paracetamol 500mg',
    date: new Date(2026, 4, 21),
    color: 'bg-orange-500',
  },
  {
    id: '2',
    type: 'vaccine' as const,
    label: 'Tiêm chủng',
    scheduleLabel: 'Bạn có lịch tiêm vào',
    name: 'Vắc-xin Cúm mùa',
    date: new Date(2026, 4, 23),
    color: 'bg-emerald-600',
  },
  {
    id: '3',
    type: 'revisit' as const,
    label: 'Tái khám',
    scheduleLabel: 'Bạn có lịch tái khám vào',
    name: 'Tim mạch — BV Bạch Mai',
    date: new Date(2026, 4, 24),
    color: 'bg-blue-600',
  },
]

const trackingRecords = [
  {
    id: '1',
    dateObj: new Date(2025, 2, 12),
    date: '12/03/2025',
    disease: 'Huyết áp cao',
    place: 'BV Bạch Mai',
    medicine: 'Amlodipine 5mg',
    tag: 'Đang theo dõi',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: '2',
    dateObj: new Date(2025, 0, 5),
    date: '05/01/2025',
    disease: 'Tiểu đường type 2',
    place: 'PK Đa khoa Hà Nội',
    medicine: 'Metformin 500mg',
    tag: 'Đang theo dõi',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: '3',
    dateObj: new Date(2024, 8, 17),
    date: '17/09/2024',
    disease: 'Đau cổ vai gáy',
    place: 'BV Đa khoa Tâm Anh',
    medicine: 'Ibuprofen 400mg',
    tag: 'Đang theo dõi',
    tagColor: 'bg-blue-100 text-blue-700',
  },
].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())

const historyRecords = [
  {
    id: 'h1',
    dateObj: new Date(2025, 3, 15),
    date: '15/04/2025',
    disease: 'Viêm họng cấp',
    place: 'PK Tai Mũi Họng',
    medicine: 'Amoxicillin 500mg',
    doctor: 'BS. Nguyễn Văn A',
  },
  {
    id: 'h2',
    dateObj: new Date(2025, 2, 12),
    date: '12/03/2025',
    disease: 'Huyết áp cao',
    place: 'BV Bạch Mai',
    medicine: 'Amlodipine 5mg',
    doctor: 'BS. Trần Thị B',
  },
  {
    id: 'h3',
    dateObj: new Date(2025, 0, 5),
    date: '05/01/2025',
    disease: 'Tiểu đường type 2',
    place: 'PK Đa khoa Hà Nội',
    medicine: 'Metformin 500mg',
    doctor: 'BS. Lê Văn C',
  },
  {
    id: 'h4',
    dateObj: new Date(2024, 10, 20),
    date: '20/11/2024',
    disease: 'Cúm mùa',
    place: 'BV Đa khoa tỉnh',
    medicine: 'Oseltamivir 75mg',
    doctor: 'BS. Phạm Thị D',
  },
  {
    id: 'h5',
    dateObj: new Date(2024, 7, 8),
    date: '08/08/2024',
    disease: 'Viêm xoang',
    place: 'PK Nhi đồng',
    medicine: 'Mometasone xịt mũi',
    doctor: 'BS. Hoàng Văn E',
  },
  {
    id: 'h6',
    dateObj: new Date(2024, 5, 15),
    date: '15/06/2024',
    disease: 'Đau lưng mãn tính',
    place: 'BV Chấn thương chỉnh hình',
    medicine: 'Ibuprofen 400mg',
    doctor: 'BS. Vũ Thị F',
  },
  {
    id: 'h7',
    dateObj: new Date(2024, 3, 2),
    date: '02/04/2024',
    disease: 'Viêm dạ dày',
    place: 'PK Tiêu hóa',
    medicine: 'Omeprazole 20mg',
    doctor: 'BS. Đặng Văn G',
  },
  {
    id: 'h8',
    dateObj: new Date(2024, 1, 18),
    date: '18/02/2024',
    disease: 'Dị ứng da',
    place: 'BV Da liễu',
    medicine: 'Loratadine 10mg',
    doctor: 'BS. Bùi Thị H',
  },
]

const sortOptions = ['Gần nhất', 'Cũ nhất', 'Bộ lọc'] as const

const MONTHS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
]
const DAYS_IN_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const REPEAT_OPTIONS = [
  'Không lặp',
  'Mỗi ngày',
  'Các ngày trong tuần',
  'Cuối tuần',
  'Mỗi tuần',
  'Mỗi tháng',
  'Mỗi năm',
]

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay()

type EditForm = {
  disease: string
  time: string
  place: string
  medicine: string
  reminder: string
  note: string
}
const emptyForm: EditForm = {
  disease: '',
  time: '',
  place: '',
  medicine: '',
  reminder: '',
  note: '',
}

const FILTER_MIN_YEAR = Math.min(
  ...historyRecords.map(r => r.dateObj.getFullYear()),
)
const FILTER_MAX_YEAR = new Date().getFullYear()

type DetailRecord = {
  id: string
  date: string
  disease: string
  place: string
  medicine: string
  doctor?: string
  images?: Array<{ id: string; label: string; type: string }>
  links?: Array<{ id: string; label: string }>
}

type PrescriptionView = {
  disease: string
  date: string
  place: string
  doctor?: string
  medicine: string
}

const mockExtras: Record<string, Pick<DetailRecord, 'images' | 'links'>> = {
  h2: {
    images: [
      {
        id: 'i1',
        label: 'X-quang tim phổi',
        type: 'xray',
      },
      {
        id: 'i2',
        label: 'Siêu âm tim',
        type: 'ultrasound',
      },
    ],
    links: [
      {
        id: 'l1',
        label: 'Kết quả xét nghiệm máu 12/03/2025',
      },
    ],
  },
  h3: {
    images: [
      {
        id: 'i3',
        label: 'Xét nghiệm HbA1c',
        type: 'other',
      },
    ],
    links: [],
  },
}

export const YhHomePage = () => {
  const [sort, setSort] = useState<(typeof sortOptions)[number]>('Gần nhất')
  const [activeSection, setActiveSection] = useState<'tracking' | 'history'>(
    'tracking',
  )
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [slide, setSlide] = useState(0)
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [unfollowId, setUnfollowId] = useState<string | null>(null)
  const [historyFollowSet, setHistoryFollowSet] = useState<Set<string>>(
    new Set(),
  )
  const [followConfirmId, setFollowConfirmId] = useState<string | null>(null)
  const [unfollowHistoryId, setUnfollowHistoryId] = useState<string | null>(
    null,
  )
  // History: section more menu
  const [showSectionMore, setShowSectionMore] = useState(false)
  // History: bulk mode
  const [bulkMode, setBulkMode] = useState<'pdf' | 'share' | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  // History: special views
  const [specialView, setSpecialView] = useState<'hidden' | 'deleted' | null>(
    null,
  )
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  // History: filter
  const [showFilter, setShowFilter] = useState(false)
  const [filterDiseases, setFilterDiseases] = useState<Set<string>>(new Set())
  const [filterDoctors, setFilterDoctors] = useState<Set<string>>(new Set())
  const [filterPlaces, setFilterPlaces] = useState<Set<string>>(new Set())
  const [filterYearStart, setFilterYearStart] = useState(FILTER_MIN_YEAR)
  // History: per-record more + action confirm
  const [recordMoreId, setRecordMoreId] = useState<string | null>(null)
  const [recordAction, setRecordAction] = useState<{
    id: string
    type: 'pdf' | 'share' | 'hide' | 'delete'
  } | null>(null)
  // History: edit record
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [editFormValues, setEditFormValues] = useState({
    disease: '',
    date: '',
    place: '',
    doctor: '',
    medicine: '',
    note: '',
  })
  const [editRemovedImages, setEditRemovedImages] = useState<Set<string>>(
    new Set(),
  )
  // History: restore
  const [restoreId, setRestoreId] = useState<string | null>(null)
  const CARD_W = 231
  const CARD_GAP = 16

  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false)
  const [calYear, setCalYear] = useState(2026)
  const [calMonth, setCalMonth] = useState(4)
  const [calSelected, setCalSelected] = useState<
    Array<{ year: number; month: number; day: number }>
  >([])

  const isCalSelected = (year: number, month: number, day: number) =>
    calSelected.some(s => s.year === year && s.month === month && s.day === day)

  const toggleCalDay = (year: number, month: number, day: number) => {
    if (isCalSelected(year, month, day)) {
      setCalSelected(prev =>
        prev.filter(
          s => !(s.year === year && s.month === month && s.day === day),
        ),
      )
    } else {
      setCalSelected(prev => [
        ...prev,
        {
          year,
          month,
          day,
        },
      ])
    }
  }

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>(emptyForm)

  // Reminder modal (inside edit)
  const [showReminder, setShowReminder] = useState(false)
  const [remHour, setRemHour] = useState(8)
  const [remMin, setRemMin] = useState(0)
  const [remRepeat, setRemRepeat] = useState('Không lặp')
  const [detailRecord, setDetailRecord] = useState<DetailRecord | null>(null)
  const [prescriptionView, setPrescriptionView] =
    useState<PrescriptionView | null>(null)

  const tabActive = {
    backgroundColor: '#FEA755',
    borderColor: '#754539',
    borderWidth: 1,
  }
  const tabInactive = {
    backgroundColor: '#F6E5D2',
    borderColor: 'rgba(117,69,57,0.2)',
    borderWidth: 1,
  }
  const PRIMARY = '#132C95'

  // Calendar helpers
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)
  const calCells = Array.from(
    {
      length: firstDay + daysInMonth,
    },
    (_, i) => (i < firstDay ? null : i - firstDay + 1),
  )

  const allYears = historyRecords.map(r => r.dateObj.getFullYear())
  const minYear = Math.min(...allYears)
  const maxYear = Math.max(...allYears)
  const activeHistory = historyRecords.filter(
    r => !hiddenIds.has(r.id) && !deletedIds.has(r.id),
  )
  const sortedHistory = [...activeHistory].sort(
    sort === 'Cũ nhất'
      ? (a, b) => a.dateObj.getTime() - b.dateObj.getTime()
      : (a, b) => b.dateObj.getTime() - a.dateObj.getTime(),
  )
  const filterCount =
    filterDiseases.size +
    filterDoctors.size +
    filterPlaces.size +
    (filterYearStart !== FILTER_MIN_YEAR ? 1 : 0)
  const applyFilters = (r: (typeof sortedHistory)[0]) => {
    if (r.dateObj.getFullYear() < filterYearStart) {
      return false
    }
    const noneSelected =
      filterDiseases.size === 0 &&
      filterDoctors.size === 0 &&
      filterPlaces.size === 0
    if (noneSelected) {
      return true
    }
    return (
      filterDiseases.has(r.disease) ||
      filterDoctors.has(r.doctor) ||
      filterPlaces.has(r.place)
    )
  }
  const filteredHistory =
    filterCount > 0 ? sortedHistory.filter(applyFilters) : sortedHistory
  const filteredCount = filteredHistory.length

  const allTracking = [
    ...trackingRecords.filter(r => !removedIds.has(r.id)),
    ...historyRecords
      .filter(r => historyFollowSet.has(r.id))
      .map(r => ({
        ...r,
        id: 'copy_' + r.id,
      })),
  ].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())

  return (
    <YhLayout activeTab='home'>
      {/* ---- Unfollow confirmation modal ---- */}
      {unfollowId !== null && (
        <View className='absolute inset-0 z-50 items-center justify-center bg-black/40 px-6'>
          <View className='w-full rounded-2xl bg-white p-5 shadow-2xl'>
            <Span className='mb-1 text-center text-sm font-semibold text-gray-800'>
              Bỏ theo dõi
            </Span>
            <Span className='mb-5 text-center text-xs text-gray-500'>
              Bạn chắc chắn muốn bỏ theo dõi hồ sơ sức khỏe này?
            </Span>
            <View className='flex-row gap-3'>
              <Pressable
                onPress={() => {
                  const id = unfollowId!
                  if (id.startsWith('copy_')) {
                    const origId = id.replace('copy_', '')
                    setHistoryFollowSet(prev => {
                      const next = new Set(prev)
                      next.delete(origId)
                      return next
                    })
                  } else {
                    setRemovedIds(prev => {
                      const next = new Set(prev)
                      next.add(id)
                      return next
                    })
                  }
                  setUnfollowId(null)
                }}
                className='flex-1 items-center rounded-xl border border-gray-200 bg-white py-3'
              >
                <Span className='text-sm text-gray-600'>Đồng ý</Span>
              </Pressable>
              <Pressable
                onPress={() => setUnfollowId(null)}
                className='flex-1 items-center rounded-xl py-3'
                style={{
                  backgroundColor: PRIMARY,
                }}
              >
                <Span className='text-sm font-semibold text-white'>Hủy bỏ</Span>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ---- History: section more action sheet ---- */}
      {showSectionMore && (
        <View className='absolute inset-0 z-50 justify-end bg-black/30'>
          <Pressable
            className='flex-1'
            onPress={() => setShowSectionMore(false)}
          />
          <View className='rounded-t-3xl bg-white p-4'>
            <View className='mb-3 items-center'>
              <View className='h-1 w-10 rounded-full bg-gray-200' />
            </View>
            {[
              {
                label: 'Xuất PDF',
                icon: (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#132C95'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                    <polyline points='14 2 14 8 20 8' />
                    <line x1='16' y1='13' x2='8' y2='13' />
                    <line x1='16' y1='17' x2='8' y2='17' />
                    <polyline points='10 9 9 9 8 9' />
                  </svg>
                ),
                action: () => {
                  setBulkMode('pdf')
                  setSelectedIds(new Set())
                  setShowSectionMore(false)
                },
              },
              {
                label: 'Chia sẻ',
                icon: (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#132C95'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <circle cx='18' cy='5' r='3' />
                    <circle cx='6' cy='12' r='3' />
                    <circle cx='18' cy='19' r='3' />
                    <line x1='8.59' y1='13.51' x2='15.42' y2='17.49' />
                    <line x1='15.41' y1='6.51' x2='8.59' y2='10.49' />
                  </svg>
                ),
                action: () => {
                  setBulkMode('share')
                  setSelectedIds(new Set())
                  setShowSectionMore(false)
                },
              },
              {
                label: 'Bị ẩn',
                icon: (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#6b7280'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
                    <line x1='1' y1='1' x2='23' y2='23' />
                  </svg>
                ),
                action: () => {
                  setSpecialView('hidden')
                  setShowSectionMore(false)
                },
              },
              {
                label: 'Đã xóa',
                icon: (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#ef4444'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <polyline points='3 6 5 6 21 6' />
                    <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
                    <path d='M10 11v6' />
                    <path d='M14 11v6' />
                    <path d='M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' />
                  </svg>
                ),
                action: () => {
                  setSpecialView('deleted')
                  setShowSectionMore(false)
                },
              },
            ].map(item => (
              <Pressable
                key={item.label}
                onPress={item.action}
                className='flex-row items-center gap-3 rounded-xl px-3 py-3'
              >
                {item.icon}
                <Span className='text-sm text-gray-800'>{item.label}</Span>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowSectionMore(false)}
              className='mt-2 items-center rounded-2xl border border-gray-200 py-3'
            >
              <Span className='text-sm font-medium text-gray-500'>Hủy</Span>
            </Pressable>
          </View>
        </View>
      )}

      {/* ---- History: bulk confirm modal ---- */}
      {showBulkConfirm && (
        <View className='absolute inset-0 z-50 items-center justify-center bg-black/40 px-6'>
          <View className='w-full rounded-2xl bg-white p-5 shadow-2xl'>
            <Span className='mb-1 text-center text-sm font-semibold text-gray-800'>
              {bulkMode === 'pdf' ? 'Xuất PDF' : 'Chia sẻ'}
            </Span>
            <Span className='mb-5 text-center text-xs text-gray-500'>
              Bạn có muốn {bulkMode === 'pdf' ? 'xuất PDF' : 'chia sẻ'}{' '}
              {selectedIds.size} hồ sơ sức khỏe này không?
            </Span>
            <View className='flex-row gap-3'>
              <Pressable
                onPress={() => {
                  setShowBulkConfirm(false)
                  setBulkMode(null)
                  setSelectedIds(new Set())
                }}
                className='flex-1 items-center rounded-xl py-3'
                style={{
                  backgroundColor: PRIMARY,
                }}
              >
                <Span className='text-sm font-semibold text-white'>Đồng ý</Span>
              </Pressable>
              <Pressable
                onPress={() => setShowBulkConfirm(false)}
                className='flex-1 items-center rounded-xl border border-gray-200 bg-white py-3'
              >
                <Span className='text-sm text-gray-600'>Hủy bỏ</Span>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ---- History: per-record more action sheet ---- */}
      {recordMoreId !== null && (
        <View className='absolute inset-0 z-50 justify-end bg-black/30'>
          <Pressable className='flex-1' onPress={() => setRecordMoreId(null)} />
          <View className='rounded-t-3xl bg-white p-4'>
            <View className='mb-3 items-center'>
              <View className='h-1 w-10 rounded-full bg-gray-200' />
            </View>
            {[
              {
                label: 'Chỉnh sửa',
                color: '#132C95',
                icon: (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#132C95'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                    <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
                  </svg>
                ),
                onPress: () => {
                  const r = historyRecords.find(h => h.id === recordMoreId!)
                  if (r) {
                    setEditFormValues({
                      disease: r.disease,
                      date: r.date,
                      place: r.place,
                      doctor: r.doctor ?? '',
                      medicine: r.medicine,
                      note: '',
                    })
                    setEditRemovedImages(new Set())
                  }
                  setEditingRecordId(recordMoreId!)
                  setRecordMoreId(null)
                },
              },
              {
                label: 'Xuất PDF',
                color: '#132C95',
                icon: (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#132C95'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                    <polyline points='14 2 14 8 20 8' />
                    <line x1='16' y1='13' x2='8' y2='13' />
                    <line x1='16' y1='17' x2='8' y2='17' />
                  </svg>
                ),
                onPress: () => {
                  setRecordAction({
                    id: recordMoreId!,
                    type: 'pdf',
                  })
                  setRecordMoreId(null)
                },
              },
              {
                label: 'Chia sẻ',
                color: '#132C95',
                icon: (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#132C95'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <circle cx='18' cy='5' r='3' />
                    <circle cx='6' cy='12' r='3' />
                    <circle cx='18' cy='19' r='3' />
                    <line x1='8.59' y1='13.51' x2='15.42' y2='17.49' />
                    <line x1='15.41' y1='6.51' x2='8.59' y2='10.49' />
                  </svg>
                ),
                onPress: () => {
                  setRecordAction({
                    id: recordMoreId!,
                    type: 'share',
                  })
                  setRecordMoreId(null)
                },
              },
              {
                label: 'Ẩn',
                color: '#6b7280',
                icon: (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#6b7280'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
                    <line x1='1' y1='1' x2='23' y2='23' />
                  </svg>
                ),
                onPress: () => {
                  setRecordAction({
                    id: recordMoreId!,
                    type: 'hide',
                  })
                  setRecordMoreId(null)
                },
              },
              {
                label: 'Xóa',
                color: '#ef4444',
                icon: (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#ef4444'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <polyline points='3 6 5 6 21 6' />
                    <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
                    <path d='M10 11v6' />
                    <path d='M14 11v6' />
                    <path d='M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' />
                  </svg>
                ),
                onPress: () => {
                  setRecordAction({
                    id: recordMoreId!,
                    type: 'delete',
                  })
                  setRecordMoreId(null)
                },
              },
            ].map(item => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                className='flex-row items-center gap-3 rounded-xl px-3 py-3'
              >
                {item.icon}
                <Span
                  className='text-sm'
                  style={{
                    color: item.color,
                  }}
                >
                  {item.label}
                </Span>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setRecordMoreId(null)}
              className='mt-2 items-center rounded-2xl border border-gray-200 py-3'
            >
              <Span className='text-sm font-medium text-gray-500'>Hủy</Span>
            </Pressable>
          </View>
        </View>
      )}

      {/* ---- History: per-record action confirm modal ---- */}
      {recordAction !== null && (
        <View className='absolute inset-0 z-50 items-center justify-center bg-black/40 px-6'>
          <View className='w-full rounded-2xl bg-white p-5 shadow-2xl'>
            <Span className='mb-1 text-center text-sm font-semibold text-gray-800'>
              {recordAction.type === 'pdf'
                ? 'Xuất PDF'
                : recordAction.type === 'share'
                  ? 'Chia sẻ'
                  : recordAction.type === 'hide'
                    ? 'Ẩn hồ sơ'
                    : 'Xóa hồ sơ'}
            </Span>
            <Span className='mb-5 text-center text-xs text-gray-500'>
              {recordAction.type === 'pdf' &&
                'Bạn có muốn xuất PDF hồ sơ này không?'}
              {recordAction.type === 'share' &&
                'Bạn có muốn chia sẻ hồ sơ này không?'}
              {recordAction.type === 'hide' &&
                'Bạn có muốn ẩn hồ sơ này không?'}
              {recordAction.type === 'delete' &&
                'Bạn có muốn xóa hồ sơ này không?'}
            </Span>
            <View className='flex-row gap-3'>
              <Pressable
                onPress={() => {
                  if (recordAction.type === 'hide') {
                    setHiddenIds(prev => {
                      const n = new Set(prev)
                      n.add(recordAction.id)
                      return n
                    })
                  }
                  if (recordAction.type === 'delete') {
                    setDeletedIds(prev => {
                      const n = new Set(prev)
                      n.add(recordAction.id)
                      return n
                    })
                  }
                  setRecordAction(null)
                }}
                className='flex-1 items-center rounded-xl py-3'
                style={{
                  backgroundColor:
                    recordAction.type === 'delete' ? '#ef4444' : PRIMARY,
                }}
              >
                <Span className='text-sm font-semibold text-white'>Đồng ý</Span>
              </Pressable>
              <Pressable
                onPress={() => setRecordAction(null)}
                className='flex-1 items-center rounded-xl border border-gray-200 bg-white py-3'
              >
                <Span className='text-sm text-gray-600'>Hủy bỏ</Span>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ---- History: restore confirm modal ---- */}
      {restoreId !== null && (
        <View className='absolute inset-0 z-50 items-center justify-center bg-black/40 px-6'>
          <View className='w-full rounded-2xl bg-white p-5 shadow-2xl'>
            <Span className='mb-1 text-center text-sm font-semibold text-gray-800'>
              Khôi phục hồ sơ
            </Span>
            <Span className='mb-5 text-center text-xs text-gray-500'>
              Bạn có muốn khôi phục hồ sơ sức khỏe này không?
            </Span>
            <View className='flex-row gap-3'>
              <Pressable
                onPress={() => {
                  setHiddenIds(prev => {
                    const n = new Set(prev)
                    n.delete(restoreId!)
                    return n
                  })
                  setDeletedIds(prev => {
                    const n = new Set(prev)
                    n.delete(restoreId!)
                    return n
                  })
                  setRestoreId(null)
                }}
                className='flex-1 items-center rounded-xl py-3'
                style={{
                  backgroundColor: PRIMARY,
                }}
              >
                <Span className='text-sm font-semibold text-white'>
                  Khôi phục
                </Span>
              </Pressable>
              <Pressable
                onPress={() => setRestoreId(null)}
                className='flex-1 items-center rounded-xl border border-gray-200 bg-white py-3'
              >
                <Span className='text-sm text-gray-600'>Hủy bỏ</Span>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ---- History: filter modal ---- */}
      {showFilter && (
        <View className='absolute inset-0 z-50 justify-end bg-black/40'>
          <View
            className='rounded-t-3xl bg-white'
            style={{
              maxHeight: '88%',
            }}
          >
            <ScrollView>
              <View className='p-4'>
                <View className='mb-4 flex-row items-center justify-between'>
                  <Span className='text-sm font-semibold text-gray-800'>
                    Bộ lọc
                  </Span>
                  <Pressable
                    onPress={() => setShowFilter(false)}
                    className='h-7 w-7 items-center justify-center rounded-full bg-gray-100'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#6b7280'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                    >
                      <line x1='18' y1='6' x2='6' y2='18' />
                      <line x1='6' y1='6' x2='18' y2='18' />
                    </svg>
                  </Pressable>
                </View>
                {/* Ten benh */}
                <Span className='mb-2 text-[10px] font-semibold text-gray-400'>
                  TÊN BỆNH
                </Span>
                {[...new Set(historyRecords.map(r => r.disease))].map(d => (
                  <Pressable
                    key={d}
                    onPress={() =>
                      setFilterDiseases(prev => {
                        const n = new Set(prev)
                        n.has(d) ? n.delete(d) : n.add(d)
                        return n
                      })
                    }
                    className='mb-2 flex-row items-center gap-2'
                  >
                    <View
                      className='h-4 w-4 items-center justify-center rounded-sm border'
                      style={{
                        borderColor: filterDiseases.has(d)
                          ? PRIMARY
                          : '#d1d5db',
                        backgroundColor: filterDiseases.has(d)
                          ? PRIMARY
                          : '#fff',
                      }}
                    >
                      {filterDiseases.has(d) && (
                        <svg
                          width='10'
                          height='10'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#fff'
                          strokeWidth='3'
                          strokeLinecap='round'
                        >
                          <polyline points='20 6 9 17 4 12' />
                        </svg>
                      )}
                    </View>
                    <Span className='text-xs text-gray-700'>{d}</Span>
                  </Pressable>
                ))}
                {/* Bac si */}
                <Span className='mt-3 mb-2 text-[10px] font-semibold text-gray-400'>
                  BÁC SĨ
                </Span>
                {[...new Set(historyRecords.map(r => r.doctor))].map(doc => (
                  <Pressable
                    key={doc}
                    onPress={() =>
                      setFilterDoctors(prev => {
                        const n = new Set(prev)
                        n.has(doc) ? n.delete(doc) : n.add(doc)
                        return n
                      })
                    }
                    className='mb-2 flex-row items-center gap-2'
                  >
                    <View
                      className='h-4 w-4 items-center justify-center rounded-sm border'
                      style={{
                        borderColor: filterDoctors.has(doc)
                          ? PRIMARY
                          : '#d1d5db',
                        backgroundColor: filterDoctors.has(doc)
                          ? PRIMARY
                          : '#fff',
                      }}
                    >
                      {filterDoctors.has(doc) && (
                        <svg
                          width='10'
                          height='10'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#fff'
                          strokeWidth='3'
                          strokeLinecap='round'
                        >
                          <polyline points='20 6 9 17 4 12' />
                        </svg>
                      )}
                    </View>
                    <Span className='text-xs text-gray-700'>{doc}</Span>
                  </Pressable>
                ))}
                {/* Noi kham */}
                <Span className='mt-3 mb-2 text-[10px] font-semibold text-gray-400'>
                  NƠI KHÁM
                </Span>
                {[...new Set(historyRecords.map(r => r.place))].map(p => (
                  <Pressable
                    key={p}
                    onPress={() =>
                      setFilterPlaces(prev => {
                        const n = new Set(prev)
                        n.has(p) ? n.delete(p) : n.add(p)
                        return n
                      })
                    }
                    className='mb-2 flex-row items-center gap-2'
                  >
                    <View
                      className='h-4 w-4 items-center justify-center rounded-sm border'
                      style={{
                        borderColor: filterPlaces.has(p) ? PRIMARY : '#d1d5db',
                        backgroundColor: filterPlaces.has(p) ? PRIMARY : '#fff',
                      }}
                    >
                      {filterPlaces.has(p) && (
                        <svg
                          width='10'
                          height='10'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#fff'
                          strokeWidth='3'
                          strokeLinecap='round'
                        >
                          <polyline points='20 6 9 17 4 12' />
                        </svg>
                      )}
                    </View>
                    <Span className='text-xs text-gray-700'>{p}</Span>
                  </Pressable>
                ))}
                {/* Thoi gian */}
                <Span className='mt-3 mb-2 text-[10px] font-semibold text-gray-400'>
                  THỜI GIAN
                </Span>
                <View className='mb-1 flex-row items-center justify-between'>
                  <Span className='text-[11px] text-gray-500'>Từ năm</Span>
                  <View className='rounded-lg bg-slate-100 px-2.5 py-1'>
                    <Span
                      className='text-xs font-semibold'
                      style={{
                        color: PRIMARY,
                      }}
                    >
                      {filterYearStart}
                    </Span>
                  </View>
                </View>
                <View className='mb-1'>
                  <input
                    type='range'
                    min={FILTER_MIN_YEAR}
                    max={FILTER_MAX_YEAR}
                    step={1}
                    value={filterYearStart}
                    onChange={(e: any) =>
                      setFilterYearStart(Number(e.target.value))
                    }
                    style={
                      {
                        accentColor: PRIMARY,
                        width: '100%',
                      } as any
                    }
                  />
                </View>
                <View className='mb-4 flex-row items-center justify-between'>
                  <Span className='text-[10px] text-gray-400'>
                    {FILTER_MIN_YEAR}
                  </Span>
                  <Span className='text-[10px] text-gray-400'>
                    {FILTER_MAX_YEAR}
                  </Span>
                </View>
                <View className='flex-row gap-3'>
                  <Pressable
                    onPress={() => {
                      setFilterDiseases(new Set())
                      setFilterDoctors(new Set())
                      setFilterPlaces(new Set())
                      setFilterYearStart(FILTER_MIN_YEAR)
                    }}
                    className='flex-1 items-center rounded-xl border border-gray-200 py-3'
                  >
                    <Span className='text-sm text-gray-600'>Xóa kết quả</Span>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowFilter(false)}
                    className='flex-1 items-center rounded-xl py-3'
                    style={{
                      backgroundColor: PRIMARY,
                    }}
                  >
                    <Span className='text-sm font-semibold text-white'>
                      Xem kết quả{filterCount > 0 ? ` (${filterCount})` : ''}
                    </Span>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* ---- History: follow confirm modal ---- */}
      {followConfirmId !== null && (
        <View className='absolute inset-0 z-50 items-center justify-center bg-black/40 px-6'>
          <View className='w-full rounded-2xl bg-white p-5 shadow-2xl'>
            <Span className='mb-1 text-center text-sm font-semibold text-gray-800'>
              Theo dõi hồ sơ
            </Span>
            <Span className='mb-5 text-center text-xs text-gray-500'>
              Bạn có muốn theo dõi hồ sơ sức khỏe này không?
            </Span>
            <View className='flex-row gap-3'>
              <Pressable
                onPress={() => {
                  setHistoryFollowSet(prev => {
                    const next = new Set(prev)
                    next.add(followConfirmId!)
                    return next
                  })
                  setFollowConfirmId(null)
                }}
                className='flex-1 items-center rounded-xl py-3'
                style={{
                  backgroundColor: PRIMARY,
                }}
              >
                <Span className='text-sm font-semibold text-white'>Đồng ý</Span>
              </Pressable>
              <Pressable
                onPress={() => setFollowConfirmId(null)}
                className='flex-1 items-center rounded-xl border border-gray-200 bg-white py-3'
              >
                <Span className='text-sm text-gray-600'>Không</Span>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ---- History: unfollow confirm modal ---- */}
      {unfollowHistoryId !== null && (
        <View className='absolute inset-0 z-50 items-center justify-center bg-black/40 px-6'>
          <View className='w-full rounded-2xl bg-white p-5 shadow-2xl'>
            <Span className='mb-1 text-center text-sm font-semibold text-gray-800'>
              Bỏ theo dõi
            </Span>
            <Span className='mb-5 text-center text-xs text-gray-500'>
              Bạn có chắc bỏ theo dõi hồ sơ sức khỏe này không? Nếu đồng ý, hồ
              sơ này sẽ không còn được theo dõi bên tính năng Theo dõi sức khỏe
              nữa.
            </Span>
            <View className='flex-row gap-3'>
              <Pressable
                onPress={() => {
                  setHistoryFollowSet(prev => {
                    const next = new Set(prev)
                    next.delete(unfollowHistoryId!)
                    return next
                  })
                  setUnfollowHistoryId(null)
                }}
                className='flex-1 items-center rounded-xl border border-gray-200 bg-white py-3'
              >
                <Span className='text-sm text-gray-600'>Đồng ý</Span>
              </Pressable>
              <Pressable
                onPress={() => setUnfollowHistoryId(null)}
                className='flex-1 items-center rounded-xl py-3'
                style={{
                  backgroundColor: PRIMARY,
                }}
              >
                <Span className='text-sm font-semibold text-white'>Hủy bỏ</Span>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ---- Delete confirmation modal ---- */}
      {deleteIndex !== null && (
        <View className='absolute inset-0 z-50 items-center justify-center bg-black/40 px-6'>
          <View className='w-full rounded-2xl bg-white p-5 shadow-2xl'>
            <Span className='mb-1 text-center text-sm font-semibold text-gray-800'>
              Xóa nhắc nhở
            </Span>
            <Span className='mb-5 text-center text-xs text-gray-500'>
              Bạn có chắc chắn muốn xóa nhắc nhở này không?
            </Span>
            <View className='flex-row gap-3'>
              <Pressable
                onPress={() => setDeleteIndex(null)}
                className='flex-1 items-center rounded-xl bg-orange-500 py-3'
              >
                <Span className='text-sm font-semibold text-white'>Không</Span>
              </Pressable>
              <Pressable
                onPress={() => setDeleteIndex(null)}
                className='flex-1 items-center rounded-xl border border-blue-600 bg-white py-3'
              >
                <Span className='text-sm font-semibold text-blue-600'>
                  Xác nhận
                </Span>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ---- Calendar modal ---- */}
      {showCalendar && (
        <View className='absolute inset-0 z-50 items-center justify-end bg-black/40'>
          <View className='w-full rounded-t-3xl bg-white p-4'>
            <View className='mb-3 flex-row items-center justify-between'>
              <Pressable
                onPress={() => {
                  if (calMonth === 0) {
                    setCalMonth(11)
                    setCalYear(y => y - 1)
                  } else {
                    setCalMonth(m => m - 1)
                  }
                }}
              >
                <Span
                  className='px-2 text-lg font-bold'
                  style={{
                    color: PRIMARY,
                  }}
                >
                  {'<'}
                </Span>
              </Pressable>
              <Span className='text-sm font-semibold text-gray-800'>
                {MONTHS[calMonth]} {calYear}
              </Span>
              <Pressable
                onPress={() => {
                  if (calMonth === 11) {
                    setCalMonth(0)
                    setCalYear(y => y + 1)
                  } else {
                    setCalMonth(m => m + 1)
                  }
                }}
              >
                <Span
                  className='px-2 text-lg font-bold'
                  style={{
                    color: PRIMARY,
                  }}
                >
                  {'>'}
                </Span>
              </Pressable>
            </View>
            <View className='mb-1 flex-row'>
              {DAYS_IN_WEEK.map(d => (
                <View key={d} className='flex-1 items-center'>
                  <Span className='text-[10px] font-semibold text-gray-400'>
                    {d}
                  </Span>
                </View>
              ))}
            </View>
            <View className='flex-row flex-wrap'>
              {calCells.map((day, idx) => (
                <View
                  key={idx}
                  className='items-center justify-center'
                  style={{
                    width: '14.28%',
                    paddingVertical: 4,
                  }}
                >
                  {day ? (
                    <Pressable
                      onPress={() => toggleCalDay(calYear, calMonth, day)}
                      className='h-7 w-7 items-center justify-center rounded-full'
                      style={
                        isCalSelected(calYear, calMonth, day)
                          ? {
                              backgroundColor: PRIMARY,
                            }
                          : {}
                      }
                    >
                      <Span
                        className='text-[11px]'
                        style={{
                          color: isCalSelected(calYear, calMonth, day)
                            ? '#fff'
                            : '#1a1a2e',
                          fontWeight: isCalSelected(calYear, calMonth, day)
                            ? '600'
                            : '400',
                        }}
                      >
                        {day}
                      </Span>
                    </Pressable>
                  ) : (
                    <View className='h-7 w-7' />
                  )}
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => setShowCalendar(false)}
              className='mt-3 items-center rounded-xl py-3'
              style={{
                backgroundColor: PRIMARY,
              }}
            >
              <Span className='text-sm font-semibold text-white'>Xác nhận</Span>
            </Pressable>
          </View>
        </View>
      )}

      {/* ---- Reminder modal ---- */}
      {showReminder && (
        <View className='absolute inset-0 z-50 items-center justify-end bg-black/40'>
          <View className='w-full rounded-t-3xl bg-white p-4'>
            <View className='mb-4 flex-row items-center justify-between'>
              <Pressable onPress={() => setShowReminder(false)}>
                <Span className='text-sm text-gray-500'>Hủy</Span>
              </Pressable>
              <Span className='text-sm font-semibold text-gray-800'>
                Nhắc uống thuốc
              </Span>
              <Pressable
                onPress={() => {
                  setEditForm(f => ({
                    ...f,
                    reminder: `${String(remHour).padStart(2, '0')}:${String(remMin).padStart(2, '0')} - ${remRepeat}`,
                  }))
                  setShowReminder(false)
                }}
              >
                <Span
                  className='text-sm font-semibold'
                  style={{
                    color: PRIMARY,
                  }}
                >
                  Xong
                </Span>
              </Pressable>
            </View>

            {/* Time picker */}
            <View className='mb-4 flex-row items-center justify-center gap-2'>
              <View className='items-center'>
                <Pressable
                  onPress={() => setRemHour(h => (h + 1) % 24)}
                  className='py-1'
                >
                  <Span className='text-lg text-gray-400'>^</Span>
                </Pressable>
                <View className='h-12 w-14 items-center justify-center rounded-xl bg-slate-100'>
                  <Span className='text-2xl font-bold text-gray-900'>
                    {String(remHour).padStart(2, '0')}
                  </Span>
                </View>
                <Pressable
                  onPress={() => setRemHour(h => (h - 1 + 24) % 24)}
                  className='py-1'
                >
                  <Span
                    className='text-lg text-gray-400'
                    style={{
                      transform: [
                        {
                          rotate: '180deg',
                        },
                      ],
                    }}
                  >
                    ^
                  </Span>
                </Pressable>
              </View>
              <Span className='text-2xl font-bold text-gray-400'>:</Span>
              <View className='items-center'>
                <Pressable
                  onPress={() => setRemMin(m => (m + 1) % 60)}
                  className='py-1'
                >
                  <Span className='text-lg text-gray-400'>^</Span>
                </Pressable>
                <View className='h-12 w-14 items-center justify-center rounded-xl bg-slate-100'>
                  <Span className='text-2xl font-bold text-gray-900'>
                    {String(remMin).padStart(2, '0')}
                  </Span>
                </View>
                <Pressable
                  onPress={() => setRemMin(m => (m - 1 + 60) % 60)}
                  className='py-1'
                >
                  <Span
                    className='text-lg text-gray-400'
                    style={{
                      transform: [
                        {
                          rotate: '180deg',
                        },
                      ],
                    }}
                  >
                    ^
                  </Span>
                </Pressable>
              </View>
            </View>

            {/* Repeat options */}
            <Span className='mb-1.5 text-[10px] font-semibold text-gray-400'>
              LẶP LẠI
            </Span>
            <View className='overflow-hidden rounded-2xl bg-slate-50'>
              {REPEAT_OPTIONS.map((opt, i) => (
                <Pressable
                  key={opt}
                  onPress={() => setRemRepeat(opt)}
                  className={[
                    'flex-row items-center justify-between px-4 py-2.5',
                    i < REPEAT_OPTIONS.length - 1
                      ? 'border-b border-gray-100'
                      : '',
                  ]}
                >
                  <Span className='text-xs text-gray-800'>{opt}</Span>
                  {remRepeat === opt && (
                    <View
                      className='h-4 w-4 items-center justify-center rounded-full'
                      style={{
                        backgroundColor: PRIMARY,
                      }}
                    >
                      <Span className='text-[9px] font-bold text-white'>✓</Span>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* ---- Edit history record modal ---- */}
      {editingRecordId !== null &&
        (() => {
          const rec = historyRecords.find(r => r.id === editingRecordId)
          if (!rec) {
            return null
          }
          return (
            <View className='absolute inset-0 z-50 bg-black/40'>
              <View
                className='absolute inset-x-0 bottom-0 rounded-t-3xl bg-white'
                style={{
                  maxHeight: '90%',
                }}
              >
                <ScrollView>
                  <View className='p-4'>
                    <View className='mb-4 flex-row items-center justify-between'>
                      <Span className='text-sm font-semibold text-gray-800'>
                        Chỉnh sửa hồ sơ
                      </Span>
                      <Pressable
                        onPress={() => setEditingRecordId(null)}
                        className='h-7 w-7 items-center justify-center rounded-full bg-gray-100'
                      >
                        <svg
                          width='12'
                          height='12'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#6b7280'
                          strokeWidth='2.5'
                          strokeLinecap='round'
                        >
                          <line x1='18' y1='6' x2='6' y2='18' />
                          <line x1='6' y1='6' x2='18' y2='18' />
                        </svg>
                      </Pressable>
                    </View>

                    {/* Info fields */}
                    {(['disease', 'date', 'place', 'doctor'] as const).map(
                      key => {
                        const labels = {
                          disease: 'TÊN BỆNH',
                          date: 'NGÀY KHÁM',
                          place: 'NƠI KHÁM',
                          doctor: 'BÁC SĨ',
                        }
                        return (
                          <View key={key} className='mb-3'>
                            <Span className='mb-1 text-[10px] font-medium text-gray-400'>
                              {labels[key]}
                            </Span>
                            <input
                              type='text'
                              value={editFormValues[key]}
                              onChange={(e: any) =>
                                setEditFormValues(prev => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              style={
                                {
                                  width: '100%',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: 12,
                                  padding: '8px 12px',
                                  fontSize: 12,
                                  color: '#374151',
                                  backgroundColor: '#f8fafc',
                                  outline: 'none',
                                  boxSizing: 'border-box',
                                } as any
                              }
                            />
                          </View>
                        )
                      },
                    )}

                    {/* Medicine field + add more */}
                    <View className='mb-3'>
                      <Span className='mb-1 text-[10px] font-medium text-gray-400'>
                        THUỐC
                      </Span>
                      <input
                        type='text'
                        value={editFormValues.medicine}
                        onChange={(e: any) =>
                          setEditFormValues(prev => ({
                            ...prev,
                            medicine: e.target.value,
                          }))
                        }
                        style={
                          {
                            width: '100%',
                            border: '1px solid #e5e7eb',
                            borderRadius: 12,
                            padding: '8px 12px',
                            fontSize: 12,
                            color: '#374151',
                            backgroundColor: '#f8fafc',
                            outline: 'none',
                            boxSizing: 'border-box',
                          } as any
                        }
                      />
                      <Pressable className='mt-1.5 flex-row items-center gap-1 self-start rounded-full bg-blue-50 px-2.5 py-1'>
                        <svg
                          width='10'
                          height='10'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#132C95'
                          strokeWidth='2.5'
                          strokeLinecap='round'
                        >
                          <line x1='12' y1='5' x2='12' y2='19' />
                          <line x1='5' y1='12' x2='19' y2='12' />
                        </svg>
                        <Span
                          className='text-[10px] font-medium'
                          style={{
                            color: PRIMARY,
                          }}
                        >
                          Thêm thuốc
                        </Span>
                      </Pressable>
                    </View>

                    {/* Prescription images */}
                    <View className='mb-3'>
                      <Span className='mb-2 text-[10px] font-medium text-gray-400'>
                        ĐƠN THUỐC (HÌNH ẢNH)
                      </Span>
                      <View className='flex-row flex-wrap gap-2'>
                        {(mockExtras[rec.id]?.images ?? [])
                          .filter(img => !editRemovedImages.has(img.id))
                          .map(img => (
                            <View
                              key={img.id}
                              className='relative items-center justify-center rounded-xl'
                              style={{
                                width: '47%',
                                height: 82,
                                backgroundColor:
                                  img.type === 'xray'
                                    ? '#1e293b'
                                    : img.type === 'ultrasound'
                                      ? '#1e3a5f'
                                      : '#374151',
                              }}
                            >
                              <svg
                                width='18'
                                height='18'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='rgba(255,255,255,0.5)'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              >
                                <rect
                                  x='3'
                                  y='3'
                                  width='18'
                                  height='18'
                                  rx='2'
                                />
                                <circle cx='8.5' cy='8.5' r='1.5' />
                                <polyline points='21 15 16 10 5 21' />
                              </svg>
                              <Span className='mt-1 text-[9px] text-white/70'>
                                {img.label}
                              </Span>
                              <Pressable
                                onPress={() =>
                                  setEditRemovedImages(prev => {
                                    const n = new Set(prev)
                                    n.add(img.id)
                                    return n
                                  })
                                }
                                className='absolute top-1.5 right-1.5 h-5 w-5 items-center justify-center rounded-full'
                                style={{
                                  backgroundColor: 'rgba(0,0,0,0.55)',
                                }}
                              >
                                <svg
                                  width='8'
                                  height='8'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='#fff'
                                  strokeWidth='3'
                                  strokeLinecap='round'
                                >
                                  <line x1='18' y1='6' x2='6' y2='18' />
                                  <line x1='6' y1='6' x2='18' y2='18' />
                                </svg>
                              </Pressable>
                            </View>
                          ))}
                        {/* Add image tile */}
                        <Pressable
                          className='items-center justify-center rounded-xl border-2 border-dashed border-orange-200 bg-orange-50'
                          style={{
                            width: '47%',
                            height: 82,
                          }}
                        >
                          <svg
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='#ea580c'
                            strokeWidth='2'
                            strokeLinecap='round'
                          >
                            <line x1='12' y1='5' x2='12' y2='19' />
                            <line x1='5' y1='12' x2='19' y2='12' />
                          </svg>
                          <Span className='mt-1 text-[9px] text-orange-500'>
                            Thêm ảnh
                          </Span>
                        </Pressable>
                      </View>
                    </View>

                    {/* Chú ý */}
                    <View className='mb-5'>
                      <Span className='mb-1 text-[10px] font-medium text-gray-400'>
                        CHÚ Ý
                      </Span>
                      <textarea
                        value={editFormValues.note}
                        onChange={(e: any) =>
                          setEditFormValues(prev => ({
                            ...prev,
                            note: e.target.value,
                          }))
                        }
                        placeholder='Ghi chú thêm...'
                        style={
                          {
                            width: '100%',
                            border: '1px solid #e5e7eb',
                            borderRadius: 12,
                            padding: '8px 12px',
                            fontSize: 12,
                            color: '#374151',
                            backgroundColor: '#f8fafc',
                            outline: 'none',
                            boxSizing: 'border-box',
                            minHeight: 72,
                            resize: 'none',
                            fontFamily: 'inherit',
                          } as any
                        }
                      />
                    </View>

                    <View className='flex-row gap-3'>
                      <Pressable
                        onPress={() => setEditingRecordId(null)}
                        className='flex-1 items-center rounded-xl border border-gray-200 bg-white py-3'
                      >
                        <Span className='text-sm text-gray-600'>Hủy bỏ</Span>
                      </Pressable>
                      <Pressable
                        onPress={() => setEditingRecordId(null)}
                        className='flex-1 items-center rounded-xl py-3'
                        style={{
                          backgroundColor: PRIMARY,
                        }}
                      >
                        <Span className='text-sm font-semibold text-white'>
                          Lưu
                        </Span>
                      </Pressable>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          )
        })()}

      {/* ---- Prescription image view ---- */}
      {prescriptionView && (
        <View className='absolute inset-0 z-[60] items-center justify-center bg-black/70 px-5'>
          <View className='w-full overflow-hidden rounded-2xl shadow-2xl'>
            {/* Letterhead */}
            <View
              className='items-center px-4 py-3'
              style={{
                backgroundColor: PRIMARY,
              }}
            >
              <View
                className='mb-1 h-7 w-7 items-center justify-center rounded-lg'
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <Span className='text-xs font-bold text-white'>YH</Span>
              </View>
              <Span className='text-[9px] font-medium text-white/70'>
                YourHealth
              </Span>
              <Span className='mt-0.5 text-xs font-bold text-white'>
                {prescriptionView.place}
              </Span>
            </View>

            {/* Document body */}
            <View className='bg-white px-4 py-4'>
              <Span className='mb-3 text-center text-sm font-bold tracking-wide text-gray-800'>
                DON THUOC
              </Span>

              <View className='mb-3 rounded-xl bg-slate-50 p-3'>
                <View className='mb-1.5 flex-row gap-2'>
                  <Span className='w-16 text-[10px] font-semibold text-gray-400'>
                    Ngay ke:
                  </Span>
                  <Span className='text-[10px] text-gray-700'>
                    {prescriptionView.date}
                  </Span>
                </View>
                <View className='mb-1.5 flex-row gap-2'>
                  <Span className='w-16 text-[10px] font-semibold text-gray-400'>
                    Chan doan:
                  </Span>
                  <Span className='flex-1 text-[10px] text-gray-700'>
                    {prescriptionView.disease}
                  </Span>
                </View>
                {prescriptionView.doctor && (
                  <View className='flex-row gap-2'>
                    <Span className='w-16 text-[10px] font-semibold text-gray-400'>
                      Bac si:
                    </Span>
                    <Span className='text-[10px] text-gray-700'>
                      {prescriptionView.doctor}
                    </Span>
                  </View>
                )}
              </View>

              <Span className='mb-2 text-[10px] font-bold text-gray-700'>
                THUOC KE DON
              </Span>
              <View className='mb-4 flex-row items-start gap-2 rounded-xl bg-orange-50 p-3'>
                <View className='mt-0.5 h-4 w-4 items-center justify-center rounded-full bg-orange-500'>
                  <Span className='text-[8px] font-bold text-white'>1</Span>
                </View>
                <View className='flex-1'>
                  <Span className='text-[11px] font-semibold text-orange-800'>
                    {prescriptionView.medicine}
                  </Span>
                  <Span className='mt-0.5 text-[9px] text-orange-500'>
                    Uong theo chi dinh cua bac si
                  </Span>
                </View>
              </View>

              <View className='items-end'>
                <Span className='text-[9px] text-gray-400 italic'>
                  Chu ky va dong dau
                </Span>
                <View className='mt-4 mb-0.5 w-28 border-b border-dashed border-gray-300' />
                <Span className='text-[9px] text-gray-500'>
                  {prescriptionView.doctor ?? 'Bac si dieu tri'}
                </Span>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => setPrescriptionView(null)}
            className='mt-5 h-10 w-10 items-center justify-center rounded-full'
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#fff'
              strokeWidth='2.5'
              strokeLinecap='round'
            >
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </Pressable>
        </View>
      )}

      {/* ---- Record detail page ---- */}
      {detailRecord !== null && (
        <View className='absolute inset-0 z-50 flex-col bg-slate-50'>
          {/* Page header */}
          <View className='flex-row items-center border-b border-gray-100 bg-white px-4 py-3'>
            <Pressable
              onPress={() => setDetailRecord(null)}
              className='mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-100'
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#374151'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <polyline points='15 18 9 12 15 6' />
              </svg>
            </Pressable>
            <Span className='flex-1 text-sm font-semibold text-gray-800'>
              Chi tiết hồ sơ
            </Span>
          </View>

          <ScrollView className='flex-1 px-4 py-4'>
            {/* Info card */}
            <View className='mb-3 rounded-2xl bg-white p-4 shadow-sm'>
              <Span className='mb-1 text-base font-bold text-gray-900'>
                {detailRecord.disease}
              </Span>
              <View className='mb-3 flex-row items-center gap-1.5'>
                <svg
                  width='11'
                  height='11'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#9ca3af'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <rect x='3' y='4' width='18' height='18' rx='2' />
                  <line x1='16' y1='2' x2='16' y2='6' />
                  <line x1='8' y1='2' x2='8' y2='6' />
                  <line x1='3' y1='10' x2='21' y2='10' />
                </svg>
                <Span className='text-[11px] text-gray-400'>
                  {detailRecord.date}
                </Span>
                <Span className='text-[11px] text-gray-300'>|</Span>
                <svg
                  width='11'
                  height='11'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#9ca3af'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z' />
                  <circle cx='12' cy='10' r='3' />
                </svg>
                <Span className='text-[11px] text-gray-400'>
                  {detailRecord.place}
                </Span>
              </View>
              {detailRecord.doctor && (
                <View className='flex-row items-center gap-1.5'>
                  <svg
                    width='11'
                    height='11'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#9ca3af'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                    <circle cx='12' cy='7' r='4' />
                  </svg>
                  <Span className='text-[11px] text-gray-400'>
                    {detailRecord.doctor}
                  </Span>
                </View>
              )}
            </View>

            {/* Prescription card */}
            <View className='mb-3 rounded-2xl bg-orange-50 p-4'>
              <View className='mb-2 flex-row items-center gap-2'>
                <svg
                  width='15'
                  height='15'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#ea580c'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                  <polyline points='14 2 14 8 20 8' />
                  <line x1='16' y1='13' x2='8' y2='13' />
                  <line x1='16' y1='17' x2='8' y2='17' />
                </svg>
                <Span className='text-xs font-semibold text-orange-700'>
                  Đơn thuốc
                </Span>
              </View>
              <Span className='text-sm font-medium text-orange-800'>
                {detailRecord.medicine}
              </Span>
            </View>

            {/* Images & Documents */}
            <View className='mb-3 rounded-2xl bg-white p-4 shadow-sm'>
              <View className='mb-3 flex-row items-center justify-between'>
                <Span className='text-xs font-semibold text-gray-700'>
                  Hình ảnh & Tài liệu
                </Span>
                <Pressable className='flex-row items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5'>
                  <Span
                    className='text-[10px] font-medium'
                    style={{
                      color: PRIMARY,
                    }}
                  >
                    + Thêm
                  </Span>
                </Pressable>
              </View>
              {detailRecord.images && detailRecord.images.length > 0 ? (
                <View className='flex-row flex-wrap gap-2'>
                  {detailRecord.images.map(img => (
                    <View
                      key={img.id}
                      className='items-center justify-center rounded-xl'
                      style={{
                        width: '47%',
                        height: 88,
                        backgroundColor:
                          img.type === 'xray'
                            ? '#1e293b'
                            : img.type === 'ultrasound'
                              ? '#1e3a5f'
                              : '#374151',
                      }}
                    >
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='rgba(255,255,255,0.5)'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <rect x='3' y='3' width='18' height='18' rx='2' />
                        <circle cx='8.5' cy='8.5' r='1.5' />
                        <polyline points='21 15 16 10 5 21' />
                      </svg>
                      <Span className='mt-1.5 text-[9px] font-medium text-white/70'>
                        {img.label}
                      </Span>
                    </View>
                  ))}
                </View>
              ) : (
                <View className='items-center justify-center rounded-xl border border-dashed border-gray-200 py-5'>
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#d1d5db'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <rect x='3' y='3' width='18' height='18' rx='2' />
                    <circle cx='8.5' cy='8.5' r='1.5' />
                    <polyline points='21 15 16 10 5 21' />
                  </svg>
                  <Span className='mt-2 text-[10px] text-gray-300'>
                    Chưa có hình ảnh
                  </Span>
                </View>
              )}
            </View>

            {/* Links */}
            <View className='mb-4 rounded-2xl bg-white p-4 shadow-sm'>
              <View className='mb-3 flex-row items-center justify-between'>
                <Span className='text-xs font-semibold text-gray-700'>
                  Liên kết
                </Span>
                <Pressable className='flex-row items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5'>
                  <Span
                    className='text-[10px] font-medium'
                    style={{
                      color: PRIMARY,
                    }}
                  >
                    + Thêm
                  </Span>
                </Pressable>
              </View>
              {detailRecord.links && detailRecord.links.length > 0 ? (
                detailRecord.links.map(link => (
                  <Pressable
                    key={link.id}
                    className='mb-2 flex-row items-center gap-2 rounded-xl border border-gray-100 bg-slate-50 px-3 py-2.5 last:mb-0'
                  >
                    <svg
                      width='13'
                      height='13'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke={PRIMARY}
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
                      <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
                    </svg>
                    <Span className='flex-1 text-[11px] text-gray-700'>
                      {link.label}
                    </Span>
                    <svg
                      width='11'
                      height='11'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#9ca3af'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
                      <polyline points='15 3 21 3 21 9' />
                      <line x1='10' y1='14' x2='21' y2='3' />
                    </svg>
                  </Pressable>
                ))
              ) : (
                <View className='items-center justify-center rounded-xl border border-dashed border-gray-200 py-4'>
                  <Span className='text-[10px] text-gray-300'>
                    Chưa có liên kết
                  </Span>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* ---- Edit modal ---- */}
      {showEdit && (
        <View className='absolute inset-0 z-40 bg-black/40'>
          <View
            className='absolute inset-x-0 bottom-0 rounded-t-3xl bg-white'
            style={{
              maxHeight: '90%',
            }}
          >
            <ScrollView>
              <View className='p-4'>
                {/* Header */}
                <View className='mb-4 flex-row items-center justify-between'>
                  <Span className='text-sm font-semibold text-gray-800'>
                    Theo dõi sức khỏe
                  </Span>
                  <Pressable
                    onPress={() => setShowEdit(false)}
                    className='h-7 w-7 items-center justify-center rounded-full bg-red-50'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#ef4444'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                    >
                      <line x1='18' y1='6' x2='6' y2='18' />
                      <line x1='6' y1='6' x2='18' y2='18' />
                    </svg>
                  </Pressable>
                </View>

                {/* Form fields */}
                {[
                  {
                    key: 'disease',
                    label: 'Tên bệnh',
                  },
                  {
                    key: 'time',
                    label: 'Thời gian',
                  },
                  {
                    key: 'place',
                    label: 'Địa điểm',
                  },
                  {
                    key: 'note',
                    label: 'Chú ý',
                  },
                ].map(f => (
                  <View key={f.key} className='mb-3'>
                    <Span className='mb-1 text-[10px] font-medium text-gray-400'>
                      {f.label.toUpperCase()}
                    </Span>
                    <View className='rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5'>
                      <Span className='text-xs text-gray-400'>
                        Nhập {f.label.toLowerCase()}...
                      </Span>
                    </View>
                  </View>
                ))}

                {/* Thuoc field + camera */}
                <View className='mb-3'>
                  <Span className='mb-1 text-[10px] font-medium text-gray-400'>
                    THUỐC
                  </Span>
                  <View className='flex-row items-center gap-2'>
                    <View className='flex-1 rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5'>
                      <Span className='text-xs text-gray-400'>
                        Nhập tên thuốc...
                      </Span>
                    </View>
                    <Pressable className='h-10 w-10 items-center justify-center rounded-xl bg-blue-50'>
                      <svg
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke={PRIMARY}
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' />
                        <circle cx='12' cy='13' r='4' />
                      </svg>
                    </Pressable>
                  </View>
                </View>

                {/* Nhac nho field + clock */}
                <View className='mb-5'>
                  <Span className='mb-1 text-[10px] font-medium text-gray-400'>
                    NHẮC NHỞ
                  </Span>
                  <View className='flex-row items-center gap-2'>
                    <View className='flex-1 rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5'>
                      <Span className='text-xs text-gray-400'>
                        {editForm.reminder
                          ? editForm.reminder
                          : 'Chưa đặt nhắc nhở...'}
                      </Span>
                    </View>
                    <Pressable
                      onPress={() => setShowReminder(true)}
                      className='h-10 w-10 items-center justify-center rounded-xl bg-blue-50'
                    >
                      <svg
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke={PRIMARY}
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <circle cx='12' cy='12' r='10' />
                        <polyline points='12 6 12 12 16 14' />
                      </svg>
                    </Pressable>
                  </View>
                </View>

                {/* Actions */}
                <View className='flex-row gap-3'>
                  <Pressable
                    onPress={() => setShowEdit(false)}
                    className='flex-1 items-center rounded-xl border border-gray-200 bg-white py-3'
                  >
                    <Span className='text-sm text-gray-600'>Hủy bỏ</Span>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowEdit(false)}
                    className='flex-1 items-center rounded-xl py-3'
                    style={{
                      backgroundColor: PRIMARY,
                    }}
                  >
                    <Span className='text-sm font-semibold text-white'>
                      Lưu kết quả
                    </Span>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      <ScrollView className='flex-1 bg-slate-50'>
        {/* Reminder widgets — horizontal scroll */}
        <View className='mt-3'>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: 12,
              paddingRight: 12,
              gap: CARD_GAP,
            }}
            scrollEventThrottle={16}
            onScroll={e => {
              const x = e.nativeEvent.contentOffset.x
              setSlide(
                Math.min(
                  Math.max(Math.round(x / (CARD_W + CARD_GAP)), 0),
                  reminders.length - 1,
                ),
              )
            }}
            style={
              {
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              } as any
            }
          >
            {reminders.map((r, i) => {
              const daysLeft = getDaysLeft(r.date)
              return (
                <View
                  key={r.id}
                  className='relative overflow-hidden rounded-2xl bg-slate-100'
                  style={{
                    width: CARD_W,
                  }}
                >
                  <Pressable
                    onPress={() => setDeleteIndex(i)}
                    className='absolute top-2 right-2 z-10 h-5 w-5 items-center justify-center rounded-full bg-white/70'
                  >
                    <Span className='text-[10px] font-bold text-gray-400'>
                      ✕
                    </Span>
                  </Pressable>
                  <View className='p-3'>
                    <View className='flex-row items-center gap-2'>
                      <View
                        className={[
                          'h-7 w-7 flex-shrink-0 items-center justify-center rounded-full',
                          r.color,
                        ]}
                      >
                        <Span className='text-[9px] font-bold text-white'>
                          {r.type === 'medicine'
                            ? 'Rx'
                            : r.type === 'vaccine'
                              ? 'V'
                              : 'Re'}
                        </Span>
                      </View>
                      <View className='self-start rounded-full bg-white/80 px-2 py-0.5'>
                        <Span className='text-[11px] text-gray-500'>
                          {r.label}
                        </Span>
                      </View>
                    </View>
                    <View className='mt-2'>
                      <Span className='text-[10px] text-gray-400'>
                        {r.scheduleLabel}
                      </Span>
                      <Span className='text-lg font-bold text-gray-900'>
                        {formatDate(r.date)}
                      </Span>
                      {daysLeft === 0 ? (
                        <Span className='text-[11px] text-red-500 italic'>
                          Hôm nay
                        </Span>
                      ) : daysLeft > 0 && daysLeft <= 3 ? (
                        <Span className='text-[11px] text-red-500 italic'>
                          còn {daysLeft} ngày
                        </Span>
                      ) : null}
                      <Span className='mt-1 text-[11px] font-medium text-gray-700'>
                        {r.name}
                      </Span>
                    </View>
                  </View>
                </View>
              )
            })}
          </ScrollView>
          <View className='mt-2 flex-row items-center justify-center gap-1.5'>
            {reminders.map((_, i) =>
              i === slide ? (
                <View
                  key={i}
                  className='rounded-full bg-blue-700'
                  style={{
                    width: 32,
                    height: 6,
                  }}
                />
              ) : (
                <Pressable
                  key={i}
                  onPress={() => setSlide(i)}
                  className='rounded-full bg-blue-200'
                  style={{
                    width: 6,
                    height: 6,
                  }}
                />
              ),
            )}
          </View>
        </View>

        {/* Tab buttons */}
        <View
          className='mt-8 flex-row gap-4'
          style={{
            marginHorizontal: 17,
          }}
        >
          <Pressable
            onPress={() => setActiveSection('tracking')}
            className='flex-1 items-center justify-center'
            style={[
              {
                height: 44,
                borderRadius: 28,
              },
              activeSection === 'tracking' ? tabActive : tabInactive,
            ]}
          >
            <Span
              style={{
                color: activeSection === 'tracking' ? '#5B352B' : '#754539',
                fontSize: 13,
                fontWeight: activeSection === 'tracking' ? '500' : '400',
              }}
            >
              Theo dõi sức khỏe
            </Span>
          </Pressable>
          <Pressable
            onPress={() => setActiveSection('history')}
            className='flex-1 items-center justify-center'
            style={[
              {
                height: 44,
                borderRadius: 28,
              },
              activeSection === 'history' ? tabActive : tabInactive,
            ]}
          >
            <Span
              style={{
                color: activeSection === 'history' ? '#5B352B' : '#754539',
                fontSize: 13,
                fontWeight: activeSection === 'history' ? '500' : '400',
              }}
            >
              Lịch sử khám bệnh
            </Span>
          </Pressable>
        </View>

        {/* Search bar + calendar */}
        <View
          className='mt-6 flex-row items-center gap-2'
          style={{
            marginHorizontal: 32,
          }}
        >
          <View
            className='flex-1 flex-row items-center justify-between rounded-full border px-3'
            style={{
              height: 32,
              borderColor: '#CAE3FF',
              backgroundColor: '#fff',
            }}
          >
            <Span className='text-[11px] text-gray-400'>Tìm kiếm...</Span>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke={PRIMARY}
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='11' cy='11' r='8' />
              <line x1='21' y1='21' x2='16.65' y2='16.65' />
            </svg>
          </View>
          <Pressable
            onPress={() => setShowCalendar(true)}
            className='h-9 w-9 items-center justify-center rounded-full bg-white'
            style={{
              borderWidth: 1,
              borderColor: '#CAE3FF',
            }}
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke={PRIMARY}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <rect x='3' y='4' width='18' height='18' rx='2' />
              <line x1='16' y1='2' x2='16' y2='6' />
              <line x1='8' y1='2' x2='8' y2='6' />
              <line x1='3' y1='10' x2='21' y2='10' />
            </svg>
          </Pressable>
        </View>

        {/* Theo doi suc khoe */}
        {activeSection === 'tracking' && (
          <View
            className='mb-3'
            style={{
              marginHorizontal: 20,
              marginTop: 20,
            }}
          >
            {/* Section header */}
            <View className='mb-4 flex-row items-center'>
              <Span className='text-sm font-semibold text-gray-800'>
                Theo dõi sức khỏe
              </Span>
            </View>

            {/* Records with date headers */}
            {allTracking.map((rec, i) => (
              <View key={rec.id}>
                {/* Date header — always show (records sorted, each has its own date) */}
                <View className='mb-1.5 flex-row items-center gap-2'>
                  <View className='h-1.5 w-1.5 rounded-full bg-blue-600' />
                  <Span className='text-[10px] font-semibold text-blue-600'>
                    {rec.date}
                  </Span>
                  <View className='flex-1 border-t border-blue-100' />
                </View>
                <View className='mb-4 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm'>
                  <View className='mb-1 flex-row items-center justify-between'>
                    <Span className='text-xs font-semibold text-gray-800'>
                      {rec.disease}
                    </Span>
                    <Pressable
                      onPress={() => setUnfollowId(rec.id)}
                      className='rounded-full px-2 py-0.5'
                      style={{
                        backgroundColor: '#fee2e2',
                      }}
                    >
                      <Span
                        className='text-[9px] font-medium'
                        style={{
                          color: '#dc2626',
                        }}
                      >
                        Bỏ theo dõi
                      </Span>
                    </Pressable>
                  </View>
                  <Span className='text-[10px] text-gray-500'>{rec.place}</Span>
                  <Pressable
                    onPress={() =>
                      setPrescriptionView({
                        disease: rec.disease,
                        date: rec.date,
                        place: rec.place,
                        doctor: (rec as any).doctor,
                        medicine: rec.medicine,
                      })
                    }
                    className='mt-2 flex-row items-center gap-1 self-start rounded-lg bg-orange-50 px-2 py-1'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#ea580c'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                      <polyline points='14 2 14 8 20 8' />
                      <line x1='16' y1='13' x2='8' y2='13' />
                      <line x1='16' y1='17' x2='8' y2='17' />
                    </svg>
                    <Span className='text-[10px] font-medium text-orange-600'>
                      Đơn thuốc
                    </Span>
                  </Pressable>
                  {/* divider */}
                  <View
                    className='mt-3'
                    style={{
                      borderTopWidth: 1,
                      borderColor: '#CECECE',
                    }}
                  />
                  <Pressable
                    onPress={() => {
                      const rawId = rec.id.replace('copy_', '')
                      const extras = mockExtras[rawId] ?? {
                        images: [],
                        links: [],
                      }
                      setDetailRecord({
                        id: rec.id,
                        date: rec.date,
                        disease: rec.disease,
                        place: rec.place,
                        medicine: rec.medicine,
                        doctor: (rec as any).doctor,
                        ...extras,
                      })
                    }}
                    className='mt-2 flex-row items-center justify-center gap-1'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#3b82f6'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <polyline points='6 9 12 15 18 9' />
                    </svg>
                    <Span className='text-[10px] font-medium text-blue-500'>
                      Xem chi tiết
                    </Span>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Lich su kham benh */}
        {activeSection === 'history' && (
          <View
            className='mb-4'
            style={{
              marginHorizontal: 20,
              marginTop: 20,
            }}
          >
            {/* Section header */}
            <View className='mb-2 flex-row items-center justify-between'>
              <View className='flex-row items-center gap-1.5'>
                <Span className='text-sm font-semibold text-gray-800'>
                  Lịch sử khám bệnh
                </Span>
                {!bulkMode && !specialView && (
                  <Pressable
                    onPress={() => setShowSectionMore(true)}
                    className='h-6 w-6 items-center justify-center'
                  >
                    <Span className='text-sm font-bold text-gray-400'>···</Span>
                  </Pressable>
                )}
                {specialView && (
                  <Span className='text-[10px] text-gray-400'>
                    {specialView === 'hidden' ? '— Bị ẩn' : '— Đã xóa'}
                  </Span>
                )}
              </View>
              <View className='flex-row items-center gap-2'>
                {bulkMode && (
                  <Pressable
                    onPress={() => {
                      setBulkMode(null)
                      setSelectedIds(new Set())
                    }}
                    className='rounded-full bg-gray-100 px-2 py-0.5'
                  >
                    <Span className='text-[10px] text-gray-500'>Hủy</Span>
                  </Pressable>
                )}
                {bulkMode && selectedIds.size > 0 && (
                  <Pressable
                    onPress={() => setShowBulkConfirm(true)}
                    className='rounded-full px-2 py-0.5'
                    style={{
                      backgroundColor: PRIMARY,
                    }}
                  >
                    <Span className='text-[10px] font-semibold text-white'>
                      {bulkMode === 'pdf' ? 'Xuất PDF' : 'Chia sẻ'} (
                      {selectedIds.size})
                    </Span>
                  </Pressable>
                )}
                {specialView && (
                  <Pressable
                    onPress={() => setSpecialView(null)}
                    className='rounded-full bg-gray-100 px-2 py-0.5'
                  >
                    <Span className='text-[10px] text-gray-500'>Quay lại</Span>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Sort chips — only in normal mode */}
            {!specialView && !bulkMode && (
              <View className='mb-3 flex-row gap-2'>
                {[
                  {
                    label: 'Gần nhất',
                    value: 'Gần nhất' as const,
                  },
                  {
                    label: 'Cũ nhất',
                    value: 'Cũ nhất' as const,
                  },
                  {
                    label: 'Bộ lọc',
                    value: 'Bộ lọc' as const,
                  },
                ].map(opt => (
                  <Pressable
                    key={opt.value}
                    onPress={() =>
                      opt.value === 'Bộ lọc'
                        ? setShowFilter(true)
                        : setSort(opt.value)
                    }
                    className={[
                      'rounded-full px-3 py-1',
                      sort === opt.value
                        ? 'bg-blue-600'
                        : 'border border-gray-200 bg-white',
                    ]}
                  >
                    <Span
                      className={[
                        'text-[10px] font-medium',
                        sort === opt.value ? 'text-white' : 'text-gray-500',
                      ]}
                    >
                      {opt.label}
                    </Span>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Bulk mode: select all */}
            {bulkMode && (
              <Pressable
                onPress={() =>
                  setSelectedIds(new Set(filteredHistory.map(r => r.id)))
                }
                className='mb-3 flex-row items-center gap-2'
              >
                <View
                  className='h-4 w-4 items-center justify-center rounded-sm border'
                  style={{
                    borderColor:
                      selectedIds.size === filteredHistory.length
                        ? PRIMARY
                        : '#d1d5db',
                    backgroundColor:
                      selectedIds.size === filteredHistory.length
                        ? PRIMARY
                        : '#fff',
                  }}
                >
                  {selectedIds.size === filteredHistory.length && (
                    <svg
                      width='10'
                      height='10'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#fff'
                      strokeWidth='3'
                      strokeLinecap='round'
                    >
                      <polyline points='20 6 9 17 4 12' />
                    </svg>
                  )}
                </View>
                <Span className='text-[11px] text-gray-600'>Chọn tất cả</Span>
              </Pressable>
            )}

            {/* Special view: hidden or deleted */}
            {specialView &&
              (() => {
                const specIds =
                  specialView === 'hidden' ? hiddenIds : deletedIds
                const specRecs = historyRecords.filter(r => specIds.has(r.id))
                if (specRecs.length === 0) {
                  return (
                    <Span className='py-8 text-center text-xs text-gray-400'>
                      Không có hồ sơ nào
                    </Span>
                  )
                }
                return specRecs.map(rec => (
                  <View
                    key={rec.id}
                    className='mb-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm'
                  >
                    <View className='mb-1 flex-row items-center justify-between'>
                      <Span className='text-xs font-semibold text-gray-800'>
                        {rec.disease}
                      </Span>
                      <Span className='text-[10px] text-gray-400'>
                        {rec.date}
                      </Span>
                    </View>
                    <Span className='text-[10px] text-gray-500'>
                      {rec.place}
                    </Span>
                    <Pressable
                      onPress={() =>
                        setPrescriptionView({
                          disease: rec.disease,
                          date: rec.date,
                          place: rec.place,
                          doctor: rec.doctor,
                          medicine: rec.medicine,
                        })
                      }
                      className='mt-2 flex-row items-center gap-1 self-start rounded-lg bg-orange-50 px-2 py-1'
                    >
                      <svg
                        width='12'
                        height='12'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#ea580c'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                        <polyline points='14 2 14 8 20 8' />
                        <line x1='16' y1='13' x2='8' y2='13' />
                        <line x1='16' y1='17' x2='8' y2='17' />
                      </svg>
                      <Span className='text-[10px] font-medium text-orange-600'>
                        Đơn thuốc
                      </Span>
                    </Pressable>
                    <View
                      className='mt-3'
                      style={{
                        borderTopWidth: 1,
                        borderColor: '#CECECE',
                      }}
                    />
                    <Pressable
                      onPress={() => setRestoreId(rec.id)}
                      className='mt-2 flex-row items-center justify-center gap-1'
                    >
                      <svg
                        width='12'
                        height='12'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke={PRIMARY}
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <polyline points='1 4 1 10 7 10' />
                        <path d='M3.51 15a9 9 0 1 0 .49-4.5' />
                      </svg>
                      <Span
                        className='text-[10px] font-medium'
                        style={{
                          color: PRIMARY,
                        }}
                      >
                        Khôi phục
                      </Span>
                    </Pressable>
                  </View>
                ))
              })()}

            {/* Normal record list */}
            {!specialView &&
              filteredHistory.map(rec => {
                const isFollowing = historyFollowSet.has(rec.id)
                const isSelected = selectedIds.has(rec.id)
                return (
                  <View key={rec.id}>
                    <View className='mb-1.5 flex-row items-center gap-2'>
                      {bulkMode && (
                        <Pressable
                          onPress={() =>
                            setSelectedIds(prev => {
                              const n = new Set(prev)
                              n.has(rec.id) ? n.delete(rec.id) : n.add(rec.id)
                              return n
                            })
                          }
                        >
                          <View
                            className='h-4 w-4 items-center justify-center rounded-sm border'
                            style={{
                              borderColor: isSelected ? PRIMARY : '#d1d5db',
                              backgroundColor: isSelected ? PRIMARY : '#fff',
                            }}
                          >
                            {isSelected && (
                              <svg
                                width='10'
                                height='10'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='#fff'
                                strokeWidth='3'
                                strokeLinecap='round'
                              >
                                <polyline points='20 6 9 17 4 12' />
                              </svg>
                            )}
                          </View>
                        </Pressable>
                      )}
                      <View className='h-1.5 w-1.5 rounded-full bg-blue-600' />
                      <Span className='text-[10px] font-semibold text-blue-600'>
                        {rec.date}
                      </Span>
                      <View className='flex-1 border-t border-blue-100' />
                    </View>
                    <View
                      className='mb-4 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm'
                      style={
                        isSelected
                          ? {
                              borderColor: PRIMARY,
                              borderWidth: 1.5,
                            }
                          : {}
                      }
                    >
                      <View className='mb-1 flex-row items-center justify-between'>
                        <Span className='text-xs font-semibold text-gray-800'>
                          {rec.disease}
                        </Span>
                        {!bulkMode && (
                          <View className='flex-row items-center gap-1.5'>
                            <Pressable
                              onPress={() => setRecordMoreId(rec.id)}
                              className='h-5 w-5 items-center justify-center'
                            >
                              <Span className='text-[11px] font-bold text-gray-400'>
                                ···
                              </Span>
                            </Pressable>
                            <Pressable
                              onPress={() =>
                                isFollowing
                                  ? setUnfollowHistoryId(rec.id)
                                  : setFollowConfirmId(rec.id)
                              }
                              className='rounded-full px-2 py-0.5'
                              style={
                                isFollowing
                                  ? {
                                      backgroundColor: '#dbeafe',
                                    }
                                  : {
                                      backgroundColor: '#f1f5f9',
                                    }
                              }
                            >
                              <Span
                                className='text-[9px] font-medium'
                                style={{
                                  color: isFollowing ? '#1d4ed8' : '#64748b',
                                }}
                              >
                                {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                              </Span>
                            </Pressable>
                          </View>
                        )}
                      </View>
                      <Span className='text-[10px] text-gray-500'>
                        {rec.place}
                      </Span>
                      <Pressable
                        onPress={() =>
                          setPrescriptionView({
                            disease: rec.disease,
                            date: rec.date,
                            place: rec.place,
                            doctor: rec.doctor,
                            medicine: rec.medicine,
                          })
                        }
                        className='mt-2 flex-row items-center gap-1 self-start rounded-lg bg-orange-50 px-2 py-1'
                      >
                        <svg
                          width='12'
                          height='12'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#ea580c'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                          <polyline points='14 2 14 8 20 8' />
                          <line x1='16' y1='13' x2='8' y2='13' />
                          <line x1='16' y1='17' x2='8' y2='17' />
                        </svg>
                        <Span className='text-[10px] font-medium text-orange-600'>
                          Đơn thuốc
                        </Span>
                      </Pressable>
                      <View
                        className='mt-3'
                        style={{
                          borderTopWidth: 1,
                          borderColor: '#CECECE',
                        }}
                      />
                      <Pressable
                        onPress={() => {
                          const extras = mockExtras[rec.id] ?? {
                            images: [],
                            links: [],
                          }
                          setDetailRecord({
                            id: rec.id,
                            date: rec.date,
                            disease: rec.disease,
                            place: rec.place,
                            medicine: rec.medicine,
                            doctor: rec.doctor,
                            ...extras,
                          })
                        }}
                        className='mt-2 flex-row items-center justify-center gap-1'
                      >
                        <svg
                          width='12'
                          height='12'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#3b82f6'
                          strokeWidth='2.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <polyline points='6 9 12 15 18 9' />
                        </svg>
                        <Span className='text-[10px] font-medium text-blue-500'>
                          Xem chi tiết
                        </Span>
                      </Pressable>
                    </View>
                  </View>
                )
              })}
          </View>
        )}
      </ScrollView>
    </YhLayout>
  )
}
