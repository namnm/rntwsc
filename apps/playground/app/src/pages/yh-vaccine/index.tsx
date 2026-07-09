'use client'

import { useState } from 'react'

import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { YhLayout } from '#/components/yh-layout'

// ---- History data ----

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
  { id: 'v01', disease: 'Lao', vaccine: 'BCG', dose: 'Mũi 1', date: '22-8-20', status: 'done', place: 'VNVC An Phú' },
  { id: 'v02', disease: 'Viêm gan B', vaccine: 'Hexaxim', dose: 'Mũi 1', date: '22-8-20', status: 'done', place: 'VNVC An Phú' },
  { id: 'v03', disease: 'Viêm gan B', vaccine: 'Hexaxim', dose: 'Mũi 2', date: '22-12-20', status: 'done', place: 'VNVC An Phú' },
  { id: 'v04', disease: 'Viêm gan B', vaccine: 'Hexaxim', dose: 'Mũi 3', date: '22-6-21', status: 'done', place: 'VNVC An Phú' },
  { id: 'v05', disease: 'Bạch hầu/Uốn ván/Ho gà/Bại liệt', vaccine: 'Infanrix-IPV-HIB', dose: 'Mũi 1', date: '22-10-20', status: 'done', place: 'VNVC An Phú' },
  { id: 'v06', disease: 'Bạch hầu/Uốn ván/Ho gà/Bại liệt', vaccine: 'Infanrix-IPV-HIB', dose: 'Mũi 2', date: '22-12-20', status: 'done', place: 'VNVC An Phú' },
  { id: 'v07', disease: 'Bạch hầu/Uốn ván/Ho gà/Bại liệt', vaccine: 'Infanrix-IPV-HIB', dose: 'Mũi 3', date: '22-01-21', status: 'done', place: 'VNVC An Phú' },
  { id: 'v08', disease: 'Bạch hầu/Uốn ván/Ho gà/Bại liệt', vaccine: 'Tetraxim', dose: 'Mũi 4', date: '22-02-21', status: 'pending', place: '-' },
  { id: 'v09', disease: 'Phế cầu', vaccine: 'Prevenar 13', dose: 'Mũi 1', date: '22-10-20', status: 'done', place: 'VNVC An Phú' },
  { id: 'v10', disease: 'Phế cầu', vaccine: 'Prevenar 13', dose: 'Mũi 2', date: '22-12-20', status: 'done', place: 'VNVC An Phú' },
  { id: 'v11', disease: 'Phế cầu', vaccine: 'Prevenar 13', dose: 'Mũi 3', date: '22-02-21', status: 'done', place: 'VNVC An Phú' },
  { id: 'v12', disease: 'Rotavirus', vaccine: 'Rotarix', dose: 'Mũi 1', date: '22-10-20', status: 'done', place: 'VNVC An Phú' },
  { id: 'v13', disease: 'Rotavirus', vaccine: 'Rotarix', dose: 'Mũi 2', date: '22-12-20', status: 'done', place: 'VNVC An Phú' },
  { id: 'v14', disease: 'Cúm mùa', vaccine: 'Influvac', dose: 'Mũi 1', date: '22-1-22', status: 'done', place: 'VNVC An Phú' },
  { id: 'v15', disease: 'Cúm mùa', vaccine: 'Influvac', dose: 'Nhắc lại', date: '-', status: 'pending', place: '-' },
  { id: 'v16', disease: 'Thủy đậu', vaccine: 'Varivax', dose: 'Mũi 1', date: '22-6-21', status: 'done', place: 'VNVC Quận 7' },
  { id: 'v17', disease: 'Thủy đậu', vaccine: 'Varivax', dose: 'Mũi 2', date: '-', status: 'pending', place: '-' },
  { id: 'v18', disease: 'Sởi/Quai bị/Rubella', vaccine: 'MMR II', dose: 'Mũi 1', date: '22-8-21', status: 'done', place: 'VNVC Quận 7' },
  { id: 'v19', disease: 'Sởi/Quai bị/Rubella', vaccine: 'MMR II', dose: 'Mũi 2', date: '-', status: 'pending', place: '-' },
  { id: 'v20', disease: 'Viêm não Nhật Bản', vaccine: 'Jevax', dose: 'Mũi 1', date: '-', status: 'pending', place: '-' },
  { id: 'v21', disease: 'Viêm não Nhật Bản', vaccine: 'Jevax', dose: 'Mũi 2', date: '-', status: 'pending', place: '-' },
  { id: 'v22', disease: 'Viêm gan A', vaccine: 'Havrix', dose: 'Mũi 1', date: '-', status: 'pending', place: '-' },
  { id: 'v23', disease: 'Viêm gan A', vaccine: 'Havrix', dose: 'Mũi 2', date: '-', status: 'pending', place: '-' },
  { id: 'v24', disease: 'Thương hàn', vaccine: 'Typhim Vi', dose: 'Mũi 1', date: '-', status: 'pending', place: '-' },
  { id: 'v25', disease: 'HPV', vaccine: 'Gardasil 9', dose: 'Mũi 1', date: '-', status: 'pending', place: '-' },
]

// ---- Schedule data ----

type ScheduleRow = {
  id: string
  disease: string
  vaccine: string
  schedule: string
  timing: string
  priority: 'required' | 'recommended' | 'optional'
}

const TARGET_OPTIONS = [
  'Người trưởng thành khỏe mạnh',
  'Trẻ em 0 - 24 tháng tuổi',
  'Trẻ em 2 - 9 tuổi',
  'Trẻ em 10 - 18 tuổi',
  'Tiền hôn nhân',
  'Chuẩn bị mang thai / Đang mang thai',
  'Du lịch nước ngoài',
  'Theo nghề nghiệp',
  'Người có bệnh nền',
  'Người cao tuổi (50+)',
]

const scheduleByTarget: Record<string, ScheduleRow[]> = {
  'Người trưởng thành khỏe mạnh': [
    { id: 'at01', disease: 'Cúm mùa', vaccine: 'Influvac', schedule: '1 mũi/năm', timing: 'Hằng năm', priority: 'recommended' },
    { id: 'at02', disease: 'Uốn ván/Bạch hầu/Ho gà', vaccine: 'Tdap', schedule: '1 mũi, nhắc 10 năm', timing: '19+ tuổi', priority: 'recommended' },
    { id: 'at03', disease: 'Sởi/Quai bị/Rubella', vaccine: 'MMR II', schedule: '1-2 mũi', timing: 'Nếu chưa miễn dịch', priority: 'recommended' },
    { id: 'at04', disease: 'Viêm gan B', vaccine: 'HepB', schedule: '3 mũi (0-1-6th)', timing: 'Nếu chưa tiêm', priority: 'recommended' },
    { id: 'at05', disease: 'Viêm gan A', vaccine: 'Havrix', schedule: '2 mũi (0-6th)', timing: 'Nguy cơ cao', priority: 'optional' },
    { id: 'at06', disease: 'Thủy đậu', vaccine: 'Varivax', schedule: '2 mũi', timing: 'Nếu chưa mắc', priority: 'recommended' },
    { id: 'at07', disease: 'HPV', vaccine: 'Gardasil 9', schedule: '3 mũi (0-2-6th)', timing: '19-26 tuổi', priority: 'recommended' },
    { id: 'at08', disease: 'Thương hàn', vaccine: 'Typhim Vi', schedule: '1 mũi/3 năm', timing: 'Nguy cơ cao', priority: 'optional' },
    { id: 'at09', disease: 'Viêm não Nhật Bản', vaccine: 'Jevax', schedule: '3 mũi + nhắc', timing: 'Vùng dịch tễ', priority: 'optional' },
    { id: 'at10', disease: 'Phế cầu', vaccine: 'Prevenar 13', schedule: '1 mũi', timing: 'Có chỉ định', priority: 'optional' },
  ],
  'Trẻ em 0 - 24 tháng tuổi': [
    { id: 'ch01', disease: 'Lao', vaccine: 'BCG', schedule: '1 mũi', timing: 'Sơ sinh', priority: 'required' },
    { id: 'ch02', disease: 'Viêm gan B', vaccine: 'HepB + Hexaxim', schedule: '3 mũi', timing: 'Sơ sinh, 2th, 6th', priority: 'required' },
    { id: 'ch03', disease: 'Bạch hầu/Uốn ván/Ho gà/Bại liệt', vaccine: 'Infanrix-IPV-HIB', schedule: '3 mũi + 1 nhắc', timing: '2-4-6-18 tháng', priority: 'required' },
    { id: 'ch04', disease: 'Phế cầu', vaccine: 'Prevenar 13', schedule: '3 mũi + 1 nhắc', timing: '2-4-6-12 tháng', priority: 'recommended' },
    { id: 'ch05', disease: 'Rotavirus', vaccine: 'Rotarix', schedule: '2 mũi', timing: '2-4 tháng', priority: 'recommended' },
    { id: 'ch06', disease: 'Cúm mùa', vaccine: 'Influvac', schedule: '2 mũi lần đầu', timing: '6 tháng tuổi', priority: 'recommended' },
    { id: 'ch07', disease: 'Thủy đậu', vaccine: 'Varivax', schedule: '1 mũi', timing: '12 tháng tuổi', priority: 'recommended' },
    { id: 'ch08', disease: 'Sởi/Quai bị/Rubella', vaccine: 'MMR II', schedule: '1 mũi', timing: '12 tháng tuổi', priority: 'required' },
    { id: 'ch09', disease: 'Viêm não Nhật Bản', vaccine: 'Jevax', schedule: '3 mũi', timing: '12-13 tháng', priority: 'recommended' },
    { id: 'ch10', disease: 'Viêm gan A', vaccine: 'Havrix', schedule: '1 mũi đầu', timing: '12 tháng tuổi', priority: 'optional' },
  ],
  'Trẻ em 2 - 9 tuổi': [
    { id: 'c2_01', disease: 'Cúm mùa', vaccine: 'Influvac', schedule: '1-2 mũi/năm', timing: 'Hằng năm', priority: 'recommended' },
    { id: 'c2_02', disease: 'Bạch hầu/Uốn ván/Bại liệt', vaccine: 'Tetraxim', schedule: 'Mũi 4 + nhắc lại', timing: '18th, 4-6 tuổi', priority: 'required' },
    { id: 'c2_03', disease: 'Sởi/Quai bị/Rubella', vaccine: 'MMR II', schedule: 'Mũi 2', timing: '4-6 tuổi', priority: 'required' },
    { id: 'c2_04', disease: 'Thủy đậu', vaccine: 'Varivax', schedule: 'Mũi 2', timing: '4-6 tuổi', priority: 'recommended' },
    { id: 'c2_05', disease: 'Viêm não Nhật Bản', vaccine: 'Jevax', schedule: '3 mũi + nhắc', timing: '12th+', priority: 'recommended' },
    { id: 'c2_06', disease: 'Viêm gan A', vaccine: 'Havrix', schedule: '2 mũi (0-6th)', timing: '12th+', priority: 'optional' },
    { id: 'c2_07', disease: 'Thương hàn', vaccine: 'Typhim Vi', schedule: '1 mũi/3 năm', timing: '2+ tuổi', priority: 'optional' },
    { id: 'c2_08', disease: 'HPV', vaccine: 'Gardasil 9', schedule: '3 mũi (0-2-6th)', timing: '9+ tuổi', priority: 'recommended' },
    { id: 'c2_09', disease: 'Phế cầu', vaccine: 'Prevenar 13', schedule: '1-2 mũi', timing: 'Nếu chưa tiêm', priority: 'optional' },
  ],
  'Trẻ em 10 - 18 tuổi': [
    { id: 't10_01', disease: 'Cúm mùa', vaccine: 'Influvac', schedule: '1 mũi/năm', timing: 'Hằng năm', priority: 'recommended' },
    { id: 't10_02', disease: 'Uốn ván/Bạch hầu/Ho gà', vaccine: 'Tdap', schedule: '1 mũi', timing: '11-12 tuổi', priority: 'recommended' },
    { id: 't10_03', disease: 'HPV', vaccine: 'Gardasil 9', schedule: '2-3 mũi', timing: '11-12 tuổi', priority: 'recommended' },
    { id: 't10_04', disease: 'Não mô cầu', vaccine: 'Menactra', schedule: '2 mũi', timing: '11-12 tuổi', priority: 'recommended' },
    { id: 't10_05', disease: 'Sởi/Quai bị/Rubella', vaccine: 'MMR II', schedule: 'Nhắc lại', timing: 'Nếu chưa đủ 2 mũi', priority: 'required' },
    { id: 't10_06', disease: 'Viêm gan A', vaccine: 'Havrix', schedule: '2 mũi (0-6th)', timing: 'Nếu chưa tiêm', priority: 'optional' },
    { id: 't10_07', disease: 'Viêm gan B', vaccine: 'HepB', schedule: '3 mũi (0-1-6th)', timing: 'Nếu chưa tiêm', priority: 'required' },
    { id: 't10_08', disease: 'Thủy đậu', vaccine: 'Varivax', schedule: '2 mũi', timing: 'Nếu chưa mắc', priority: 'recommended' },
    { id: 't10_09', disease: 'Thương hàn', vaccine: 'Typhim Vi', schedule: '1 mũi/3 năm', timing: 'Nguy cơ cao', priority: 'optional' },
  ],
  'Tiền hôn nhân': [
    { id: 'pm01', disease: 'Sởi/Quai bị/Rubella', vaccine: 'MMR II', schedule: '2 mũi', timing: 'Trước hôn nhân', priority: 'recommended' },
    { id: 'pm02', disease: 'HPV', vaccine: 'Gardasil 9', schedule: '3 mũi (0-2-6th)', timing: '19-26 tuổi', priority: 'recommended' },
    { id: 'pm03', disease: 'Viêm gan B', vaccine: 'HepB', schedule: '3 mũi (0-1-6th)', timing: 'Nếu chưa tiêm', priority: 'recommended' },
    { id: 'pm04', disease: 'Thủy đậu', vaccine: 'Varivax', schedule: '2 mũi', timing: 'Nếu chưa mắc', priority: 'recommended' },
    { id: 'pm05', disease: 'Cúm mùa', vaccine: 'Influvac', schedule: '1 mũi/năm', timing: 'Hằng năm', priority: 'recommended' },
    { id: 'pm06', disease: 'Viêm gan A', vaccine: 'Havrix', schedule: '2 mũi (0-6th)', timing: 'Nếu chưa tiêm', priority: 'optional' },
    { id: 'pm07', disease: 'Thương hàn', vaccine: 'Typhim Vi', schedule: '1 mũi/3 năm', timing: 'Nguy cơ cao', priority: 'optional' },
    { id: 'pm08', disease: 'Uốn ván/Bạch hầu', vaccine: 'Td', schedule: 'Nhắc lại', timing: 'Nếu chưa nhắc', priority: 'recommended' },
  ],
  'Chuẩn bị mang thai / Đang mang thai': [
    { id: 'pg01', disease: 'Cúm mùa', vaccine: 'Influvac', schedule: '1 mũi', timing: 'Mọi giai đoạn thai kỳ', priority: 'required' },
    { id: 'pg02', disease: 'Uốn ván/Bạch hầu/Ho gà', vaccine: 'Tdap', schedule: '1 mũi', timing: '27-36 tuần thai', priority: 'required' },
    { id: 'pg03', disease: 'Sởi/Quai bị/Rubella', vaccine: 'MMR II', schedule: '2 mũi', timing: 'Trước khi mang thai', priority: 'recommended' },
    { id: 'pg04', disease: 'Viêm gan B', vaccine: 'HepB', schedule: '3 mũi (0-1-6th)', timing: 'Trước mang thai', priority: 'recommended' },
    { id: 'pg05', disease: 'Thủy đậu', vaccine: 'Varivax', schedule: '2 mũi', timing: 'Trước khi mang thai', priority: 'recommended' },
    { id: 'pg06', disease: 'Viêm gan A', vaccine: 'Havrix', schedule: '2 mũi (0-6th)', timing: 'Trước mang thai', priority: 'optional' },
    { id: 'pg07', disease: 'Phế cầu', vaccine: 'Prevenar 13', schedule: '1 mũi', timing: 'Nếu có chỉ định', priority: 'optional' },
  ],
  'Du lịch nước ngoài': [
    { id: 'tr01', disease: 'Viêm gan A', vaccine: 'Havrix', schedule: '2 mũi (0-6th)', timing: 'Trước khi đi', priority: 'recommended' },
    { id: 'tr02', disease: 'Viêm gan B', vaccine: 'HepB', schedule: '3 mũi (0-1-6th)', timing: 'Trước khi đi', priority: 'recommended' },
    { id: 'tr03', disease: 'Thương hàn', vaccine: 'Typhim Vi', schedule: '1 mũi', timing: '2 tuần trước đi', priority: 'recommended' },
    { id: 'tr04', disease: 'Viêm não Nhật Bản', vaccine: 'Jevax', schedule: '3 mũi', timing: 'Vùng Châu Á', priority: 'recommended' },
    { id: 'tr05', disease: 'Sốt vàng', vaccine: 'YF-VAX', schedule: '1 mũi', timing: 'Châu Phi, Nam Mỹ', priority: 'required' },
    { id: 'tr06', disease: 'Não mô cầu', vaccine: 'Menactra', schedule: '1 mũi', timing: 'Vùng não mô cầu', priority: 'optional' },
    { id: 'tr07', disease: 'Tả', vaccine: 'Dukoral', schedule: '2 liều', timing: 'Vùng có dịch', priority: 'optional' },
    { id: 'tr08', disease: 'Cúm mùa', vaccine: 'Influvac', schedule: '1 mũi/năm', timing: 'Hằng năm', priority: 'recommended' },
    { id: 'tr09', disease: 'Bại liệt', vaccine: 'OPV/IPV', schedule: 'Nhắc lại', timing: 'Vùng có dịch', priority: 'recommended' },
  ],
  'Theo nghề nghiệp': [
    { id: 'oc01', disease: 'Cúm mùa', vaccine: 'Influvac', schedule: '1 mũi/năm', timing: 'Nhân viên y tế', priority: 'required' },
    { id: 'oc02', disease: 'Viêm gan B', vaccine: 'HepB', schedule: '3 mũi (0-1-6th)', timing: 'Nhân viên y tế', priority: 'required' },
    { id: 'oc03', disease: 'Sởi/Quai bị/Rubella', vaccine: 'MMR II', schedule: '2 mũi', timing: 'Nhân viên y tế', priority: 'required' },
    { id: 'oc04', disease: 'Thủy đậu', vaccine: 'Varivax', schedule: '2 mũi', timing: 'Nhân viên y tế', priority: 'recommended' },
    { id: 'oc05', disease: 'Viêm gan A', vaccine: 'Havrix', schedule: '2 mũi (0-6th)', timing: 'Ngành thực phẩm', priority: 'recommended' },
    { id: 'oc06', disease: 'Thương hàn', vaccine: 'Typhim Vi', schedule: '1 mũi/3 năm', timing: 'Ngành thực phẩm', priority: 'recommended' },
    { id: 'oc07', disease: 'Uốn ván', vaccine: 'Td', schedule: 'Nhắc 10 năm', timing: 'Công nhân xây dựng', priority: 'recommended' },
    { id: 'oc08', disease: 'Lao', vaccine: 'BCG', schedule: 'Nhắc lại', timing: 'Nhân viên y tế', priority: 'recommended' },
    { id: 'oc09', disease: 'Não mô cầu', vaccine: 'Menactra', schedule: 'Theo lịch', timing: 'Phòng thí nghiệm', priority: 'optional' },
    { id: 'oc10', disease: 'Bại liệt', vaccine: 'IPV', schedule: 'Nhắc lại', timing: 'Nhân viên y tế', priority: 'recommended' },
  ],
  'Người có bệnh nền': [
    { id: 'cd01', disease: 'Cúm mùa', vaccine: 'Influvac', schedule: '1 mũi/năm', timing: 'Hằng năm', priority: 'required' },
    { id: 'cd02', disease: 'Phế cầu', vaccine: 'Prevenar 13 + Pneumovax', schedule: '1-2 mũi', timing: '1 lần/5 năm', priority: 'required' },
    { id: 'cd03', disease: 'Viêm gan B', vaccine: 'HepB', schedule: '3 mũi (0-1-6th)', timing: 'Bệnh gan, thận', priority: 'recommended' },
    { id: 'cd04', disease: 'Viêm gan A', vaccine: 'Havrix', schedule: '2 mũi (0-6th)', timing: 'Bệnh gan', priority: 'recommended' },
    { id: 'cd05', disease: 'Não mô cầu', vaccine: 'Menactra', schedule: 'Theo lịch', timing: 'Cắt lách, suy giảm MD', priority: 'recommended' },
    { id: 'cd06', disease: 'Hib', vaccine: 'Hib vaccine', schedule: '1 mũi', timing: 'Cắt lách', priority: 'recommended' },
    { id: 'cd07', disease: 'Uốn ván/Bạch hầu', vaccine: 'Td/Tdap', schedule: 'Nhắc 10 năm', timing: 'Tiểu đường, tim mạch', priority: 'recommended' },
    { id: 'cd08', disease: 'Zona', vaccine: 'Shingrix', schedule: '2 mũi (0-2-6th)', timing: '50+ tuổi', priority: 'recommended' },
  ],
  'Người cao tuổi (50+)': [
    { id: 'el01', disease: 'Cúm mùa', vaccine: 'Influvac', schedule: '1 mũi/năm', timing: 'Hằng năm', priority: 'required' },
    { id: 'el02', disease: 'Phế cầu', vaccine: 'Prevenar 13', schedule: '1 mũi', timing: 'Nếu chưa tiêm', priority: 'required' },
    { id: 'el03', disease: 'Zona', vaccine: 'Shingrix', schedule: '2 mũi (0-2-6th)', timing: '50+ tuổi', priority: 'recommended' },
    { id: 'el04', disease: 'Uốn ván/Bạch hầu', vaccine: 'Td', schedule: 'Nhắc 10 năm', timing: 'Nếu chưa nhắc', priority: 'recommended' },
    { id: 'el05', disease: 'Viêm gan B', vaccine: 'HepB', schedule: '3 mũi (0-1-6th)', timing: 'Nếu chưa tiêm', priority: 'recommended' },
    { id: 'el06', disease: 'Sởi/Quai bị/Rubella', vaccine: 'MMR II', schedule: '1 mũi', timing: 'Nếu chưa miễn dịch', priority: 'optional' },
    { id: 'el07', disease: 'Thủy đậu', vaccine: 'Varivax', schedule: '2 mũi', timing: 'Nếu chưa mắc', priority: 'optional' },
    { id: 'el08', disease: 'Viêm gan A', vaccine: 'Havrix', schedule: '2 mũi (0-6th)', timing: 'Nguy cơ cao', priority: 'optional' },
    { id: 'el09', disease: 'Não mô cầu', vaccine: 'Menactra', schedule: '1 mũi', timing: 'Suy giảm miễn dịch', priority: 'optional' },
  ],
}

// ---- Table constants ----

const DISEASE_WIDTH = 110
const HEADER_H = 36
const ROW_H = 52
const SCHEDULE_ROW_H = 48

type DiseaseGroup = { disease: string; records: VaccineRecord[] }

const buildGroups = (records: VaccineRecord[]): DiseaseGroup[] =>
  records.reduce<DiseaseGroup[]>((acc, rec) => {
    const last = acc[acc.length - 1]
    if (last && last.disease === rec.disease) {
      last.records.push(rec)
    } else {
      acc.push({ disease: rec.disease, records: [rec] })
    }
    return acc
  }, [])

const HISTORY_COLS = [
  { key: 'vaccine', label: 'Vaccine',   width: 92 },
  { key: 'dose',    label: 'Mũi',       width: 62 },
  { key: 'date',    label: 'Ngày',      width: 68 },
  { key: 'status',  label: 'Tiêm',      width: 76 },
  { key: 'place',   label: 'Nơi tiêm', width: 90 },
  { key: 'note',    label: 'Ghi chú',  width: 84 },
]

const SCHEDULE_COLS = [
  { key: 'vaccine',  label: 'Vaccine',    width: 100 },
  { key: 'schedule', label: 'Phác đồ',   width: 96 },
  { key: 'timing',   label: 'Thời điểm', width: 100 },
  { key: 'priority', label: 'Ưu tiên',   width: 88 },
  { key: 'note',     label: 'Ghi chú',   width: 88 },
]

const HISTORY_MIN_W = DISEASE_WIDTH + HISTORY_COLS.reduce((s, c) => s + c.width, 0)
const SCHEDULE_MIN_W = DISEASE_WIDTH + SCHEDULE_COLS.reduce((s, c) => s + c.width, 0)

const PRIMARY = '#132C95'

const PRIORITY_STYLE = {
  required:    { bg: '#fee2e2', text: '#dc2626', label: 'Bắt buộc' },
  recommended: { bg: '#eff6ff', text: '#2563eb', label: 'Khuyến nghị' },
  optional:    { bg: '#f3f4f6', text: '#6b7280', label: 'Tùy chọn' },
}

// ---- Component ----

export const YhVaccinePage = () => {
  const [activeSection, setActiveSection] = useState<'history' | 'schedule'>('history')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [scheduleNotes, setScheduleNotes] = useState<Record<string, string>>({})
  const [showHistoryMore, setShowHistoryMore] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState(TARGET_OPTIONS[0])
  const [showTargetMenu, setShowTargetMenu] = useState(false)
  return (
    <YhLayout activeTab='vaccine'>

      {/* Target audience bottom sheet */}
      {showTargetMenu && (
        <View className='absolute inset-0 z-50 justify-end bg-black/30'>
          <Pressable className='flex-1' onPress={() => setShowTargetMenu(false)} />
          <View className='rounded-t-3xl bg-white p-4'>
            <View className='mb-3 items-center'>
              <View className='h-1 w-10 rounded-full bg-gray-200' />
            </View>
            <Span className='mb-3 text-sm font-semibold text-gray-800'>Chọn đối tượng</Span>
            {TARGET_OPTIONS.map((opt, i) => (
              <Pressable
                key={opt}
                onPress={() => { setSelectedTarget(opt); setShowTargetMenu(false) }}
                className='flex-row items-center justify-between px-1 py-3'
                style={i < TARGET_OPTIONS.length - 1 ? { borderBottomWidth: 1, borderColor: '#f3f4f6' } : {}}
              >
                <Span className={['flex-1 text-xs', selectedTarget === opt ? 'font-semibold' : 'text-gray-700']} style={selectedTarget === opt ? { color: PRIMARY } : {}}>
                  {opt}
                </Span>
                {selectedTarget === opt && (
                  <View className='h-4 w-4 items-center justify-center rounded-full' style={{ backgroundColor: PRIMARY }}>
                    <svg width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='3.5' strokeLinecap='round'>
                      <polyline points='20 6 9 17 4 12' />
                    </svg>
                  </View>
                )}
              </Pressable>
            ))}
            <Pressable onPress={() => setShowTargetMenu(false)} className='mt-3 items-center rounded-2xl border border-gray-200 py-3'>
              <Span className='text-sm font-medium text-gray-500'>Hủy</Span>
            </Pressable>
          </View>
        </View>
      )}

      {/* Section tabs */}
      <View className='flex-row gap-4 bg-white px-4 py-3' style={{ borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
        {([
          { key: 'history' as const, label: 'Lịch sử tiêm chủng' },
          { key: 'schedule' as const, label: 'Phác đồ tiêm chủng' },
        ]).map(({ key, label }) => {
          const isActive = activeSection === key
          return (
            <Pressable
              key={key}
              onPress={() => setActiveSection(key)}
              className='flex-1 items-center justify-center'
              style={[
                { height: 44, borderRadius: 28 },
                isActive
                  ? { backgroundColor: '#FEA755', borderWidth: 1, borderColor: '#754539' }
                  : { backgroundColor: '#F6E5D2', borderWidth: 1, borderColor: 'rgba(117,69,57,0.2)' },
              ]}
            >
              <Span style={{ color: isActive ? '#5B352B' : '#754539', fontSize: 13, fontWeight: isActive ? '500' : '400' }}>
                {label}
              </Span>
            </Pressable>
          )
        })}
      </View>

      {/* Single scrollable area for all content */}
      <ScrollView className='flex-1 bg-gray-50'>

        {/* ---- Lịch sử tiêm chủng ---- */}
        {activeSection === 'history' && (() => {
          const groups = buildGroups(vaccineRecords)
          return (
            <View className='p-3'>
              <View className='relative mb-2 flex-row items-center gap-1.5' style={{ zIndex: 20 }}>
                <Span className='text-sm font-semibold text-gray-800'>Lịch sử tiêm chủng</Span>
                <Pressable onPress={() => setShowHistoryMore(v => !v)} className='h-6 w-6 items-center justify-center'>
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2.5' strokeLinecap='round'>
                    <circle cx='5' cy='12' r='1' /><circle cx='12' cy='12' r='1' /><circle cx='19' cy='12' r='1' />
                  </svg>
                </Pressable>
                {showHistoryMore && (
                  <View className='absolute left-0 top-7 z-10 overflow-hidden rounded-2xl bg-white shadow-lg' style={{ borderWidth: 1, borderColor: '#f0f0f0', minWidth: 140 }}>
                    {[
                      { label: 'Xuất PDF', icon: <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#ef4444' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='12' y1='12' x2='12' y2='18'/><line x1='9' y1='15' x2='15' y2='15'/></svg> },
                      { label: 'Chia sẻ', icon: <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#3b82f6' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><line x1='8.59' y1='13.51' x2='15.42' y2='17.49'/><line x1='15.41' y1='6.51' x2='8.59' y2='10.49'/></svg> },
                      { label: 'Chỉnh sửa', icon: <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/><path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/></svg> },
                    ].map((item, i, arr) => (
                      <Pressable key={item.label} onPress={() => setShowHistoryMore(false)} className='flex-row items-center gap-3 px-4 py-3'>
                        {item.icon}
                        <Span className='text-xs text-gray-700'>{item.label}</Span>
                        {i < arr.length - 1 && <View className='absolute bottom-0 left-4 right-4' style={{ height: 1, backgroundColor: '#f3f4f6' }} />}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <View className='overflow-hidden rounded-2xl bg-white' style={{ borderWidth: 1, borderColor: '#e5e7eb' }}>
                <View style={{ overflowX: 'auto' } as any}>
                  <View style={{ minWidth: HISTORY_MIN_W }}>
                    <View className='flex-row bg-slate-50' style={{ height: HEADER_H, borderBottomWidth: 1, borderColor: '#e5e7eb' }}>
                      <View className='items-center justify-center bg-slate-50' style={{ width: DISEASE_WIDTH, height: HEADER_H, position: 'sticky', left: 0, zIndex: 2, borderRightWidth: 1, borderColor: '#e5e7eb' } as any}>
                        <Span className='text-[10px] font-semibold text-gray-500'>Bệnh</Span>
                      </View>
                      {HISTORY_COLS.map((col, i) => (
                        <View key={col.key} className='items-center justify-center' style={{ width: col.width, height: HEADER_H, borderRightWidth: i < HISTORY_COLS.length - 1 ? 1 : 0, borderColor: '#e5e7eb' }}>
                          <Span className='text-[10px] font-semibold text-gray-500'>{col.label}</Span>
                        </View>
                      ))}
                    </View>
                    {groups.map((group, gi) =>
                      group.records.map((rec, ri) => {
                        const isGroupEnd = ri === group.records.length - 1
                        const isTableEnd = gi === groups.length - 1 && isGroupEnd
                        return (
                          <View key={rec.id} className='flex-row' style={{ height: ROW_H, borderBottomWidth: isTableEnd ? 0 : 1, borderColor: isGroupEnd ? '#e5e7eb' : '#f3f4f6' }}>
                            <View className='items-center justify-center bg-white px-2' style={{ width: DISEASE_WIDTH, position: 'sticky', left: 0, zIndex: 1, borderRightWidth: 1, borderColor: '#e5e7eb' } as any}>
                              {ri === 0 && <Span className='text-center text-[10px] leading-3.5 text-gray-700'>{group.disease}</Span>}
                            </View>
                            <View className='items-center justify-center px-2' style={{ width: HISTORY_COLS[0].width, borderRightWidth: 1, borderColor: '#f3f4f6' }}>
                              <Span className='text-center text-[10px] font-semibold leading-3.5 text-gray-800'>{rec.vaccine}</Span>
                            </View>
                            <View className='items-center justify-center px-1' style={{ width: HISTORY_COLS[1].width, borderRightWidth: 1, borderColor: '#f3f4f6' }}>
                              <Span className='text-[10px] text-gray-700'>{rec.dose}</Span>
                            </View>
                            <View className='items-center justify-center px-1' style={{ width: HISTORY_COLS[2].width, borderRightWidth: 1, borderColor: '#f3f4f6' }}>
                              <Span className='text-[10px] text-gray-600'>{rec.date}</Span>
                            </View>
                            <View className='items-center justify-center px-1' style={{ width: HISTORY_COLS[3].width, borderRightWidth: 1, borderColor: '#f3f4f6' }}>
                              <View className={['rounded-full px-1.5 py-0.5', rec.status === 'done' ? 'bg-emerald-50' : 'bg-orange-50']}>
                                <Span className={['text-[9px] font-semibold', rec.status === 'done' ? 'text-emerald-600' : 'text-orange-500']}>
                                  {rec.status === 'done' ? 'Đã tiêm' : 'Chưa tiêm'}
                                </Span>
                              </View>
                            </View>
                            <View className='items-center justify-center px-2' style={{ width: HISTORY_COLS[4].width, borderRightWidth: 1, borderColor: '#f3f4f6' }}>
                              <Span className='text-center text-[10px] leading-3.5 text-gray-600'>{rec.place}</Span>
                            </View>
                            <View className='items-center justify-center px-2' style={{ width: HISTORY_COLS[5].width }}>
                              <input
                                placeholder='Ghi chú...'
                                value={notes[rec.id] || ''}
                                onChange={(e: any) => setNotes(prev => ({ ...prev, [rec.id]: e.target.value }))}
                                style={{ width: '100%', fontSize: 10, color: '#6b7280', background: 'transparent', outline: 'none', border: 'none', textAlign: 'center' } as any}
                              />
                            </View>
                          </View>
                        )
                      })
                    )}
                  </View>
                </View>
              </View>
            </View>
          )
        })()}

        {/* ---- Phác đồ tiêm chủng ---- */}
        {activeSection === 'schedule' && (() => {
          const rows = scheduleByTarget[selectedTarget] ?? []
          return (
            <View>
              <View className='flex-row items-center gap-3 bg-white px-3 py-2.5' style={{ borderBottomWidth: 1, borderColor: '#e5e7eb' }}>
                <Span className='text-xs font-semibold text-gray-700'>Đối tượng</Span>
                <Pressable onPress={() => setShowTargetMenu(true)} className='flex-row items-center gap-1.5 rounded-full py-1 pl-3 pr-2' style={{ backgroundColor: '#f0f3ff' }}>
                  <Span className='text-[11px] font-medium' style={{ color: PRIMARY }} numberOfLines={1}>{selectedTarget}</Span>
                  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke={PRIMARY} strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                    <polyline points='6 9 12 15 18 9' />
                  </svg>
                </Pressable>
              </View>
              <View className='p-3'>
                <View className='overflow-hidden rounded-2xl bg-white' style={{ borderWidth: 1, borderColor: '#e5e7eb' }}>
                  <View style={{ overflowX: 'auto' } as any}>
                    <View style={{ minWidth: SCHEDULE_MIN_W }}>
                      <View className='flex-row bg-slate-50' style={{ height: HEADER_H, borderBottomWidth: 1, borderColor: '#e5e7eb' }}>
                        <View className='items-center justify-center bg-slate-50' style={{ width: DISEASE_WIDTH, height: HEADER_H, position: 'sticky', left: 0, zIndex: 2, borderRightWidth: 1, borderColor: '#e5e7eb' } as any}>
                          <Span className='text-[10px] font-semibold text-gray-500'>Bệnh</Span>
                        </View>
                        {SCHEDULE_COLS.map((col, i) => (
                          <View key={col.key} className='items-center justify-center' style={{ width: col.width, height: HEADER_H, borderRightWidth: i < SCHEDULE_COLS.length - 1 ? 1 : 0, borderColor: '#e5e7eb' }}>
                            <Span className='text-[10px] font-semibold text-gray-500'>{col.label}</Span>
                          </View>
                        ))}
                      </View>
                      {rows.map((row, ri) => {
                        const isLast = ri === rows.length - 1
                        const ps = PRIORITY_STYLE[row.priority]
                        return (
                          <View key={row.id} className='flex-row' style={{ height: SCHEDULE_ROW_H, borderBottomWidth: isLast ? 0 : 1, borderColor: '#e5e7eb' }}>
                            <View className='items-center justify-center bg-white px-2' style={{ width: DISEASE_WIDTH, position: 'sticky', left: 0, zIndex: 1, borderRightWidth: 1, borderColor: '#e5e7eb' } as any}>
                              <Span className='text-center text-[10px] leading-3.5 text-gray-700'>{row.disease}</Span>
                            </View>
                            <View className='items-center justify-center px-2' style={{ width: SCHEDULE_COLS[0].width, borderRightWidth: 1, borderColor: '#f3f4f6' }}>
                              <Span className='text-center text-[10px] font-semibold leading-3.5 text-gray-800'>{row.vaccine}</Span>
                            </View>
                            <View className='items-center justify-center px-2' style={{ width: SCHEDULE_COLS[1].width, borderRightWidth: 1, borderColor: '#f3f4f6' }}>
                              <Span className='text-center text-[10px] leading-3.5 text-gray-600'>{row.schedule}</Span>
                            </View>
                            <View className='items-center justify-center px-2' style={{ width: SCHEDULE_COLS[2].width, borderRightWidth: 1, borderColor: '#f3f4f6' }}>
                              <Span className='text-center text-[10px] leading-3.5 text-gray-600'>{row.timing}</Span>
                            </View>
                            <View className='items-center justify-center px-1' style={{ width: SCHEDULE_COLS[3].width, borderRightWidth: 1, borderColor: '#f3f4f6' }}>
                              <View className='rounded-full px-1.5 py-0.5' style={{ backgroundColor: ps.bg }}>
                                <Span className='text-[9px] font-semibold' style={{ color: ps.text }}>{ps.label}</Span>
                              </View>
                            </View>
                            <View className='items-center justify-center px-2' style={{ width: SCHEDULE_COLS[4].width }}>
                              <input
                                placeholder='Ghi chú...'
                                value={scheduleNotes[row.id] || ''}
                                onChange={(e: any) => setScheduleNotes(prev => ({ ...prev, [row.id]: e.target.value }))}
                                style={{ width: '100%', fontSize: 10, color: '#6b7280', background: 'transparent', outline: 'none', border: 'none', textAlign: 'center' } as any}
                              />
                            </View>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )
        })()}


      </ScrollView>
    </YhLayout>
  )
}
