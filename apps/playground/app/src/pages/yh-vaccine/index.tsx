'use client'

import { useState } from 'react'

import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { YhLayout } from '#/components/yh-layout'

type VaccineRecord = {
  id: string
  disease: string
  vaccine: string
  dose: string
  date: string
  status: 'done' | 'pending'
  place: string
}

const vaccineRecords: VaccineRecord[] = [
  {
    id: 'v01',
    disease: 'Lao',
    vaccine: 'BCG',
    dose: 'Mui 1',
    date: '22-8-20',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v02',
    disease: 'Viem gan B',
    vaccine: 'Hexaxim',
    dose: 'Mui 1',
    date: '22-8-20',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v03',
    disease: 'Viem gan B',
    vaccine: 'Hexaxim',
    dose: 'Mui 2',
    date: '22-12-20',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v04',
    disease: 'Viem gan B',
    vaccine: 'Hexaxim',
    dose: 'Mui 3',
    date: '22-6-21',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v05',
    disease: 'Bach hau/Uon van/Ho ga/Bai liet',
    vaccine: 'Infanrix-IPV-HIB',
    dose: 'Mui 1',
    date: '22-10-20',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v06',
    disease: 'Bach hau/Uon van/Ho ga/Bai liet',
    vaccine: 'Infanrix-IPV-HIB',
    dose: 'Mui 2',
    date: '22-12-20',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v07',
    disease: 'Bach hau/Uon van/Ho ga/Bai liet',
    vaccine: 'Infanrix-IPV-HIB',
    dose: 'Mui 3',
    date: '22-01-21',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v08',
    disease: 'Bach hau/Uon van/Ho ga/Bai liet',
    vaccine: 'Tetraxim',
    dose: 'Mui 4',
    date: '22-02-21',
    status: 'pending',
    place: '-',
  },
  {
    id: 'v09',
    disease: 'Phe cau',
    vaccine: 'Prevenar 13',
    dose: 'Mui 1',
    date: '22-10-20',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v10',
    disease: 'Phe cau',
    vaccine: 'Prevenar 13',
    dose: 'Mui 2',
    date: '22-12-20',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v11',
    disease: 'Phe cau',
    vaccine: 'Prevenar 13',
    dose: 'Mui 3',
    date: '22-02-21',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v12',
    disease: 'Rotavirus',
    vaccine: 'Rotarix',
    dose: 'Mui 1',
    date: '22-10-20',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v13',
    disease: 'Rotavirus',
    vaccine: 'Rotarix',
    dose: 'Mui 2',
    date: '22-12-20',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v14',
    disease: 'Cum mua',
    vaccine: 'Influvac',
    dose: 'Mui 1',
    date: '22-1-22',
    status: 'done',
    place: 'VNVC An Phu',
  },
  {
    id: 'v15',
    disease: 'Cum mua',
    vaccine: 'Influvac',
    dose: 'Nhac lai',
    date: '-',
    status: 'pending',
    place: '-',
  },
  {
    id: 'v16',
    disease: 'Thuy dau',
    vaccine: 'Varivax',
    dose: 'Mui 1',
    date: '22-6-21',
    status: 'done',
    place: 'VNVC Quan 7',
  },
  {
    id: 'v17',
    disease: 'Thuy dau',
    vaccine: 'Varivax',
    dose: 'Mui 2',
    date: '-',
    status: 'pending',
    place: '-',
  },
  {
    id: 'v18',
    disease: 'Soi/Quai bi/Rubella',
    vaccine: 'MMR II',
    dose: 'Mui 1',
    date: '22-8-21',
    status: 'done',
    place: 'VNVC Quan 7',
  },
  {
    id: 'v19',
    disease: 'Soi/Quai bi/Rubella',
    vaccine: 'MMR II',
    dose: 'Mui 2',
    date: '-',
    status: 'pending',
    place: '-',
  },
  {
    id: 'v20',
    disease: 'Viem nao Nhat Ban',
    vaccine: 'Jevax',
    dose: 'Mui 1',
    date: '-',
    status: 'pending',
    place: '-',
  },
  {
    id: 'v21',
    disease: 'Viem nao Nhat Ban',
    vaccine: 'Jevax',
    dose: 'Mui 2',
    date: '-',
    status: 'pending',
    place: '-',
  },
  {
    id: 'v22',
    disease: 'Viem gan A',
    vaccine: 'Havrix',
    dose: 'Mui 1',
    date: '-',
    status: 'pending',
    place: '-',
  },
  {
    id: 'v23',
    disease: 'Viem gan A',
    vaccine: 'Havrix',
    dose: 'Mui 2',
    date: '-',
    status: 'pending',
    place: '-',
  },
  {
    id: 'v24',
    disease: 'Thuong han',
    vaccine: 'Typhim Vi',
    dose: 'Mui 1',
    date: '-',
    status: 'pending',
    place: '-',
  },
  {
    id: 'v25',
    disease: 'HPV',
    vaccine: 'Gardasil 9',
    dose: 'Mui 1',
    date: '-',
    status: 'pending',
    place: '-',
  },
]

type ScheduleEntry = {
  id: string
  disease: string
  vaccine: string
  doses: Array<{ label: string; age: string; done: boolean }>
}

const scheduleEntries: ScheduleEntry[] = [
  {
    id: 's1',
    disease: 'Lao',
    vaccine: 'BCG',
    doses: [
      {
        label: 'Mui 1',
        age: 'So sinh',
        done: true,
      },
    ],
  },
  {
    id: 's2',
    disease: 'Viem gan B',
    vaccine: 'Hexaxim',
    doses: [
      {
        label: 'Mui 1',
        age: 'So sinh',
        done: true,
      },
      {
        label: 'Mui 2',
        age: '2 thang',
        done: true,
      },
      {
        label: 'Mui 3',
        age: '6 thang',
        done: true,
      },
    ],
  },
  {
    id: 's3',
    disease: 'Bach hau / Uon van / Ho ga / Bai liet',
    vaccine: 'Infanrix-IPV-HIB',
    doses: [
      {
        label: 'Mui 1',
        age: '2 thang',
        done: true,
      },
      {
        label: 'Mui 2',
        age: '4 thang',
        done: true,
      },
      {
        label: 'Mui 3',
        age: '6 thang',
        done: true,
      },
      {
        label: 'Mui 4',
        age: '18 thang',
        done: false,
      },
      {
        label: 'Nhac lai',
        age: '4-6 tuoi',
        done: false,
      },
    ],
  },
  {
    id: 's4',
    disease: 'Phe cau',
    vaccine: 'Prevenar 13',
    doses: [
      {
        label: 'Mui 1',
        age: '2 thang',
        done: true,
      },
      {
        label: 'Mui 2',
        age: '4 thang',
        done: true,
      },
      {
        label: 'Mui 3',
        age: '6 thang',
        done: true,
      },
      {
        label: 'Nhac lai',
        age: '12-15 thang',
        done: false,
      },
    ],
  },
  {
    id: 's5',
    disease: 'Rotavirus',
    vaccine: 'Rotarix',
    doses: [
      {
        label: 'Mui 1',
        age: '2 thang',
        done: true,
      },
      {
        label: 'Mui 2',
        age: '4 thang',
        done: true,
      },
    ],
  },
  {
    id: 's6',
    disease: 'Cum mua',
    vaccine: 'Influvac',
    doses: [
      {
        label: 'Mui 1',
        age: '6 thang',
        done: true,
      },
      {
        label: 'Nhac lai',
        age: 'Hang nam',
        done: false,
      },
    ],
  },
  {
    id: 's7',
    disease: 'Thuy dau',
    vaccine: 'Varivax',
    doses: [
      {
        label: 'Mui 1',
        age: '12 thang',
        done: true,
      },
      {
        label: 'Mui 2',
        age: '4-6 tuoi',
        done: false,
      },
    ],
  },
  {
    id: 's8',
    disease: 'Soi / Quai bi / Rubella',
    vaccine: 'MMR II',
    doses: [
      {
        label: 'Mui 1',
        age: '12 thang',
        done: true,
      },
      {
        label: 'Mui 2',
        age: '4-6 tuoi',
        done: false,
      },
    ],
  },
  {
    id: 's9',
    disease: 'Viem nao Nhat Ban',
    vaccine: 'Jevax',
    doses: [
      {
        label: 'Mui 1',
        age: '12 thang',
        done: false,
      },
      {
        label: 'Mui 2',
        age: '13 thang',
        done: false,
      },
      {
        label: 'Nhac lai',
        age: '3-4 nam',
        done: false,
      },
    ],
  },
  {
    id: 's10',
    disease: 'Viem gan A',
    vaccine: 'Havrix',
    doses: [
      {
        label: 'Mui 1',
        age: '12 thang',
        done: false,
      },
      {
        label: 'Mui 2',
        age: '6-12 thang sau',
        done: false,
      },
    ],
  },
  {
    id: 's11',
    disease: 'Thuong han',
    vaccine: 'Typhim Vi',
    doses: [
      {
        label: 'Mui 1',
        age: '2 tuoi',
        done: false,
      },
      {
        label: 'Nhac lai',
        age: 'Moi 3 nam',
        done: false,
      },
    ],
  },
  {
    id: 's12',
    disease: 'HPV',
    vaccine: 'Gardasil 9',
    doses: [
      {
        label: 'Mui 1',
        age: '9-26 tuoi',
        done: false,
      },
      {
        label: 'Mui 2',
        age: '2 thang sau',
        done: false,
      },
      {
        label: 'Mui 3',
        age: '6 thang sau',
        done: false,
      },
    ],
  },
]

const DISEASE_WIDTH = 110
const HEADER_H = 36
const ROW_H = 52

type DiseaseGroup = { disease: string; records: VaccineRecord[] }

const buildGroups = (records: VaccineRecord[]): DiseaseGroup[] =>
  records.reduce<DiseaseGroup[]>((acc, rec) => {
    const last = acc[acc.length - 1]
    if (last && last.disease === rec.disease) {
      last.records.push(rec)
    } else {
      acc.push({
        disease: rec.disease,
        records: [rec],
      })
    }
    return acc
  }, [])

const SCROLL_COLS = [
  {
    key: 'vaccine',
    label: 'Vaccine',
    width: 92,
  },
  {
    key: 'dose',
    label: 'Mui',
    width: 62,
  },
  {
    key: 'date',
    label: 'Ngay',
    width: 68,
  },
  {
    key: 'status',
    label: 'Tiem',
    width: 76,
  },
  {
    key: 'place',
    label: 'Noi tiem',
    width: 90,
  },
  {
    key: 'note',
    label: 'Ghi chu',
    width: 84,
  },
]

const TOTAL_MIN_WIDTH =
  DISEASE_WIDTH + SCROLL_COLS.reduce((s, c) => s + c.width, 0)

const PRIMARY = '#132C95'

export const YhVaccinePage = () => {
  const [activeSection, setActiveSection] = useState<'history' | 'schedule'>(
    'history',
  )
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [showHistoryMore, setShowHistoryMore] = useState(false)

  return (
    <YhLayout activeTab='vaccine' title='Tiem chung'>
      {/* Section tabs */}
      <View className='flex-row border-b border-gray-100 bg-white'>
        {[
          {
            key: 'history' as const,
            label: 'Lich su tiem chung',
          },
          {
            key: 'schedule' as const,
            label: 'Phac do tiem chung',
          },
        ].map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setActiveSection(key)}
            className='flex-1 items-center pt-3 pb-2.5'
            style={
              activeSection === key
                ? {
                    borderBottomWidth: 2,
                    borderColor: PRIMARY,
                  }
                : {}
            }
          >
            <Span
              className={[
                'text-[11px] font-semibold',
                activeSection === key ? 'text-blue-700' : 'text-gray-400',
              ]}
            >
              {label}
            </Span>
          </Pressable>
        ))}
      </View>

      {/* --- Lich su tiem chung --- */}
      {activeSection === 'history' &&
        (() => {
          const groups = buildGroups(vaccineRecords)
          return (
            <View className='flex-1 flex-col overflow-hidden bg-gray-50 p-3'>
              {/* Section title row */}
              <View className='relative mb-2 flex-row items-center gap-1.5'>
                <Span className='text-sm font-semibold text-gray-800'>
                  Lich su tiem chung
                </Span>
                <Pressable
                  onPress={() => setShowHistoryMore(v => !v)}
                  className='h-6 w-6 items-center justify-center'
                >
                  <svg
                    width='14'
                    height='14'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#9ca3af'
                    strokeWidth='2.5'
                    strokeLinecap='round'
                  >
                    <circle cx='5' cy='12' r='1' />
                    <circle cx='12' cy='12' r='1' />
                    <circle cx='19' cy='12' r='1' />
                  </svg>
                </Pressable>

                {showHistoryMore && (
                  <View
                    className='absolute top-7 left-0 z-10 overflow-hidden rounded-2xl bg-white shadow-lg'
                    style={{
                      borderWidth: 1,
                      borderColor: '#f0f0f0',
                      minWidth: 140,
                    }}
                  >
                    {[
                      {
                        label: 'Xuat PDF',
                        icon: (
                          <svg
                            width='14'
                            height='14'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='#ef4444'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          >
                            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                            <polyline points='14 2 14 8 20 8' />
                            <line x1='12' y1='12' x2='12' y2='18' />
                            <line x1='9' y1='15' x2='15' y2='15' />
                          </svg>
                        ),
                      },
                      {
                        label: 'Chia se',
                        icon: (
                          <svg
                            width='14'
                            height='14'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='#3b82f6'
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
                      },
                      {
                        label: 'Chinh sua',
                        icon: (
                          <svg
                            width='14'
                            height='14'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='#6b7280'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          >
                            <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                            <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
                          </svg>
                        ),
                      },
                    ].map((item, i, arr) => (
                      <Pressable
                        key={item.label}
                        onPress={() => setShowHistoryMore(false)}
                        className='flex-row items-center gap-3 px-4 py-3'
                      >
                        {item.icon}
                        <Span className='text-xs text-gray-700'>
                          {item.label}
                        </Span>
                        {i < arr.length - 1 && (
                          <View
                            className='absolute right-4 bottom-0 left-4'
                            style={{
                              height: 1,
                              backgroundColor: '#f3f4f6',
                            }}
                          />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* Table — flex-1 so it fills remaining height; single overflow:auto enables fixed scrollbar */}
              <View
                className='flex-1 overflow-hidden rounded-2xl bg-white'
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                }}
              >
                <View
                  style={
                    {
                      flex: 1,
                      overflow: 'auto',
                    } as any
                  }
                >
                  <View
                    style={{
                      minWidth: TOTAL_MIN_WIDTH,
                    }}
                  >
                    {/* Sticky header row */}
                    <View
                      className='flex-row bg-slate-50'
                      style={
                        {
                          position: 'sticky',
                          top: 0,
                          zIndex: 2,
                          height: HEADER_H,
                          borderBottomWidth: 1,
                          borderColor: '#e5e7eb',
                        } as any
                      }
                    >
                      <View
                        className='items-center justify-center bg-slate-50'
                        style={
                          {
                            width: DISEASE_WIDTH,
                            height: HEADER_H,
                            position: 'sticky',
                            left: 0,
                            zIndex: 3,
                            borderRightWidth: 1,
                            borderColor: '#e5e7eb',
                          } as any
                        }
                      >
                        <Span className='text-[10px] font-semibold text-gray-500'>
                          Benh
                        </Span>
                      </View>
                      {SCROLL_COLS.map((col, i) => (
                        <View
                          key={col.key}
                          className='items-center justify-center'
                          style={{
                            width: col.width,
                            height: HEADER_H,
                            borderRightWidth:
                              i < SCROLL_COLS.length - 1 ? 1 : 0,
                            borderColor: '#e5e7eb',
                          }}
                        >
                          <Span className='text-[10px] font-semibold text-gray-500'>
                            {col.label}
                          </Span>
                        </View>
                      ))}
                    </View>

                    {/* Data rows — disease name shown only on first row of each group */}
                    {groups.map((group, gi) =>
                      group.records.map((rec, ri) => {
                        const isGroupEnd = ri === group.records.length - 1
                        const isTableEnd =
                          gi === groups.length - 1 && isGroupEnd
                        const rowBorderColor = isGroupEnd
                          ? '#e5e7eb'
                          : '#f3f4f6'
                        const isFirst = ri === 0
                        return (
                          <View
                            key={rec.id}
                            className='flex-row'
                            style={{
                              height: ROW_H,
                              borderBottomWidth: isTableEnd ? 0 : 1,
                              borderColor: rowBorderColor,
                            }}
                          >
                            {/* Sticky disease cell — shows name only on first row of group */}
                            <View
                              className='items-center justify-center bg-white px-2'
                              style={
                                {
                                  width: DISEASE_WIDTH,
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 1,
                                  borderRightWidth: 1,
                                  borderColor: '#e5e7eb',
                                } as any
                              }
                            >
                              {isFirst && (
                                <Span className='text-center text-[10px] leading-3.5 text-gray-700'>
                                  {group.disease}
                                </Span>
                              )}
                            </View>

                            {/* Vaccine */}
                            <View
                              className='items-center justify-center px-2'
                              style={{
                                width: SCROLL_COLS[0].width,
                                borderRightWidth: 1,
                                borderColor: '#f3f4f6',
                              }}
                            >
                              <Span className='text-center text-[10px] leading-3.5 font-semibold text-gray-800'>
                                {rec.vaccine}
                              </Span>
                            </View>

                            {/* Dose */}
                            <View
                              className='items-center justify-center px-1'
                              style={{
                                width: SCROLL_COLS[1].width,
                                borderRightWidth: 1,
                                borderColor: '#f3f4f6',
                              }}
                            >
                              <Span className='text-[10px] text-gray-700'>
                                {rec.dose}
                              </Span>
                            </View>

                            {/* Date */}
                            <View
                              className='items-center justify-center px-1'
                              style={{
                                width: SCROLL_COLS[2].width,
                                borderRightWidth: 1,
                                borderColor: '#f3f4f6',
                              }}
                            >
                              <Span className='text-[10px] text-gray-600'>
                                {rec.date}
                              </Span>
                            </View>

                            {/* Status */}
                            <View
                              className='items-center justify-center px-1'
                              style={{
                                width: SCROLL_COLS[3].width,
                                borderRightWidth: 1,
                                borderColor: '#f3f4f6',
                              }}
                            >
                              <View
                                className={[
                                  'rounded-full px-1.5 py-0.5',
                                  rec.status === 'done'
                                    ? 'bg-emerald-50'
                                    : 'bg-orange-50',
                                ]}
                              >
                                <Span
                                  className={[
                                    'text-[9px] font-semibold',
                                    rec.status === 'done'
                                      ? 'text-emerald-600'
                                      : 'text-orange-500',
                                  ]}
                                >
                                  {rec.status === 'done'
                                    ? 'Da tiem'
                                    : 'Chua tiem'}
                                </Span>
                              </View>
                            </View>

                            {/* Place */}
                            <View
                              className='items-center justify-center px-2'
                              style={{
                                width: SCROLL_COLS[4].width,
                                borderRightWidth: 1,
                                borderColor: '#f3f4f6',
                              }}
                            >
                              <Span className='text-center text-[10px] leading-3.5 text-gray-600'>
                                {rec.place}
                              </Span>
                            </View>

                            {/* Note */}
                            <View
                              className='items-center justify-center px-2'
                              style={{
                                width: SCROLL_COLS[5].width,
                              }}
                            >
                              <input
                                placeholder='Ghi chu...'
                                value={notes[rec.id] || ''}
                                onChange={(e: any) =>
                                  setNotes(prev => ({
                                    ...prev,
                                    [rec.id]: e.target.value,
                                  }))
                                }
                                style={
                                  {
                                    width: '100%',
                                    fontSize: 10,
                                    color: '#6b7280',
                                    background: 'transparent',
                                    outline: 'none',
                                    border: 'none',
                                    textAlign: 'center',
                                  } as any
                                }
                              />
                            </View>
                          </View>
                        )
                      }),
                    )}
                  </View>
                </View>
              </View>
            </View>
          )
        })()}

      {/* --- Phac do tiem chung --- */}
      {activeSection === 'schedule' && (
        <ScrollView className='flex-1 bg-gray-50'>
          <View className='p-3'>
            <Span className='mb-2 text-[10px] font-semibold tracking-wide text-gray-400 uppercase'>
              Phac do tiem chung khuyen nghi
            </Span>

            <View className='gap-2.5'>
              {scheduleEntries.map(entry => {
                const doneCount = entry.doses.filter(d => d.done).length
                const total = entry.doses.length
                const allDone = doneCount === total

                return (
                  <View
                    key={entry.id}
                    className='rounded-2xl bg-white p-3.5'
                    style={{
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                    }}
                  >
                    <View className='mb-2.5 flex-row items-start justify-between'>
                      <View className='flex-1 pr-2'>
                        <Span className='text-xs font-semibold text-gray-800'>
                          {entry.disease}
                        </Span>
                        <Span className='mt-0.5 text-[10px] text-gray-400'>
                          {entry.vaccine}
                        </Span>
                      </View>
                      <View
                        className={[
                          'rounded-full px-2.5 py-0.5',
                          allDone ? 'bg-emerald-50' : 'bg-blue-50',
                        ]}
                      >
                        <Span
                          className={[
                            'text-[9px] font-semibold',
                            allDone ? 'text-emerald-600' : 'text-blue-600',
                          ]}
                        >
                          {doneCount}/{total} mui
                        </Span>
                      </View>
                    </View>

                    <View className='mb-3 h-1 overflow-hidden rounded-full bg-gray-100'>
                      <View
                        className={[
                          'h-full rounded-full',
                          allDone ? 'bg-emerald-400' : 'bg-blue-500',
                        ]}
                        style={{
                          width: `${(doneCount / total) * 100}%`,
                        }}
                      />
                    </View>

                    <View className='flex-row flex-wrap gap-1.5'>
                      {entry.doses.map((dose, di) => (
                        <View
                          key={di}
                          className={[
                            'rounded-xl px-2.5 py-1.5',
                            dose.done ? 'bg-emerald-50' : 'bg-gray-50',
                          ]}
                          style={{
                            borderWidth: 1,
                            borderColor: dose.done ? '#6ee7b7' : '#e5e7eb',
                          }}
                        >
                          <View className='flex-row items-center gap-1'>
                            {dose.done && (
                              <View className='h-3 w-3 items-center justify-center rounded-full bg-emerald-500'>
                                <Span className='text-[7px] font-bold text-white'>
                                  v
                                </Span>
                              </View>
                            )}
                            <Span
                              className={[
                                'text-[9px] font-semibold',
                                dose.done
                                  ? 'text-emerald-700'
                                  : 'text-gray-500',
                              ]}
                            >
                              {dose.label}
                            </Span>
                          </View>
                          <Span
                            className={[
                              'mt-0.5 text-[8px]',
                              dose.done ? 'text-emerald-500' : 'text-gray-400',
                            ]}
                          >
                            {dose.age}
                          </Span>
                        </View>
                      ))}
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </YhLayout>
  )
}
