import type { SupabaseClient } from '@supabase/supabase-js'
import type { Field, BookingStatus } from '@/types'
import { MOCK_FIELDS } from '@/lib/mock-data'
import { getMockOwnerBookings, type MockOwnerBooking } from '@/lib/mock-owner-data'

export type OwnerBooking = MockOwnerBooking

export interface OwnerStats {
  todayCount: number
  todayRevenue: number
  pendingCount: number
  weekCount: number
}

function getWeekStart(): string {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().slice(0, 10)
}

export async function getOwnerField(
  supabase: SupabaseClient,
  ownerId: string
): Promise<Field> {
  try {
    const { data } = await supabase
      .from('fields')
      .select('*, pitches(*), field_photos(*)')
      .eq('owner_id', ownerId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (data) {
      const field = data as Field
      return {
        ...field,
        pitches: (field.pitches ?? []).filter(p => p.is_active),
      }
    }
  } catch {}

  const mock = MOCK_FIELDS[0]
  return { ...mock, pitches: (mock.pitches ?? []).filter(p => p.is_active) }
}

async function getPitchIds(supabase: SupabaseClient, fieldId: string): Promise<string[] | null> {
  const { data } = await supabase
    .from('pitches')
    .select('id')
    .eq('field_id', fieldId)
  return data?.map((p: { id: string }) => p.id) ?? null
}

export async function getOwnerBookings(
  supabase: SupabaseClient,
  fieldId: string,
  options: { date?: string; status?: BookingStatus } = {}
): Promise<OwnerBooking[]> {
  try {
    const pitchIds = await getPitchIds(supabase, fieldId)
    if (!pitchIds?.length) throw new Error('no pitches')

    let query = supabase
      .from('bookings')
      .select('*, pitch:pitches(id, name, type), player:users(id, full_name, phone)')
      .in('pitch_id', pitchIds)
      .order('date', { ascending: false })
      .order('start_time', { ascending: true })

    if (options.date) query = query.eq('date', options.date)
    if (options.status) query = query.eq('status', options.status)

    const { data, error } = await query
    if (!error && data) return data as OwnerBooking[]
  } catch {}

  let bookings = getMockOwnerBookings()
  if (options.date) bookings = bookings.filter(b => b.date === options.date)
  if (options.status) bookings = bookings.filter(b => b.status === options.status)
  return bookings
}

export async function getOwnerStats(
  supabase: SupabaseClient,
  fieldId: string
): Promise<OwnerStats> {
  const todayStr = new Date().toISOString().slice(0, 10)
  const weekStart = getWeekStart()

  try {
    const pitchIds = await getPitchIds(supabase, fieldId)
    if (pitchIds?.length) {
      const { data } = await supabase
        .from('bookings')
        .select('date, status, total_price')
        .in('pitch_id', pitchIds)

      if (data) {
        const todayB = data.filter((b: { date: string; status: string }) =>
          b.date === todayStr && b.status !== 'cancelled'
        )
        return {
          todayCount: todayB.length,
          todayRevenue: todayB.reduce((s: number, b: { total_price: number }) => s + b.total_price, 0),
          pendingCount: data.filter((b: { status: string }) => b.status === 'pending').length,
          weekCount: data.filter((b: { date: string; status: string }) =>
            b.date >= weekStart && b.status !== 'cancelled'
          ).length,
        }
      }
    }
  } catch {}

  // Mock fallback
  const bookings = getMockOwnerBookings()
  const todayB = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled')
  return {
    todayCount: todayB.length,
    todayRevenue: todayB.reduce((s, b) => s + b.total_price, 0),
    pendingCount: bookings.filter(b => b.status === 'pending').length,
    weekCount: bookings.filter(b => b.date >= weekStart && b.status !== 'cancelled').length,
  }
}
