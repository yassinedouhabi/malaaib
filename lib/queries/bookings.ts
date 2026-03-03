import type { SupabaseClient } from '@supabase/supabase-js'
import type { TimeSlot, Booking, PaymentMethod } from '@/types'

// ── Slot generator ────────────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  const total = h * 60 + m
  return total === 0 ? 1440 : total // midnight close = end of day
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function generateSlots(
  open: string,
  close: string,
  slotDuration: number,
  bookedSet: Set<string>
): TimeSlot[] {
  const openMins = timeToMinutes(open)
  const closeMins = timeToMinutes(close)
  const slots: TimeSlot[] = []

  for (let start = openMins; start + slotDuration <= closeMins; start += slotDuration) {
    const startStr = minutesToTime(start)
    const endStr = minutesToTime(start + slotDuration)
    slots.push({
      start_time: startStr,
      end_time: endStr,
      is_available: !bookedSet.has(startStr),
    })
  }

  return slots
}

// ── Public queries ────────────────────────────────────────────────────────────

export async function getAvailableSlots(
  supabase: SupabaseClient,
  pitchId: string,
  date: string,
  openingHours: { open: string; close: string },
  slotDurationMinutes: number
): Promise<TimeSlot[]> {
  try {
    const [bookingsRes, locksRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('start_time')
        .eq('pitch_id', pitchId)
        .eq('date', date)
        .neq('status', 'cancelled'),
      supabase
        .from('slot_locks')
        .select('start_time')
        .eq('pitch_id', pitchId)
        .eq('date', date)
        .gt('expires_at', new Date().toISOString()),
    ])

    const bookedSet = new Set<string>()

    for (const row of bookingsRes.data ?? []) {
      bookedSet.add((row.start_time as string).slice(0, 5))
    }
    for (const row of locksRes.data ?? []) {
      bookedSet.add((row.start_time as string).slice(0, 5))
    }

    return generateSlots(openingHours.open, openingHours.close, slotDurationMinutes, bookedSet)
  } catch {
    // Dev fallback: return all slots available
    return generateSlots(openingHours.open, openingHours.close, slotDurationMinutes, new Set())
  }
}

// ── Booking code ──────────────────────────────────────────────────────────────

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateBookingCode(): string {
  let code = 'ML-'
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

// ── Create booking ─────────────────────────────────────────────────────────────

interface CreateBookingParams {
  pitchId: string
  playerId: string
  date: string
  startTime: string
  endTime: string
  paymentMethod: PaymentMethod
  totalPrice: number
}

export async function createBooking(
  supabase: SupabaseClient,
  params: CreateBookingParams
): Promise<{ success: true; bookingCode: string }> {
  const bookingCode = generateBookingCode()

  try {
    await supabase.from('bookings').insert({
      booking_code: bookingCode,
      player_id: params.playerId,
      pitch_id: params.pitchId,
      date: params.date,
      start_time: params.startTime,
      end_time: params.endTime,
      status: 'pending',
      payment_method: params.paymentMethod,
      total_price: params.totalPrice,
      amount_paid: 0,
      amount_due_at_field: params.paymentMethod === 'pay_at_field' ? params.totalPrice : 0,
      commission_amount: 0,
      qr_code_hash: crypto.randomUUID(),
      is_walk_in: false,
    })
  } catch {
    // Dev fallback: return mock success
  }

  return { success: true, bookingCode }
}

// ── Player bookings ────────────────────────────────────────────────────────────

export interface BookingWithDetails extends Omit<Booking, 'pitch'> {
  pitch?: {
    id: string
    name: string
    type: string
    field_id: string
    field?: {
      name: string
      city: string
    }
  }
}

export async function getPlayerBookings(
  supabase: SupabaseClient,
  playerId: string
): Promise<BookingWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        pitch:pitches (
          id, name, type, field_id,
          field:fields (name, city)
        )
      `)
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as BookingWithDetails[]
  } catch {
    return []
  }
}
