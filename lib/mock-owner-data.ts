import type { BookingStatus, PaymentMethod } from '@/types'

export interface MockOwnerBooking {
  id: string
  booking_code: string
  player_id: string
  pitch_id: string
  date: string
  start_time: string
  end_time: string
  status: BookingStatus
  payment_method: PaymentMethod
  total_price: number
  amount_paid: number
  amount_due_at_field: number
  commission_amount: number
  qr_code_hash: string
  is_walk_in: boolean
  owner_notes: string | null
  created_at: string
  pitch?: { id: string; name: string; type: string }
  player?: { id: string; full_name: string; phone: string }
}

function d(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

export function getMockOwnerBookings(): MockOwnerBooking[] {
  return [
    {
      id: 'ob-1', booking_code: 'ML-ADF432', player_id: 'p1',
      pitch_id: 'pitch-1a', date: d(0), start_time: '10:00:00', end_time: '11:00:00',
      status: 'confirmed', payment_method: 'pay_at_field',
      total_price: 200, amount_paid: 0, amount_due_at_field: 200,
      commission_amount: 0, qr_code_hash: 'h1', is_walk_in: false, owner_notes: null,
      created_at: d(0) + 'T08:00:00Z',
      pitch: { id: 'pitch-1a', name: 'الملعب الصغير 1', type: '5v5' },
      player: { id: 'p1', full_name: 'عمر بنعلي', phone: '+212661111111' },
    },
    {
      id: 'ob-2', booking_code: 'ML-BXK789', player_id: 'p2',
      pitch_id: 'pitch-1a', date: d(0), start_time: '14:00:00', end_time: '15:00:00',
      status: 'pending', payment_method: 'pay_at_field',
      total_price: 200, amount_paid: 0, amount_due_at_field: 200,
      commission_amount: 0, qr_code_hash: 'h2', is_walk_in: false, owner_notes: null,
      created_at: d(0) + 'T09:00:00Z',
      pitch: { id: 'pitch-1a', name: 'الملعب الصغير 1', type: '5v5' },
      player: { id: 'p2', full_name: 'سعيد الزهراوي', phone: '+212662222222' },
    },
    {
      id: 'ob-3', booking_code: 'ML-CDE123', player_id: 'p3',
      pitch_id: 'pitch-1b', date: d(0), start_time: '09:00:00', end_time: '10:00:00',
      status: 'confirmed', payment_method: 'pay_at_field',
      total_price: 350, amount_paid: 0, amount_due_at_field: 350,
      commission_amount: 0, qr_code_hash: 'h3', is_walk_in: false, owner_notes: null,
      created_at: d(0) + 'T07:00:00Z',
      pitch: { id: 'pitch-1b', name: 'الملعب المتوسط', type: '7v7' },
      player: { id: 'p3', full_name: 'يوسف الأمراني', phone: '+212663333333' },
    },
    {
      id: 'ob-4', booking_code: 'ML-FGH456', player_id: 'p4',
      pitch_id: 'pitch-1a', date: d(1), start_time: '11:00:00', end_time: '12:00:00',
      status: 'pending', payment_method: 'pay_at_field',
      total_price: 200, amount_paid: 0, amount_due_at_field: 200,
      commission_amount: 0, qr_code_hash: 'h4', is_walk_in: false, owner_notes: null,
      created_at: d(0) + 'T18:00:00Z',
      pitch: { id: 'pitch-1a', name: 'الملعب الصغير 1', type: '5v5' },
      player: { id: 'p4', full_name: 'أيوب الرامي', phone: '+212664444444' },
    },
    {
      id: 'ob-5', booking_code: 'ML-JKL321', player_id: 'p5',
      pitch_id: 'pitch-1b', date: d(2), start_time: '16:00:00', end_time: '17:00:00',
      status: 'confirmed', payment_method: 'cmi',
      total_price: 350, amount_paid: 350, amount_due_at_field: 0,
      commission_amount: 0, qr_code_hash: 'h5', is_walk_in: false, owner_notes: null,
      created_at: d(1) + 'T10:00:00Z',
      pitch: { id: 'pitch-1b', name: 'الملعب المتوسط', type: '7v7' },
      player: { id: 'p5', full_name: 'فاطمة الزهراء بنمسعود', phone: '+212665555555' },
    },
    {
      id: 'ob-6', booking_code: 'ML-MNP654', player_id: 'p6',
      pitch_id: 'pitch-1a', date: d(-1), start_time: '10:00:00', end_time: '11:00:00',
      status: 'completed', payment_method: 'pay_at_field',
      total_price: 200, amount_paid: 200, amount_due_at_field: 0,
      commission_amount: 0, qr_code_hash: 'h6', is_walk_in: false, owner_notes: null,
      created_at: d(-1) + 'T09:00:00Z',
      pitch: { id: 'pitch-1a', name: 'الملعب الصغير 1', type: '5v5' },
      player: { id: 'p6', full_name: 'كريم بنسالم', phone: '+212666666666' },
    },
    {
      id: 'ob-7', booking_code: 'ML-QRS987', player_id: 'p7',
      pitch_id: 'pitch-1b', date: d(-1), start_time: '15:00:00', end_time: '16:00:00',
      status: 'completed', payment_method: 'pay_at_field',
      total_price: 350, amount_paid: 350, amount_due_at_field: 0,
      commission_amount: 0, qr_code_hash: 'h7', is_walk_in: false, owner_notes: null,
      created_at: d(-1) + 'T14:00:00Z',
      pitch: { id: 'pitch-1b', name: 'الملعب المتوسط', type: '7v7' },
      player: { id: 'p7', full_name: 'نادية الطاهري', phone: '+212667777777' },
    },
  ]
}
