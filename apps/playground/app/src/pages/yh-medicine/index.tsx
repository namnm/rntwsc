'use client'

import { useState } from 'react'

import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { YhLayout } from '#/components/yh-layout'

const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
const DAYS_IN_WEEK = ['CN','T2','T3','T4','T5','T6','T7']

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

type MedRecord = {
  id: string
  dateObj: Date
  date: string
  medicines: string[]
  disease: string
  dose: string
  frequency: string
  duration: string
  doseCount: number
  status: 'active' | 'done'
  prescriber: string
}

const medRecords: MedRecord[] = [
  { id: 'm1', dateObj: new Date(2026, 4, 21), date: '21/05/2026', medicines: ['Paracetamol 500mg', 'Vitamin C 1000mg'], disease: 'Sốt virus', dose: '2 viên/lần', frequency: '3 lần/ngày', duration: 'Từ 21/05/2026', doseCount: 6, status: 'active', prescriber: 'BV Bạch Mai' },
  { id: 'm2', dateObj: new Date(2025, 3, 15), date: '15/04/2025', medicines: ['Amoxicillin 500mg'], disease: 'Viêm họng cấp', dose: '1 viên/lần', frequency: '3 lần/ngày', duration: '15/04 - 25/04/2025', doseCount: 30, status: 'done', prescriber: 'PK Tai Mũi Họng' },
  { id: 'm3', dateObj: new Date(2025, 2, 12), date: '12/03/2025', medicines: ['Amlodipine 5mg', 'Bisoprolol 5mg'], disease: 'Huyết áp cao', dose: '1 viên/lần', frequency: '1 lần/ngày', duration: 'Từ 12/03/2025', doseCount: 440, status: 'active', prescriber: 'BV Bạch Mai' },
  { id: 'm4', dateObj: new Date(2025, 0, 5), date: '05/01/2025', medicines: ['Metformin 500mg', 'Glipizide 5mg', 'Vitamin B12 500mcg'], disease: 'Tiểu đường type 2', dose: '1 viên/lần', frequency: '2 lần/ngày', duration: 'Từ 05/01/2025', doseCount: 300, status: 'active', prescriber: 'PK Đa khoa Hà Nội' },
  { id: 'm5', dateObj: new Date(2024, 10, 20), date: '20/11/2024', medicines: ['Oseltamivir 75mg'], disease: 'Cúm mùa', dose: '1 viên/lần', frequency: '2 lần/ngày', duration: '20/11 - 25/11/2024', doseCount: 10, status: 'done', prescriber: 'BV Đa khoa tỉnh' },
  { id: 'm6', dateObj: new Date(2024, 7, 8), date: '08/08/2024', medicines: ['Mometasone xịt mũi', 'Loratadine 10mg'], disease: 'Viêm xoang', dose: '2 lần xịt', frequency: '1 lần/ngày', duration: '08/08 - 22/08/2024', doseCount: 14, status: 'done', prescriber: 'PK Nhi đồng' },
  { id: 'm7', dateObj: new Date(2024, 5, 15), date: '15/06/2024', medicines: ['Ibuprofen 400mg'], disease: 'Đau lưng mãn tính', dose: '1 viên/lần', frequency: '2 lần/ngày', duration: '15/06 - 29/06/2024', doseCount: 28, status: 'done', prescriber: 'BV Chấn thương chỉnh hình' },
].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())

const allDiseases = [...new Set(medRecords.map(r => r.disease))]
const allMedicines = [...new Set(medRecords.flatMap(r => r.medicines))]
const allPlaces = [...new Set(medRecords.map(r => r.prescriber))]

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const parseDoseAmt = (dose: string) => { const m = dose.match(/\d+/); return m ? parseInt(m[0]) : 1 }
const parseDoseUnit = (dose: string) => dose.includes('viên') ? 'viên' : dose.includes('xịt') ? 'lần xịt' : 'lần'
const parseFreqTimes = (freq: string) => { const m = freq.match(/\d+/); return m ? parseInt(m[0]) : 1 }

type DrugInfo = {
  id: string
  name: string
  ingredient: string
  uses: string
  dosage: string
  warning: string
  category: string
}

const drugList: DrugInfo[] = [
  { id: 'd1', name: 'Paracetamol', ingredient: 'Paracetamol 500mg', uses: 'Giảm đau, hạ sốt', dosage: 'Người lớn: 1-2 viên/lần, 3-4 lần/ngày. Tối đa 4g/ngày', warning: 'Không dùng khi tổn thương gan. Tránh uống rượu bia', category: 'Giảm đau - Hạ sốt' },
  { id: 'd2', name: 'Amoxicillin', ingredient: 'Amoxicillin 500mg', uses: 'Kháng sinh - viêm họng, viêm phổi, nhiễm khuẩn đường hô hấp', dosage: '500mg/lần x 3 lần/ngày. Uống đủ liệu trình 5-10 ngày', warning: 'Cần kê đơn bác sĩ. Không dùng nếu dị ứng penicillin', category: 'Kháng sinh' },
  { id: 'd3', name: 'Amlodipine', ingredient: 'Amlodipine besylate 5mg', uses: 'Điều trị huyết áp cao, đau thắt ngực ổn định', dosage: '5-10mg/lần x 1 lần/ngày, uống vào cùng một thời điểm', warning: 'Không ngừng thuốc đột ngột. Theo dõi huyết áp định kỳ', category: 'Tim mạch' },
  { id: 'd4', name: 'Metformin', ingredient: 'Metformin HCl 500mg', uses: 'Kiểm soát đường huyết trong bệnh tiểu đường type 2', dosage: '500-850mg/lần x 2-3 lần/ngày. Uống trong bữa ăn', warning: 'Không dùng khi suy thận nặng. Báo bác sĩ trước khi chụp CT cản quang', category: 'Tiểu đường' },
  { id: 'd5', name: 'Ibuprofen', ingredient: 'Ibuprofen 400mg', uses: 'Giảm đau, hạ sốt, kháng viêm', dosage: '400mg/lần x 3 lần/ngày. Uống sau ăn no', warning: 'Không dùng khi loét dạ dày, suy thận hoặc đang dùng thuốc kháng đông', category: 'Giảm đau - Kháng viêm' },
  { id: 'd6', name: 'Loratadine', ingredient: 'Loratadine 10mg', uses: 'Dị ứng, viêm mũi dị ứng, mề đay, ngứa da', dosage: '10mg/lần x 1 lần/ngày', warning: 'Ít gây buồn ngủ. Tránh uống cùng rượu bia', category: 'Dị ứng' },
  { id: 'd7', name: 'Omeprazole', ingredient: 'Omeprazole 20mg', uses: 'Viêm loét dạ dày, trào ngược dạ dày - thực quản', dosage: '20-40mg/lần x 1 lần/ngày. Uống trước bữa ăn 30 phút', warning: 'Dùng dài hạn có thể giảm hấp thu vitamin B12 và magie', category: 'Tiêu hóa' },
  { id: 'd8', name: 'Oseltamivir', ingredient: 'Oseltamivir phosphate 75mg', uses: 'Điều trị và dự phòng cúm A, B', dosage: '75mg/lần x 2 lần/ngày trong 5 ngày', warning: 'Hiệu quả nhất khi bắt đầu trong 48 giờ đầu. Cần kê đơn bác sĩ', category: 'Kháng virus' },
  { id: 'd9', name: 'Mometasone', ingredient: 'Mometasone furoate 50mcg/liều', uses: 'Viêm mũi dị ứng, viêm xoang mãn tính', dosage: '2 lần xịt/mỗi bên mũi x 1 lần/ngày', warning: 'Không xịt vào mắt. Tái khám sau 3 tháng sử dụng liên tục', category: 'Hô hấp' },
  { id: 'd10', name: 'Clarithromycin', ingredient: 'Clarithromycin 500mg', uses: 'Kháng sinh - nhiễm khuẩn hô hấp, viêm xoang, nhiễm H. pylori', dosage: '250-500mg/lần x 2 lần/ngày, uống đủ 7-14 ngày', warning: 'Cần kê đơn. Tránh dùng cùng statins và một số thuốc tim mạch', category: 'Kháng sinh' },
]

const sortOptions = ['Gần nhất', 'Cũ nhất'] as const
const REPEAT_OPTIONS = ['Không lặp', 'Mỗi ngày', 'Mỗi tuần', 'Mỗi tháng']
const PRIMARY = '#132C95'

export const YhMedicinePage = () => {
  const [activeSection, setActiveSection] = useState<'history' | 'lookup'>('history')
  const [sort, setSort] = useState<(typeof sortOptions)[number]>('Gần nhất')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [calYear, setCalYear] = useState(2026)
  const [calMonth, setCalMonth] = useState(4)
  const [calSelected, setCalSelected] = useState<Array<{ year: number; month: number; day: number }>>([])
  const [showSectionMore, setShowSectionMore] = useState(false)
  const [expandedDrugId, setExpandedDrugId] = useState<string | null>(null)
  const [notifOffIds, setNotifOffIds] = useState<Set<string>>(new Set(medRecords.map(r => r.id)))
  const [showReminderModalId, setShowReminderModalId] = useState<string | null>(null)
  const [showMedListModalId, setShowMedListModalId] = useState<string | null>(null)
  const [showTimerModal, setShowTimerModal] = useState<{ recId: string; medIdx: number } | null>(null)
  const [reminderTimes, setReminderTimes] = useState<Record<string, { h: number; m: number }>>({})
  const [repeatYear, setRepeatYear] = useState(2026)
  const [repeatMonth, setRepeatMonth] = useState(5)
  const [repeatDays, setRepeatDays] = useState<Set<string>>(new Set())
  const [showRepeatYearPicker, setShowRepeatYearPicker] = useState(false)
  const [reminderSetMedKeys, setReminderSetMedKeys] = useState<Set<string>>(new Set())
  const [reminderSavedIds, setReminderSavedIds] = useState<Set<string>>(new Set())
  const [recordMoreId, setRecordMoreId] = useState<string | null>(null)
  const [detailMedId, setDetailMedId] = useState<string | null>(null)
  const [prescriptionRec, setPrescriptionRec] = useState<MedRecord | null>(null)
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null)
  const [showMedicineTracker, setShowMedicineTracker] = useState(false)
  const [trackerDisease, setTrackerDisease] = useState('')
  const [trackerMedicine, setTrackerMedicine] = useState('')
  const [trackerQuantity, setTrackerQuantity] = useState('')
  const [trackerDose, setTrackerDose] = useState('')
  const [trackerStartDate, setTrackerStartDate] = useState('')
  const [trackerEndDate, setTrackerEndDate] = useState('')
  const [trackerNote, setTrackerNote] = useState('')
  const [trackerReminder, setTrackerReminder] = useState('')
  const [showTrackerCalendar, setShowTrackerCalendar] = useState<'start' | 'end' | null>(null)
  const [tcYear, setTcYear] = useState(2026)
  const [tcMonth, setTcMonth] = useState(4)
  const [tcDay, setTcDay] = useState<number | null>(null)
  const [showTrackerReminder, setShowTrackerReminder] = useState(false)
  const [remHour, setRemHour] = useState(8)
  const [remMin, setRemMin] = useState(0)
  const [remRepeat, setRemRepeat] = useState('Không lặp')
  const [showFilter, setShowFilter] = useState(false)
  const [filterDiseases, setFilterDiseases] = useState<Set<string>>(new Set())
  const [filterMedicines, setFilterMedicines] = useState<Set<string>>(new Set())
  const [filterPlaces, setFilterPlaces] = useState<Set<string>>(new Set())

  const tabActive = { backgroundColor: '#FEA755', borderColor: '#754539', borderWidth: 1 }
  const tabInactive = { backgroundColor: '#F6E5D2', borderColor: 'rgba(117,69,57,0.2)', borderWidth: 1 }

  const isCalSelected = (year: number, month: number, day: number) =>
    calSelected.some(s => s.year === year && s.month === month && s.day === day)

  const toggleCalDay = (year: number, month: number, day: number) => {
    if (isCalSelected(year, month, day)) {
      setCalSelected(prev => prev.filter(s => !(s.year === year && s.month === month && s.day === day)))
    } else {
      setCalSelected(prev => [...prev, { year, month, day }])
    }
  }

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)
  const calCells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1)

  const sortedRecords = [...medRecords].sort(
    sort === 'Cũ nhất'
      ? (a, b) => a.dateObj.getTime() - b.dateObj.getTime()
      : (a, b) => b.dateObj.getTime() - a.dateObj.getTime()
  )

  const filterCount = filterDiseases.size + filterMedicines.size + filterPlaces.size

  const applyFilters = (r: MedRecord) => {
    const noneSelected = filterDiseases.size === 0 && filterMedicines.size === 0 && filterPlaces.size === 0
    if (noneSelected) return true
    return filterDiseases.has(r.disease) || filterPlaces.has(r.prescriber) || r.medicines.some(m => filterMedicines.has(m))
  }

  const displayRecords = filterCount > 0 ? sortedRecords.filter(applyFilters) : sortedRecords

  const filteredDrugs = drugList.filter(d =>
    searchQuery.trim() === '' ||
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.ingredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.uses.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <YhLayout activeTab='medicine'>

      {/* ---- Medicine tracker modal ---- */}
      {showMedicineTracker && (
        <View className='absolute inset-0 z-50 bg-black/40'>
          <Pressable className='flex-1' onPress={() => setShowMedicineTracker(false)} />
          <View className='rounded-t-3xl bg-white' style={{ maxHeight: '88%' }}>
            <ScrollView>
              <View className='p-4'>
                <View className='mb-3 items-center'>
                  <View className='h-1 w-10 rounded-full bg-gray-200' />
                </View>
                <View className='mb-4 flex-row items-center justify-between'>
                  <Span className='text-sm font-semibold text-gray-800'>Theo dõi uống thuốc</Span>
                  <Pressable onPress={() => setShowMedicineTracker(false)} className='h-7 w-7 items-center justify-center rounded-full bg-gray-100'>
                    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='2.5' strokeLinecap='round'>
                      <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
                    </svg>
                  </Pressable>
                </View>

                <View className='mb-3'>
                  <Span className='mb-1 text-[10px] font-medium text-gray-400'>TÊN BỆNH</Span>
                  <input
                    type='text'
                    value={trackerDisease}
                    onChange={(e: any) => setTrackerDisease(e.target.value)}
                    placeholder='Nhập tên bệnh...'
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '8px 12px', fontSize: 12, color: '#374151', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' } as any}
                  />
                </View>

                <View className='mb-3'>
                  <Span className='mb-1 text-[10px] font-medium text-gray-400'>TÊN THUỐC</Span>
                  <input
                    type='text'
                    value={trackerMedicine}
                    onChange={(e: any) => setTrackerMedicine(e.target.value)}
                    placeholder='Nhập tên thuốc...'
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '8px 12px', fontSize: 12, color: '#374151', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' } as any}
                  />
                </View>

                <View className='mb-3 flex-row gap-3'>
                  <View className='flex-1'>
                    <Span className='mb-1 text-[10px] font-medium text-gray-400'>SỐ LƯỢNG</Span>
                    <input
                      type='text'
                      value={trackerQuantity}
                      onChange={(e: any) => setTrackerQuantity(e.target.value)}
                      placeholder='VD: 2 viên'
                      style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '8px 12px', fontSize: 12, color: '#374151', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' } as any}
                    />
                  </View>
                  <View className='flex-1'>
                    <Span className='mb-1 text-[10px] font-medium text-gray-400'>LIỀU UỐNG</Span>
                    <input
                      type='text'
                      value={trackerDose}
                      onChange={(e: any) => setTrackerDose(e.target.value)}
                      placeholder='VD: 3 lần/ngày'
                      style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '8px 12px', fontSize: 12, color: '#374151', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' } as any}
                    />
                  </View>
                </View>

                <View className='mb-3'>
                  <Span className='mb-1 text-[10px] font-medium text-gray-400'>THỜI GIAN</Span>
                  <View className='flex-row items-center gap-2'>
                    <Pressable
                      onPress={() => setShowTrackerCalendar('start')}
                      className='flex-1 flex-row items-center justify-between rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5'
                    >
                      <Span className={['text-xs', trackerStartDate ? 'text-gray-800' : 'text-gray-400']}>{trackerStartDate || 'Bắt đầu'}</Span>
                      <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                        <rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/>
                      </svg>
                    </Pressable>
                    <Span className='text-[10px] text-gray-400'>-</Span>
                    <Pressable
                      onPress={() => setShowTrackerCalendar('end')}
                      className='flex-1 flex-row items-center justify-between rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5'
                    >
                      <Span className={['text-xs', trackerEndDate ? 'text-gray-800' : 'text-gray-400']}>{trackerEndDate || 'Kết thúc'}</Span>
                      <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                        <rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/>
                      </svg>
                    </Pressable>
                  </View>
                </View>

                <View className='mb-3'>
                  <Span className='mb-1 text-[10px] font-medium text-gray-400'>CHÚ Ý</Span>
                  <textarea
                    value={trackerNote}
                    onChange={(e: any) => setTrackerNote(e.target.value)}
                    placeholder='Ghi chú thêm...'
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '8px 12px', fontSize: 12, color: '#374151', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box', minHeight: 72, resize: 'none', fontFamily: 'inherit' } as any}
                  />
                </View>

                <View className='mb-5'>
                  <Span className='mb-1 text-[10px] font-medium text-gray-400'>NHẮC NHỞ</Span>
                  <View className='flex-row items-center gap-2'>
                    <View className='flex-1 rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5'>
                      <Span className='text-xs text-gray-400'>{trackerReminder || 'Chưa đặt nhắc nhở...'}</Span>
                    </View>
                    <Pressable onPress={() => setShowTrackerReminder(true)} className='h-10 w-10 items-center justify-center rounded-xl bg-blue-50'>
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                        <circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>
                      </svg>
                    </Pressable>
                  </View>
                </View>

                <View className='flex-row gap-3'>
                  <Pressable onPress={() => setShowMedicineTracker(false)} className='flex-1 items-center rounded-xl border border-gray-200 bg-white py-3'>
                    <Span className='text-sm text-gray-600'>Hủy bỏ</Span>
                  </Pressable>
                  <Pressable onPress={() => setShowMedicineTracker(false)} className='flex-1 items-center rounded-xl py-3' style={{ backgroundColor: PRIMARY }}>
                    <Span className='text-sm font-semibold text-white'>Lưu lại</Span>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* ---- Tracker: date calendar ---- */}
      {showTrackerCalendar !== null && (
        <View className='absolute inset-0 z-60 items-center justify-end bg-black/40'>
          <View className='w-full rounded-t-3xl bg-white p-4'>
            <View className='mb-3 flex-row items-center justify-between'>
              <Pressable onPress={() => { if (tcMonth === 0) { setTcMonth(11); setTcYear(y => y - 1) } else setTcMonth(m => m - 1) }}>
                <Span className='px-2 text-lg font-bold' style={{ color: PRIMARY }}>{'<'}</Span>
              </Pressable>
              <Span className='text-sm font-semibold text-gray-800'>{MONTHS[tcMonth]} {tcYear}</Span>
              <Pressable onPress={() => { if (tcMonth === 11) { setTcMonth(0); setTcYear(y => y + 1) } else setTcMonth(m => m + 1) }}>
                <Span className='px-2 text-lg font-bold' style={{ color: PRIMARY }}>{'>'}</Span>
              </Pressable>
            </View>
            <View className='mb-1 flex-row'>
              {DAYS_IN_WEEK.map(d => (
                <View key={d} className='flex-1 items-center'>
                  <Span className='text-[10px] font-semibold text-gray-400'>{d}</Span>
                </View>
              ))}
            </View>
            <View className='flex-row flex-wrap'>
              {(() => {
                const dim = getDaysInMonth(tcYear, tcMonth)
                const fd = getFirstDayOfMonth(tcYear, tcMonth)
                return Array.from({ length: fd + dim }, (_, i) => i < fd ? null : i - fd + 1).map((day, idx) => (
                  <View key={idx} className='items-center justify-center' style={{ width: '14.28%', paddingVertical: 4 }}>
                    {day ? (
                      <Pressable
                        onPress={() => setTcDay(day)}
                        className='h-7 w-7 items-center justify-center rounded-full'
                        style={tcDay === day ? { backgroundColor: PRIMARY } : {}}
                      >
                        <Span className='text-[11px]' style={{ color: tcDay === day ? '#fff' : '#1a1a2e', fontWeight: tcDay === day ? '600' : '400' }}>{day}</Span>
                      </Pressable>
                    ) : <View className='h-7 w-7' />}
                  </View>
                ))
              })()}
            </View>
            <Pressable
              onPress={() => {
                if (tcDay) {
                  const s = `${String(tcDay).padStart(2, '0')}/${String(tcMonth + 1).padStart(2, '0')}/${tcYear}`
                  if (showTrackerCalendar === 'start') setTrackerStartDate(s)
                  else setTrackerEndDate(s)
                }
                setTcDay(null)
                setShowTrackerCalendar(null)
              }}
              className='mt-3 items-center rounded-xl py-3'
              style={{ backgroundColor: PRIMARY }}
            >
              <Span className='text-sm font-semibold text-white'>Xác nhận</Span>
            </Pressable>
          </View>
        </View>
      )}

      {/* ---- Tracker: reminder picker ---- */}
      {showTrackerReminder && (
        <View className='absolute inset-0 z-60 items-center justify-end bg-black/40'>
          <View className='w-full rounded-t-3xl bg-white p-4'>
            <View className='mb-4 flex-row items-center justify-between'>
              <Pressable onPress={() => setShowTrackerReminder(false)}>
                <Span className='text-sm text-gray-500'>Hủy</Span>
              </Pressable>
              <Span className='text-sm font-semibold text-gray-800'>Nhắc uống thuốc</Span>
              <Pressable onPress={() => {
                setTrackerReminder(`${String(remHour).padStart(2, '0')}:${String(remMin).padStart(2, '0')} - ${remRepeat}`)
                setShowTrackerReminder(false)
              }}>
                <Span className='text-sm font-semibold' style={{ color: PRIMARY }}>Xong</Span>
              </Pressable>
            </View>
            <View className='mb-4 flex-row items-center justify-center gap-2'>
              <View className='items-center'>
                <Pressable onPress={() => setRemHour(h => (h + 1) % 24)} className='py-1'>
                  <Span className='text-lg text-gray-400'>^</Span>
                </Pressable>
                <View className='h-12 w-14 items-center justify-center rounded-xl bg-slate-100'>
                  <Span className='text-2xl font-bold text-gray-900'>{String(remHour).padStart(2, '0')}</Span>
                </View>
                <Pressable onPress={() => setRemHour(h => (h - 1 + 24) % 24)} className='py-1'>
                  <Span className='text-lg text-gray-400' style={{ transform: [{ rotate: '180deg' }] }}>^</Span>
                </Pressable>
              </View>
              <Span className='text-2xl font-bold text-gray-400'>:</Span>
              <View className='items-center'>
                <Pressable onPress={() => setRemMin(m => (m + 1) % 60)} className='py-1'>
                  <Span className='text-lg text-gray-400'>^</Span>
                </Pressable>
                <View className='h-12 w-14 items-center justify-center rounded-xl bg-slate-100'>
                  <Span className='text-2xl font-bold text-gray-900'>{String(remMin).padStart(2, '0')}</Span>
                </View>
                <Pressable onPress={() => setRemMin(m => (m - 1 + 60) % 60)} className='py-1'>
                  <Span className='text-lg text-gray-400' style={{ transform: [{ rotate: '180deg' }] }}>^</Span>
                </Pressable>
              </View>
            </View>
            <Span className='mb-1.5 text-[10px] font-semibold text-gray-400'>LẶP LẠI</Span>
            <View className='overflow-hidden rounded-2xl bg-slate-50'>
              {REPEAT_OPTIONS.map((opt, i) => (
                <Pressable
                  key={opt}
                  onPress={() => setRemRepeat(opt)}
                  className={['flex-row items-center justify-between px-4 py-2.5', i < REPEAT_OPTIONS.length - 1 ? 'border-b border-gray-100' : '']}
                >
                  <Span className='text-xs text-gray-800'>{opt}</Span>
                  {remRepeat === opt && (
                    <View className='h-4 w-4 items-center justify-center rounded-full' style={{ backgroundColor: PRIMARY }}>
                      <svg width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='3.5' strokeLinecap='round'>
                        <polyline points='20 6 9 17 4 12'/>
                      </svg>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setShowTrackerReminder(false)} className='mt-4 items-center rounded-2xl border border-gray-200 py-3'>
              <Span className='text-sm font-medium text-gray-500'>Hủy</Span>
            </Pressable>
          </View>
        </View>
      )}

      {/* ---- Prescription image view ---- */}
      {prescriptionRec !== null && (
        <View className='absolute inset-0 z-[70] items-center justify-center bg-black/70 px-5'>
          <View className='w-full overflow-hidden rounded-2xl shadow-2xl'>
            <View className='items-center px-4 py-3' style={{ backgroundColor: PRIMARY }}>
              <View className='mb-1 h-7 w-7 items-center justify-center rounded-lg' style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Span className='text-xs font-bold text-white'>YH</Span>
              </View>
              <Span className='text-[9px] font-medium text-white/70'>YourHealth</Span>
              <Span className='mt-0.5 text-xs font-bold text-white'>{prescriptionRec.prescriber}</Span>
            </View>
            <View className='bg-white px-4 py-4'>
              <Span className='mb-3 text-center text-sm font-bold tracking-wide text-gray-800'>DON THUOC</Span>
              <View className='mb-3 rounded-xl bg-slate-50 p-3'>
                <View className='mb-1.5 flex-row gap-2'>
                  <Span className='w-20 text-[10px] font-semibold text-gray-400'>Ngay ke:</Span>
                  <Span className='text-[10px] text-gray-700'>{prescriptionRec.date}</Span>
                </View>
                <View className='flex-row gap-2'>
                  <Span className='w-20 text-[10px] font-semibold text-gray-400'>Chan doan:</Span>
                  <Span className='flex-1 text-[10px] text-gray-700'>{prescriptionRec.disease}</Span>
                </View>
              </View>
              <Span className='mb-2 text-[10px] font-bold text-gray-700'>THUOC KE DON</Span>
              <View className='mb-4 rounded-xl bg-orange-50 p-3'>
                {prescriptionRec.medicines.map((med, i) => (
                  <View key={med} className='mb-2 flex-row items-start gap-2 last:mb-0'>
                    <View className='mt-0.5 h-4 w-4 items-center justify-center rounded-full bg-orange-500'>
                      <Span className='text-[8px] font-bold text-white'>{i + 1}</Span>
                    </View>
                    <View className='flex-1'>
                      <Span className='text-[11px] font-semibold text-orange-800'>{med}</Span>
                      <Span className='mt-0.5 text-[9px] text-orange-500'>Uong theo chi dinh cua bac si</Span>
                    </View>
                  </View>
                ))}
              </View>
              <View className='items-end'>
                <Span className='text-[9px] italic text-gray-400'>Chu ky va dong dau</Span>
                <View className='mb-0.5 mt-4 w-28 border-b border-dashed border-gray-300' />
                <Span className='text-[9px] text-gray-500'>Bac si dieu tri</Span>
              </View>
            </View>
          </View>
          <Pressable
            onPress={() => setPrescriptionRec(null)}
            className='mt-5 h-10 w-10 items-center justify-center rounded-full'
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2.5' strokeLinecap='round'>
              <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
            </svg>
          </Pressable>
        </View>
      )}

      {/* ---- Record more menu ---- */}
      {recordMoreId !== null && (
        <View className='absolute inset-0 z-50 justify-end bg-black/30'>
          <Pressable className='flex-1' onPress={() => setRecordMoreId(null)} />
          <View className='rounded-t-3xl bg-white p-4'>
            <View className='mb-3 items-center'>
              <View className='h-1 w-10 rounded-full bg-gray-200' />
            </View>
            {[
              { label: 'Chỉnh sửa', icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/><path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/></svg> },
              { label: 'Xuất PDF', icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/></svg> },
              { label: 'Chia sẻ', icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><line x1='8.59' y1='13.51' x2='15.42' y2='17.49'/><line x1='15.41' y1='6.51' x2='8.59' y2='10.49'/></svg> },
            ].map(item => (
              <Pressable key={item.label} onPress={() => setRecordMoreId(null)} className='flex-row items-center gap-3 rounded-xl px-3 py-3'>
                {item.icon}
                <Span className='text-sm text-gray-800'>{item.label}</Span>
              </Pressable>
            ))}
            <Pressable onPress={() => setRecordMoreId(null)} className='mt-2 items-center rounded-2xl border border-gray-200 py-3'>
              <Span className='text-sm font-medium text-gray-500'>Hủy</Span>
            </Pressable>
          </View>
        </View>
      )}

      {/* ---- Reminder modal ---- */}
      {showReminderModalId !== null && (() => {
        const rec = medRecords.find(r => r.id === showReminderModalId)
        if (!rec) return null
        const doseAmt = parseDoseAmt(rec.dose)
        const doseUnit = parseDoseUnit(rec.dose)
        const freqTimes = parseFreqTimes(rec.frequency)
        const perMedQty = Math.ceil(rec.doseCount / rec.medicines.length)
        const scheduleText = freqTimes === 1
          ? `Sáng: ${doseAmt} ${doseUnit}`
          : freqTimes === 2
            ? `Sáng: ${doseAmt} ${doseUnit}; Chiều: ${doseAmt} ${doseUnit}`
            : `Sáng: ${doseAmt} ${doseUnit}; Trưa: ${doseAmt} ${doseUnit}; Chiều: ${doseAmt} ${doseUnit}`
        const allSaved = reminderSavedIds.has(rec.id)
        const bellColor = allSaved ? '#3B82F6' : PRIMARY
        const toggleOn = showMedListModalId === rec.id
        return (
          <View className='absolute inset-0 z-50 justify-end bg-black/40'>
            <Pressable className='flex-1' onPress={() => { setShowReminderModalId(null); setShowMedListModalId(null) }} />
            <View className='rounded-t-3xl bg-white' style={{ maxHeight: '85%' }}>
              <ScrollView>
                <View className='p-5' style={{ paddingBottom: 40 }}>
                  {/* Drag handle */}
                  <View className='mb-4 items-center'>
                    <View className='h-1 w-10 rounded-full bg-gray-200' />
                  </View>

                  {/* Bell logo + label + disease + date */}
                  <View className='items-center'>
                    <View className='h-14 w-14 items-center justify-center rounded-full' style={{ backgroundColor: '#eff6ff' }}>
                      <svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke={bellColor} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                        <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/>
                      </svg>
                    </View>
                    <Span className='mt-2 text-sm font-semibold text-gray-700'>Lời nhắc</Span>
                    <Span className='text-lg font-semibold text-gray-800' style={{ marginTop: 36 }}>{rec.disease}</Span>
                    <Span className='mt-1 text-[11px] text-gray-400'>{rec.date}</Span>
                  </View>

                  {/* Toggle row */}
                  <View className='mt-8 flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-3'>
                    <Span className='text-sm font-medium text-gray-700'>Lời nhắc</Span>
                    <Pressable
                      onPress={() => {
                        if (toggleOn) {
                          setShowMedListModalId(null)
                        } else {
                          setShowMedListModalId(rec.id)
                          setShowTimerModal({ recId: rec.id, medIdx: 0 })
                        }
                      }}
                      style={{
                        width: 44, height: 26, borderRadius: 13,
                        backgroundColor: toggleOn ? PRIMARY : '#d1d5db',
                        justifyContent: 'center',
                        paddingHorizontal: 3,
                        alignItems: toggleOn ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
                    </Pressable>
                  </View>

                  {/* Medicine rows — always visible */}
                  <View style={{ marginTop: 16 }}>
                    {rec.medicines.map((med, idx) => {
                      const medKey = `${rec.id}|${idx}`
                      const medSaved = reminderSetMedKeys.has(medKey)
                      const rowBellColor = medSaved ? '#3B82F6' : PRIMARY
                      return (
                        <View key={med} className='mb-4 flex-row items-start' style={{ gap: 10 }}>
                          <View className='h-12 w-12 items-center justify-center rounded-xl' style={{ backgroundColor: '#eff6ff', flexShrink: 0 }}>
                            <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                              <path d='m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z'/>
                              <path d='m8.5 8.5 7 7'/>
                            </svg>
                          </View>
                          <View className='flex-1'>
                            <Span className='text-xs font-semibold text-gray-800'>{idx + 1}. {med}</Span>
                            <Span className='mt-0.5 text-[11px] text-gray-500'>Số lượng: {perMedQty} {doseUnit}</Span>
                            <Span className='mt-0.5 text-[10px] text-gray-400'>Uống {freqTimes} lần/ngày</Span>
                            <Span className='text-[10px] text-gray-400'>{scheduleText}</Span>
                          </View>
                          <Pressable
                            onPress={() => setShowTimerModal({ recId: rec.id, medIdx: idx })}
                            className='h-8 w-8 items-center justify-center rounded-full'
                            style={{ backgroundColor: '#eff6ff', flexShrink: 0 }}
                          >
                            <svg width='15' height='15' viewBox='0 0 24 24' fill={medSaved ? '#3B82F6' : 'none'} stroke={rowBellColor} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                              <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/>
                            </svg>
                          </Pressable>
                        </View>
                      )
                    })}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        )
      })()}

      {/* ---- Timer modal ---- */}
      {showTimerModal !== null && (() => {
        const rec = medRecords.find(r => r.id === showTimerModal.recId)
        if (!rec) return null
        const med = rec.medicines[showTimerModal.medIdx]
        const medIdx = showTimerModal.medIdx
        const isLast = medIdx === rec.medicines.length - 1
        const doseAmt = parseDoseAmt(rec.dose)
        const doseUnit = parseDoseUnit(rec.dose)
        const freqTimes = parseFreqTimes(rec.frequency)
        const SESSIONS = [
          { key: 'morning', label: 'Sáng', defaultH: 8 },
          { key: 'noon', label: 'Trưa', defaultH: 12 },
          { key: 'evening', label: 'Tối', defaultH: 20 },
        ]
        return (
          <View className='absolute inset-0 z-60 justify-end bg-black/40'>
            <Pressable className='flex-1' onPress={() => setShowTimerModal(null)} />
            <View className='rounded-t-3xl bg-white' style={{ maxHeight: '85%' }}>
              <ScrollView>
                <View className='p-4'>
                  {/* Drag handle */}
                  <View className='mb-3 items-center'>
                    <View className='h-1 w-10 rounded-full bg-gray-200' />
                  </View>
                  {/* Back icon */}
                  <Pressable onPress={() => setShowTimerModal(null)} className='mb-6 h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#374151' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <polyline points='15 18 9 12 15 6'/>
                    </svg>
                  </Pressable>

                  {/* Medicine title + dose — centered */}
                  <View className='mb-8 items-center'>
                    <Span className='text-sm font-bold text-gray-800'>{medIdx + 1}. {med}</Span>
                    <Span className='mt-1 text-[11px] text-gray-400'>Uống {freqTimes} lần/ngày - {doseAmt} {doseUnit}/lần</Span>
                  </View>

                  {/* 3 columns: Sáng / Trưa / Tối */}
                  <View className='flex-row gap-2'>
                    {SESSIONS.map(sess => {
                      const timeKey = `${rec.id}|${med}|${sess.key}`
                      const time = reminderTimes[timeKey] ?? { h: sess.defaultH, m: 0 }
                      return (
                        <View key={sess.key} className='flex-1 items-center rounded-2xl bg-slate-50 py-3'>
                          <Span className='mb-2 text-sm font-semibold text-gray-600'>{sess.label}</Span>
                          <View className='flex-row items-center' style={{ gap: 2 }}>
                            <View className='items-center'>
                              <Pressable
                                className='pb-1'
                                onPress={() => setReminderTimes(prev => {
                                  const cur = prev[timeKey] ?? { h: sess.defaultH, m: 0 }
                                  return { ...prev, [timeKey]: { ...cur, h: (cur.h + 1) % 24 } }
                                })}
                              >
                                <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                                  <polyline points='18 15 12 9 6 15'/>
                                </svg>
                              </Pressable>
                              <View className='h-8 w-8 items-center justify-center rounded-lg bg-white' style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 2 }}>
                                <Span className='text-sm font-bold text-gray-800'>{String(time.h).padStart(2, '0')}</Span>
                              </View>
                              <Pressable
                                className='pt-1'
                                onPress={() => setReminderTimes(prev => {
                                  const cur = prev[timeKey] ?? { h: sess.defaultH, m: 0 }
                                  return { ...prev, [timeKey]: { ...cur, h: (cur.h - 1 + 24) % 24 } }
                                })}
                              >
                                <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                                  <polyline points='6 9 12 15 18 9'/>
                                </svg>
                              </Pressable>
                            </View>
                            <Span className='mx-0.5 text-sm font-bold text-gray-300'>:</Span>
                            <View className='items-center'>
                              <Pressable
                                className='pb-1'
                                onPress={() => setReminderTimes(prev => {
                                  const cur = prev[timeKey] ?? { h: sess.defaultH, m: 0 }
                                  return { ...prev, [timeKey]: { ...cur, m: (cur.m + 1) % 60 } }
                                })}
                              >
                                <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                                  <polyline points='18 15 12 9 6 15'/>
                                </svg>
                              </Pressable>
                              <View className='h-8 w-8 items-center justify-center rounded-lg bg-white' style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 2 }}>
                                <Span className='text-sm font-bold text-gray-800'>{String(time.m).padStart(2, '0')}</Span>
                              </View>
                              <Pressable
                                className='pt-1'
                                onPress={() => setReminderTimes(prev => {
                                  const cur = prev[timeKey] ?? { h: sess.defaultH, m: 0 }
                                  return { ...prev, [timeKey]: { ...cur, m: (cur.m - 1 + 60) % 60 } }
                                })}
                              >
                                <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                                  <polyline points='6 9 12 15 18 9'/>
                                </svg>
                              </Pressable>
                            </View>
                          </View>
                        </View>
                      )
                    })}
                  </View>

                  {/* Lặp lại section */}
                  {(() => {
                    const rDaysInMonth = getDaysInMonth(repeatYear, repeatMonth)
                    const rFirstDay = getFirstDayOfMonth(repeatYear, repeatMonth)
                    const rCells = [...Array(rFirstDay).fill(null), ...Array.from({ length: rDaysInMonth }, (_, i) => i + 1)]
                    const rRows: (number | null)[][] = []
                    for (let i = 0; i < rCells.length; i += 7) {
                      const row = rCells.slice(i, i + 7)
                      while (row.length < 7) row.push(null)
                      rRows.push(row)
                    }
                    return (
                      <View className='mt-6'>
                        <Span className='mb-3 text-[11px] font-semibold text-gray-400'>Lặp lại:</Span>

                        {/* Month navigation */}
                        <View className='mb-3 flex-row items-center justify-between'>
                          <Pressable
                            onPress={() => { if (repeatMonth === 0) { setRepeatMonth(11); setRepeatYear(y => y - 1) } else setRepeatMonth(m => m - 1) }}
                            className='h-8 w-8 items-center justify-center rounded-full bg-slate-100'
                          >
                            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#374151' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                              <polyline points='15 18 9 12 15 6'/>
                            </svg>
                          </Pressable>

                          <Pressable
                            onPress={() => setShowRepeatYearPicker(v => !v)}
                            className='flex-row items-center gap-1.5'
                          >
                            <Span className='text-sm font-semibold text-gray-800'>Tháng {repeatMonth + 1}, {repeatYear}</Span>
                            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                              <rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/>
                            </svg>
                          </Pressable>

                          <Pressable
                            onPress={() => { if (repeatMonth === 11) { setRepeatMonth(0); setRepeatYear(y => y + 1) } else setRepeatMonth(m => m + 1) }}
                            className='h-8 w-8 items-center justify-center rounded-full bg-slate-100'
                          >
                            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#374151' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                              <polyline points='9 18 15 12 9 6'/>
                            </svg>
                          </Pressable>
                        </View>

                        {/* Year picker dropdown */}
                        {showRepeatYearPicker && (
                          <View className='mb-3 overflow-hidden rounded-2xl border bg-white' style={{ borderColor: '#e5e7eb', maxHeight: 180 }}>
                            <ScrollView>
                              {[2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                <Pressable
                                  key={y}
                                  onPress={() => { setRepeatYear(y); setShowRepeatYearPicker(false) }}
                                  className='items-center py-2.5'
                                  style={{ backgroundColor: repeatYear === y ? '#eff6ff' : 'transparent' }}
                                >
                                  <Span className='text-sm font-medium' style={{ color: repeatYear === y ? PRIMARY : '#374151' }}>{y}</Span>
                                </Pressable>
                              ))}
                            </ScrollView>
                          </View>
                        )}

                        {/* Weekly calendar grid */}
                        <View style={{ gap: 4 }}>
                          {rRows.map((row, ri) => (
                            <View key={ri} className='flex-row justify-between'>
                              {row.map((day, ci) => {
                                if (day === null) {
                                  return <View key={`e-${ci}`} style={{ width: 42, height: 60 }} />
                                }
                                const dayKey = `${repeatYear}-${repeatMonth}-${day}`
                                const selected = repeatDays.has(dayKey)
                                const weekday = DAY_ABBR[(rFirstDay + day - 1) % 7]
                                const today = new Date()
                                const isToday = today.getFullYear() === repeatYear && today.getMonth() === repeatMonth && today.getDate() === day
                                return (
                                  <Pressable
                                    key={day}
                                    onPress={() => setRepeatDays(prev => { const n = new Set(prev); n.has(dayKey) ? n.delete(dayKey) : n.add(dayKey); return n })}
                                    style={{
                                      width: 42,
                                      height: 60,
                                      borderRadius: 20,
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundColor: selected ? '#132C95' : '#fff',
                                      borderWidth: selected ? 0 : 0.5,
                                      borderColor: '#A9AFB7',
                                      gap: 2,
                                    }}
                                  >
                                    <Span style={{ fontSize: 14, fontWeight: '600', color: selected ? '#fff' : '#111827' }}>{day}</Span>
                                    <Span style={{ fontSize: 9, color: selected ? '#fff' : '#7E8792' }}>{weekday}</Span>
                                    {isToday && (
                                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF7A0C' }} />
                                    )}
                                  </Pressable>
                                )
                              })}
                            </View>
                          ))}
                        </View>
                      </View>
                    )
                  })()}

                  <Pressable
                    onPress={() => {
                      const medKey = `${rec.id}|${medIdx}`
                      setReminderSetMedKeys(prev => { const n = new Set(prev); n.add(medKey); return n })
                      if (isLast) {
                        setReminderSavedIds(prev => { const n = new Set(prev); n.add(rec.id); return n })
                        setShowTimerModal(null)
                      } else {
                        setRepeatDays(new Set())
                        setReminderTimes(prev => {
                          const next = { ...prev }
                          const nextMed = rec.medicines[medIdx + 1]
                          const sessions = ['morning', 'noon', 'evening']
                          sessions.forEach(s => { delete next[`${rec.id}|${nextMed}|${s}`] })
                          return next
                        })
                        setShowTimerModal({ recId: rec.id, medIdx: medIdx + 1 })
                      }
                    }}
                    className='mt-6 items-center rounded-2xl py-3'
                    style={{ backgroundColor: PRIMARY }}
                  >
                    <Span className='text-sm font-semibold text-white'>{isLast ? 'Lưu nhắc nhở' : 'Tiếp theo'}</Span>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        )
      })()}

      {/* ---- Record detail page ---- */}
      {detailMedId !== null && (() => {
        const rec = medRecords.find(r => r.id === detailMedId)
        if (!rec) return null
        const notifOff = notifOffIds.has(rec.id)
        return (
          <View className='absolute inset-0 z-50 flex-col bg-slate-50'>
            <View className='flex-row items-center border-b border-gray-100 bg-white px-4 py-3'>
              <Pressable onPress={() => setDetailMedId(null)} className='mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#374151' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                  <polyline points='15 18 9 12 15 6'/>
                </svg>
              </Pressable>
              <Span className='flex-1 text-sm font-semibold text-gray-800'>Chi tiết hồ sơ</Span>
              <View className='rounded-full px-2 py-0.5' style={{ backgroundColor: rec.status === 'active' ? '#dcfce7' : '#f3f4f6' }}>
                <Span className='text-[9px] font-medium' style={{ color: rec.status === 'active' ? '#16a34a' : '#6b7280' }}>
                  {rec.status === 'active' ? 'Đang uống' : 'Đã kết thúc'}
                </Span>
              </View>
            </View>
            <ScrollView className='flex-1 px-4 py-4'>
              <View className='mb-3 rounded-2xl bg-white p-4 shadow-sm'>
                <Span className='mb-1 text-base font-bold text-gray-900'>{rec.disease}</Span>
                <View className='mb-1 flex-row items-center gap-1.5'>
                  <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/>
                  </svg>
                  <Span className='text-[11px] text-gray-400'>{rec.date}</Span>
                  <Span className='text-[11px] text-gray-300'>|</Span>
                  <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/>
                  </svg>
                  <Span className='text-[11px] text-gray-400'>{rec.prescriber}</Span>
                </View>
                <View className='mt-1 flex-row items-center gap-1.5'>
                  <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>
                  </svg>
                  <Span className='text-[11px] text-gray-400'>{rec.dose} - {rec.frequency} - {rec.duration}</Span>
                </View>
              </View>
              <View className='mb-3 rounded-2xl bg-orange-50 p-4'>
                <View className='mb-2 flex-row items-center justify-between'>
                  <View className='flex-row items-center gap-2'>
                    <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='#ea580c' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/>
                      <line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/>
                    </svg>
                    <Span className='text-xs font-semibold text-orange-700'>Đơn thuốc</Span>
                  </View>
                  <Pressable onPress={() => { setDetailMedId(null); setPrescriptionRec(rec) }}>
                    <Span className='text-[10px] font-medium' style={{ color: PRIMARY }}>Xem ảnh</Span>
                  </Pressable>
                </View>
                {rec.medicines.map(med => (
                  <View key={med} className='mb-1 flex-row items-center gap-2 last:mb-0'>
                    <View className='h-1.5 w-1.5 rounded-full bg-orange-400' />
                    <Span className='text-sm font-medium text-orange-800'>{med}</Span>
                  </View>
                ))}
              </View>
              <View className='mb-3 rounded-2xl bg-white p-4 shadow-sm'>
                <View className='mb-3 flex-row items-center justify-between'>
                  <Span className='text-xs font-semibold text-gray-700'>Hình ảnh đơn thuốc</Span>
                  <Pressable className='flex-row items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5'>
                    <Span className='text-[10px] font-medium' style={{ color: PRIMARY }}>+ Thêm</Span>
                  </Pressable>
                </View>
                <View className='items-center justify-center rounded-xl border border-dashed border-gray-200 py-5'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#d1d5db' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                    <rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/>
                  </svg>
                  <Span className='mt-2 text-[10px] text-gray-300'>Chưa có hình ảnh đơn thuốc</Span>
                </View>
              </View>
              <View className='mb-4 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm'>
                <View className='flex-row items-center gap-2'>
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke={notifOff ? '#9ca3af' : PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    {notifOff
                      ? <><path d='M13.73 21a2 2 0 0 1-3.46 0'/><path d='M18.63 13A17.89 17.89 0 0 1 18 8'/><path d='M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14'/><path d='M18 8a6 6 0 0 0-9.33-5'/><line x1='1' y1='1' x2='23' y2='23'/></>
                      : <><path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/></>
                    }
                  </svg>
                  <Span className='text-xs text-gray-600'>{notifOff ? 'Thông báo đã tắt' : 'Thông báo đang bật'}</Span>
                </View>
                <Pressable
                  onPress={() => setNotifOffIds(prev => { const n = new Set(prev); notifOff ? n.delete(rec.id) : n.add(rec.id); return n })}
                  className='rounded-full px-3 py-1.5'
                  style={{ backgroundColor: notifOff ? '#f3f4f6' : '#eff6ff' }}
                >
                  <Span className='text-[11px] font-medium' style={{ color: notifOff ? '#6b7280' : PRIMARY }}>{notifOff ? 'Bật lại' : 'Tắt'}</Span>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        )
      })()}

      {/* ---- Filter modal ---- */}
      {showFilter && (
        <View className='absolute inset-0 z-50 justify-end bg-black/40'>
          <Pressable className='flex-1' onPress={() => setShowFilter(false)} />
          <View className='rounded-t-3xl bg-white' style={{ maxHeight: '80%' }}>
            <ScrollView>
              <View className='p-4'>
                <View className='mb-4 flex-row items-center justify-between'>
                  <Span className='text-sm font-semibold text-gray-800'>Bộ lọc</Span>
                  <Pressable onPress={() => setShowFilter(false)} className='h-7 w-7 items-center justify-center rounded-full bg-gray-100'>
                    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='2.5' strokeLinecap='round'>
                      <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
                    </svg>
                  </Pressable>
                </View>

                <Span className='mb-2 text-[10px] font-semibold text-gray-400'>TÊN BỆNH</Span>
                <View className='mb-4'>
                  {allDiseases.map(d => (
                    <Pressable
                      key={d}
                      onPress={() => setFilterDiseases(prev => { const n = new Set(prev); n.has(d) ? n.delete(d) : n.add(d); return n })}
                      className='mb-2 flex-row items-center gap-2'
                    >
                      <View
                        className='h-4 w-4 items-center justify-center rounded-sm border'
                        style={{ borderColor: filterDiseases.has(d) ? PRIMARY : '#d1d5db', backgroundColor: filterDiseases.has(d) ? PRIMARY : '#fff' }}
                      >
                        {filterDiseases.has(d) && (
                          <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='3.5' strokeLinecap='round'>
                            <polyline points='20 6 9 17 4 12'/>
                          </svg>
                        )}
                      </View>
                      <Span className='text-xs text-gray-700'>{d}</Span>
                    </Pressable>
                  ))}
                </View>

                <Span className='mb-2 text-[10px] font-semibold text-gray-400'>TÊN THUỐC</Span>
                <View className='mb-4'>
                  {allMedicines.map(m => (
                    <Pressable
                      key={m}
                      onPress={() => setFilterMedicines(prev => { const n = new Set(prev); n.has(m) ? n.delete(m) : n.add(m); return n })}
                      className='mb-2 flex-row items-center gap-2'
                    >
                      <View
                        className='h-4 w-4 items-center justify-center rounded-sm border'
                        style={{ borderColor: filterMedicines.has(m) ? PRIMARY : '#d1d5db', backgroundColor: filterMedicines.has(m) ? PRIMARY : '#fff' }}
                      >
                        {filterMedicines.has(m) && (
                          <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='3.5' strokeLinecap='round'>
                            <polyline points='20 6 9 17 4 12'/>
                          </svg>
                        )}
                      </View>
                      <Span className='text-xs text-gray-700'>{m}</Span>
                    </Pressable>
                  ))}
                </View>

                <Span className='mb-2 text-[10px] font-semibold text-gray-400'>NƠI KHÁM</Span>
                <View className='mb-6'>
                  {allPlaces.map(p => (
                    <Pressable
                      key={p}
                      onPress={() => setFilterPlaces(prev => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n })}
                      className='mb-2 flex-row items-center gap-2'
                    >
                      <View
                        className='h-4 w-4 items-center justify-center rounded-sm border'
                        style={{ borderColor: filterPlaces.has(p) ? PRIMARY : '#d1d5db', backgroundColor: filterPlaces.has(p) ? PRIMARY : '#fff' }}
                      >
                        {filterPlaces.has(p) && (
                          <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='3.5' strokeLinecap='round'>
                            <polyline points='20 6 9 17 4 12'/>
                          </svg>
                        )}
                      </View>
                      <Span className='text-xs text-gray-700'>{p}</Span>
                    </Pressable>
                  ))}
                </View>

                <View className='flex-row gap-3'>
                  <Pressable
                    onPress={() => { setFilterDiseases(new Set()); setFilterMedicines(new Set()); setFilterPlaces(new Set()) }}
                    className='flex-1 items-center rounded-2xl border border-gray-200 py-3'
                  >
                    <Span className='text-sm font-medium text-gray-500'>Xóa kết quả</Span>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowFilter(false)}
                    className='flex-1 items-center rounded-2xl py-3'
                    style={{ backgroundColor: PRIMARY }}
                  >
                    <Span className='text-sm font-semibold text-white'>
                      Xem kết quả ({displayRecords.length})
                    </Span>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* ---- Calendar modal ---- */}
      {showCalendar && (
        <View className='absolute inset-0 z-50 items-center justify-end bg-black/40'>
          <View className='w-full rounded-t-3xl bg-white p-4'>
            <View className='mb-3 flex-row items-center justify-between'>
              <Pressable onPress={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }}>
                <Span className='px-2 text-lg font-bold' style={{ color: PRIMARY }}>{'<'}</Span>
              </Pressable>
              <Span className='text-sm font-semibold text-gray-800'>{MONTHS[calMonth]} {calYear}</Span>
              <Pressable onPress={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }}>
                <Span className='px-2 text-lg font-bold' style={{ color: PRIMARY }}>{'>'}</Span>
              </Pressable>
            </View>
            <View className='mb-1 flex-row'>
              {DAYS_IN_WEEK.map(d => (
                <View key={d} className='flex-1 items-center'>
                  <Span className='text-[10px] font-semibold text-gray-400'>{d}</Span>
                </View>
              ))}
            </View>
            <View className='flex-row flex-wrap'>
              {calCells.map((day, idx) => (
                <View key={idx} className='items-center justify-center' style={{ width: '14.28%', paddingVertical: 4 }}>
                  {day ? (
                    <Pressable
                      onPress={() => toggleCalDay(calYear, calMonth, day)}
                      className='h-7 w-7 items-center justify-center rounded-full'
                      style={isCalSelected(calYear, calMonth, day) ? { backgroundColor: PRIMARY } : {}}
                    >
                      <Span className='text-[11px]' style={{ color: isCalSelected(calYear, calMonth, day) ? '#fff' : '#1a1a2e', fontWeight: isCalSelected(calYear, calMonth, day) ? '600' : '400' }}>
                        {day}
                      </Span>
                    </Pressable>
                  ) : <View className='h-7 w-7' />}
                </View>
              ))}
            </View>
            <Pressable onPress={() => setShowCalendar(false)} className='mt-3 items-center rounded-xl py-3' style={{ backgroundColor: PRIMARY }}>
              <Span className='text-sm font-semibold text-white'>Xác nhận</Span>
            </Pressable>
          </View>
        </View>
      )}

      {/* ---- Section more bottom sheet ---- */}
      {showSectionMore && (
        <View className='absolute inset-0 z-50 justify-end bg-black/30'>
          <Pressable className='flex-1' onPress={() => setShowSectionMore(false)} />
          <View className='rounded-t-3xl bg-white p-4'>
            <View className='mb-3 items-center'>
              <View className='h-1 w-10 rounded-full bg-gray-200' />
            </View>
            {[
              {
                label: 'Xuất PDF',
                icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/></svg>,
              },
              {
                label: 'Chia sẻ',
                icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><line x1='8.59' y1='13.51' x2='15.42' y2='17.49'/><line x1='15.41' y1='6.51' x2='8.59' y2='10.49'/></svg>,
              },
            ].map(item => (
              <Pressable key={item.label} onPress={() => setShowSectionMore(false)} className='flex-row items-center gap-3 rounded-xl px-3 py-3'>
                {item.icon}
                <Span className='text-sm text-gray-800'>{item.label}</Span>
              </Pressable>
            ))}
            <Pressable onPress={() => setShowSectionMore(false)} className='mt-2 items-center rounded-2xl border border-gray-200 py-3'>
              <Span className='text-sm font-medium text-gray-500'>Hủy</Span>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView className='flex-1 bg-slate-50'>

        {/* Tab buttons */}
        <View className='mt-8 flex-row gap-4' style={{ marginHorizontal: 17 }}>
          <Pressable
            onPress={() => setActiveSection('history')}
            className='flex-1 items-center justify-center'
            style={[{ height: 44, borderRadius: 28 }, activeSection === 'history' ? tabActive : tabInactive]}
          >
            <Span style={{ color: activeSection === 'history' ? '#5B352B' : '#754539', fontSize: 13, fontWeight: activeSection === 'history' ? '500' : '400' }}>
              Lịch sử uống thuốc
            </Span>
          </Pressable>
          <Pressable
            onPress={() => setActiveSection('lookup')}
            className='flex-1 items-center justify-center'
            style={[{ height: 44, borderRadius: 28 }, activeSection === 'lookup' ? tabActive : tabInactive]}
          >
            <Span style={{ color: activeSection === 'lookup' ? '#5B352B' : '#754539', fontSize: 13, fontWeight: activeSection === 'lookup' ? '500' : '400' }}>
              Tra cứu thuốc
            </Span>
          </Pressable>
        </View>

        {/* Search bar + calendar */}
        <View className='mt-6 flex-row items-center gap-2' style={{ marginHorizontal: 32 }}>
          <View className='flex-1 flex-row items-center gap-1.5 rounded-full border px-3' style={{ height: 32, borderColor: '#CAE3FF', backgroundColor: '#fff' }}>
            <input
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              placeholder='Tìm kiếm...'
              style={{ flex: 1, fontSize: 11, color: '#374151', background: 'transparent', outline: 'none', border: 'none' } as any}
            />
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/>
            </svg>
          </View>
          <Pressable onPress={() => setShowCalendar(true)} className='h-9 w-9 items-center justify-center rounded-full bg-white' style={{ borderWidth: 1, borderColor: '#CAE3FF' }}>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/>
            </svg>
          </Pressable>
        </View>

        {/* ---- Lịch sử uống thuốc ---- */}
        {activeSection === 'history' && (
          <View className='mb-4' style={{ marginHorizontal: 20, marginTop: 20 }}>
            <View className='mb-2 flex-row items-center' style={{ gap: 12 }}>
              <Span className='text-sm font-semibold text-gray-800'>Lịch sử uống thuốc</Span>
              <Pressable onPress={() => setShowMedicineTracker(true)} className='h-7 w-7 items-center justify-center rounded-full bg-blue-50'>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/>
                  <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/>
                </svg>
              </Pressable>
            </View>

            <View className='mb-3 flex-row gap-2'>
              {([...sortOptions, 'Bộ lọc'] as const).map(opt => {
                const isFilterBtn = opt === 'Bộ lọc'
                const isActive = isFilterBtn ? filterCount > 0 : sort === opt
                return (
                  <Pressable
                    key={opt}
                    onPress={() => isFilterBtn ? setShowFilter(true) : setSort(opt as typeof sort)}
                    className={['rounded-full px-3 py-1', isActive ? 'bg-blue-600' : 'border border-gray-200 bg-white']}
                  >
                    <Span className={['text-[10px] font-medium', isActive ? 'text-white' : 'text-gray-500']}>
                      {isFilterBtn && filterCount > 0 ? `Bộ lọc (${displayRecords.length})` : opt}
                    </Span>
                  </Pressable>
                )
              })}
            </View>

            {displayRecords.map(rec => {
              const notifOff = notifOffIds.has(rec.id)
              const isExpanded = expandedRecId === rec.id
              const doseLabel = rec.status === 'active'
                ? `đang uống ${rec.doseCount} liều`
                : `đã uống đủ ${rec.doseCount} liều`
              return (
                <View key={rec.id}>
                  <View className='mb-1.5 flex-row items-center gap-2'>
                    <View className='h-1.5 w-1.5 rounded-full bg-blue-600' />
                    <Span className='text-[10px] font-semibold text-blue-600'>{rec.date}</Span>
                    <View className='flex-1 border-t border-blue-100' />
                  </View>
                  <View className='mb-4 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm'>

                    {/* Row 1: disease - dose label | notif + more */}
                    <View className='mb-2 flex-row items-center justify-between'>
                      <Span className='flex-1 pr-2 text-xs font-semibold text-gray-800'>
                        {rec.disease}
                        <Span className='font-normal text-gray-400'> - </Span>
                        <Span className='font-normal' style={{ color: rec.status === 'active' ? '#2563eb' : '#16a34a' }}>{doseLabel}</Span>
                      </Span>
                      <View className='flex-row items-center gap-2'>
                        <Pressable onPress={() => setRecordMoreId(rec.id)} className='h-7 w-7 items-center justify-center'>
                          <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2.5' strokeLinecap='round'>
                            <circle cx='5' cy='12' r='1'/><circle cx='12' cy='12' r='1'/><circle cx='19' cy='12' r='1'/>
                          </svg>
                        </Pressable>
                        <Pressable
                          onPress={() => setShowReminderModalId(rec.id)}
                          className='h-7 w-7 items-center justify-center'
                        >
                          <svg width='16' height='16' viewBox='0 0 24 24' fill={reminderSavedIds.has(rec.id) ? '#3B82F6' : 'none'} stroke={reminderSavedIds.has(rec.id) ? '#3B82F6' : '#9ca3af'} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/>
                          </svg>
                        </Pressable>
                      </View>
                    </View>

                    {/* Row 2: Đơn thuốc + document icon */}
                    <Pressable onPress={() => setPrescriptionRec(rec)} className='mb-2 flex-row items-center gap-1.5'>
                      <Span className='text-[11px] text-gray-500'>Đơn thuốc:</Span>
                      <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/>
                        <line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/>
                      </svg>
                    </Pressable>

                    {/* Row 3: medicine list */}
                    <View className='mb-2' style={{ gap: 3 }}>
                      {rec.medicines.map(med => (
                        <View key={med} className='flex-row items-center gap-1.5'>
                          <View className='h-1 w-1 rounded-full bg-gray-400' />
                          <Span className='text-[11px] text-gray-700'>{med}</Span>
                        </View>
                      ))}
                    </View>

                    {/* Row 4: xem chi tiết */}
                    <Pressable
                      onPress={() => setExpandedRecId(isExpanded ? null : rec.id)}
                      className='mt-1 flex-row items-center justify-center gap-1 border-t border-gray-100 pt-2'
                    >
                      <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                        {isExpanded ? <polyline points='18 15 12 9 6 15'/> : <polyline points='6 9 12 15 18 9'/>}
                      </svg>
                      <Span className='text-[9px] text-gray-400'>{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</Span>
                    </Pressable>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <View className='mt-2 border-t border-gray-100 pt-2' style={{ gap: 4 }}>
                        <View className='flex-row items-center gap-1.5'>
                          <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>
                          </svg>
                          <Span className='text-[10px] text-gray-500'>{rec.dose} - {rec.frequency}</Span>
                        </View>
                        <View className='flex-row items-center gap-1.5'>
                          <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/>
                          </svg>
                          <Span className='text-[10px] italic text-gray-400'>{rec.duration}</Span>
                        </View>
                        <View className='flex-row items-center gap-1.5'>
                          <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/>
                          </svg>
                          <Span className='text-[10px] text-gray-500'>{rec.prescriber}</Span>
                        </View>
                        <Pressable onPress={() => setDetailMedId(rec.id)} className='mt-1 self-start rounded-full bg-blue-50 px-3 py-1'>
                          <Span className='text-[10px] font-medium' style={{ color: PRIMARY }}>Xem ho so day du</Span>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* ---- Tra cứu thuốc ---- */}
        {activeSection === 'lookup' && (
          <View className='mb-4' style={{ marginHorizontal: 20, marginTop: 20 }}>
            <View className='mb-3 flex-row items-center gap-2'>
              <Span className='text-sm font-semibold text-gray-800'>Tra cứu thuốc</Span>
              {searchQuery.trim() !== '' && (
                <Span className='text-[10px] text-gray-400'>({filteredDrugs.length} kết quả)</Span>
              )}
            </View>

            {filteredDrugs.length === 0 ? (
              <View className='items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-10'>
                <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#d1d5db' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                  <circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/>
                </svg>
                <Span className='mt-2 text-[11px] text-gray-300'>Không tìm thấy thuốc phù hợp</Span>
              </View>
            ) : (
              filteredDrugs.map(drug => {
                const isExpanded = expandedDrugId === drug.id
                return (
                  <Pressable
                    key={drug.id}
                    onPress={() => setExpandedDrugId(isExpanded ? null : drug.id)}
                    className='mb-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm'
                  >
                    <View className='flex-row items-start justify-between'>
                      <View className='flex-1 pr-2'>
                        <Span className='text-xs font-semibold text-gray-800'>{drug.name}</Span>
                        <Span className='text-[10px] text-gray-400'>{drug.ingredient}</Span>
                      </View>
                      <View className='rounded-full px-2 py-0.5' style={{ backgroundColor: '#eff6ff' }}>
                        <Span className='text-[9px] font-medium' style={{ color: PRIMARY }}>{drug.category}</Span>
                      </View>
                    </View>

                    <View className='mt-2 flex-row items-center gap-1.5'>
                      <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#16a34a' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                        <polyline points='22 12 18 12 15 21 9 3 6 12 2 12'/>
                      </svg>
                      <Span className='flex-1 text-[10px] text-gray-600'>{drug.uses}</Span>
                    </View>

                    {isExpanded && (
                      <View className='mt-2.5'>
                        <View style={{ borderTopWidth: 1, borderColor: '#f3f4f6', marginBottom: 8 }} />
                        <View className='mb-2 flex-row items-start gap-1.5'>
                          <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginTop: 1, flexShrink: 0 } as any}>
                            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/>
                          </svg>
                          <Span className='flex-1 text-[10px] text-gray-700'>Liều dùng: {drug.dosage}</Span>
                        </View>
                        <View className='flex-row items-start gap-1.5'>
                          <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#f59e0b' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginTop: 1, flexShrink: 0 } as any}>
                            <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/>
                          </svg>
                          <Span className='flex-1 text-[10px] text-amber-700'>Lưu ý: {drug.warning}</Span>
                        </View>
                      </View>
                    )}

                    <View className='mt-2 flex-row items-center justify-center gap-1'>
                      <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                        {isExpanded ? <polyline points='18 15 12 9 6 15'/> : <polyline points='6 9 12 15 18 9'/>}
                      </svg>
                      <Span className='text-[9px] text-gray-400'>{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</Span>
                    </View>
                  </Pressable>
                )
              })
            )}
          </View>
        )}

      </ScrollView>
    </YhLayout>
  )
}
