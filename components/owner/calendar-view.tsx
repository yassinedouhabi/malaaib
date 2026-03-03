'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getOwnerBookings, type OwnerBooking } from '@/lib/queries/owner'
import { PitchTypeBadge } from '@/components/ui/pitch-type-badge'
import { BookingActions } from '@/components/owner/booking-actions'
import type { Field, Pitch, PitchType, BookingStatus } from '@/types'

// ── Time helpers ──────────────────────────────────────────────────────────────

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number)
  const total = h * 60 + m
  return total === 0 ? 1440 : total
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function generateSlotTimes(open: string, close: string, duration: number): string[] {
  const times: string[] = []
  for (let s = timeToMins(open); s + duration <= timeToMins(close); s += duration) {
    times.push(minsToTime(s))
  }
  return times
}

// ── Date helpers ──────────────────────────────────────────────────────────────

const ARABIC_DAYS_FULL = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
  'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر',
]

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function offsetDate(base: string, offset: number): string {
  const d = new Date(base + 'T00:00:00')
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${ARABIC_DAYS_FULL[d.getDay()]} ${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]}`
}

// ── Status styles ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending: 'انتظار',
  confirmed: 'مؤكد',
  cancelled: 'ملغى',
  completed: 'مكتمل',
}

const STATUS_BORDER: Record<string, string> = {
  pending:   'border-s-amber-400',
  confirmed: 'border-s-brand-green',
  cancelled: 'border-s-red-400',
  completed: 'border-s-gray-300',
}

const STATUS_CHIP: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  confirmed: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  completed: 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400',
}

// ── Main component ────────────────────────────────────────────────────────────

interface CalendarViewProps {
  field: Field
}

export function CalendarView({ field }: CalendarViewProps) {
  const pitches = (field.pitches ?? []).filter(p => p.is_active)
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [selectedPitchId, setSelectedPitchId] = useState<string>(pitches[0]?.id ?? '')
  const [bookings, setBookings] = useState<OwnerBooking[]>([])
  const [loading, setLoading] = useState(false)

  const today = todayStr()
  const selectedPitch = pitches.find(p => p.id === selectedPitchId) ?? pitches[0]

  // Load bookings for selected date
  useEffect(() => {
    if (!field.id) return
    setLoading(true)
    const supabase = createClient()
    getOwnerBookings(supabase, field.id, { date: selectedDate }).then(data => {
      setBookings(data)
      setLoading(false)
    })
  }, [field.id, selectedDate])

  // Optimistic status update (keeps UI in sync in dev without DB)
  const handleStatusChange = useCallback((bookingId: string, newStatus: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
  }, [])

  // Build slot schedule for selected pitch
  const slotSchedule = buildSlotSchedule(selectedPitch, bookings, field)

  return (
    <div>
      {/* ── Date navigation ──────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5" dir="ltr">
        <button
          onClick={() => setSelectedDate(d => offsetDate(d, -1))}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          aria-label="اليوم السابق"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={2} />
        </button>

        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {formatDateLabel(selectedDate)}
          </p>
          {selectedDate === today && (
            <p className="text-[10px] text-brand-green font-medium mt-0.5">اليوم</p>
          )}
        </div>

        <button
          onClick={() => setSelectedDate(d => offsetDate(d, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          aria-label="اليوم التالي"
        >
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={2} />
        </button>

        {selectedDate !== today && (
          <button
            onClick={() => setSelectedDate(today)}
            className="text-xs font-semibold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-full hover:bg-brand-green/20 transition-colors"
          >
            اليوم
          </button>
        )}
      </div>

      {/* ── Pitch tabs ───────────────────────────────────── */}
      {pitches.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
          {pitches.map(pitch => (
            <button
              key={pitch.id}
              onClick={() => setSelectedPitchId(pitch.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all duration-150 ${
                selectedPitchId === pitch.id
                  ? 'bg-brand-green-surface dark:bg-brand-green/10 border-brand-green text-brand-green font-semibold'
                  : 'bg-white dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-brand-green/50'
              }`}
            >
              <PitchTypeBadge type={pitch.type} variant="badge" size="xs" />
              <span>{pitch.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Slot list ────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand-green" />
          <span className="text-sm text-gray-400 dark:text-gray-500">جار التحميل…</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {slotSchedule.map(({ slotTime, endTime, booking }) => (
            <SlotRow
              key={slotTime}
              slotTime={slotTime}
              endTime={endTime}
              booking={booking}
              pitch={selectedPitch}
              onStatusChange={handleStatusChange}
            />
          ))}
          {slotSchedule.length === 0 && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 px-4 py-8 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">ما كاين حتى وقت متاح</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Slot row ──────────────────────────────────────────────────────────────────

interface SlotRowProps {
  slotTime: string
  endTime: string
  booking: OwnerBooking | null
  pitch: Pitch | undefined
}

function SlotRow({ slotTime, endTime, booking, pitch }: SlotRowProps) {
  if (!booking) {
    return (
      <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/30 px-4 py-3 flex items-center gap-3">
        <span className="text-sm font-latin text-gray-400 dark:text-gray-500 w-28 flex-shrink-0" dir="ltr">
          {slotTime} – {endTime}
        </span>
        <span className="text-xs font-medium text-brand-green">متاح</span>
      </div>
    )
  }

  const borderClass = STATUS_BORDER[booking.status] ?? 'border-s-gray-300'

  return (
    <div className={`bg-white dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/50 border-s-4 ${borderClass} px-4 py-3`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-sm font-latin text-gray-700 dark:text-gray-200 flex-shrink-0" dir="ltr">
            {slotTime} – {endTime}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {booking.player?.full_name ?? '—'}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-latin mt-0.5">
              {booking.booking_code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {pitch && (
            <PitchTypeBadge type={pitch.type as PitchType} variant="badge" size="xs" />
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-current/20 ${STATUS_CHIP[booking.status]}`}>
            {STATUS_LABEL[booking.status]}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Build slot schedule from bookings ─────────────────────────────────────────

function buildSlotSchedule(
  pitch: Pitch | undefined,
  bookings: OwnerBooking[],
  field: Field
): { slotTime: string; endTime: string; booking: OwnerBooking | null }[] {
  if (!pitch) return []

  const hours = field.opening_hours.default
  const duration = pitch.slot_duration_minutes
  const slotTimes = generateSlotTimes(hours.open, hours.close, duration)

  // Build lookup: start_time (HH:MM) → booking (for this pitch)
  const bookingMap = new Map<string, OwnerBooking>()
  for (const b of bookings) {
    if (b.pitch_id === pitch.id) {
      bookingMap.set(b.start_time.slice(0, 5), b)
    }
  }

  return slotTimes.map((slotTime, i) => ({
    slotTime,
    endTime: slotTimes[i + 1] ?? minsToTime(timeToMins(slotTime) + duration),
    booking: bookingMap.get(slotTime) ?? null,
  }))
}
