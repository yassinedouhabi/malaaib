import Link from 'next/link'
import { CalendarX } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPlayerBookings } from '@/lib/queries/bookings'
import { PitchTypeBadge } from '@/components/ui/pitch-type-badge'
import type { BookingStatus, PitchType } from '@/types'

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending:   'قيد الانتظار',
  confirmed: 'مؤكد',
  cancelled: 'ملغى',
  completed: 'مكتمل',
}

const STATUS_STYLE: Record<BookingStatus, string> = {
  pending:   'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  confirmed: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  completed: 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400',
}

export default async function BookingsPage() {
  let bookings: Awaited<ReturnType<typeof getPlayerBookings>> = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      bookings = await getPlayerBookings(supabase, user.id)
    }
  } catch {
    // fall through to empty state
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-5">حجوزاتي</h1>

      {bookings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map(booking => {
            const pitch = booking.pitch
            const field = pitch?.field

            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden"
              >
                {/* Top: field name + status */}
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {field?.name ?? '—'}
                    </p>
                    {field?.city && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{field.city}</p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 ring-current/20 ${STATUS_STYLE[booking.status]}`}>
                    {STATUS_LABEL[booking.status]}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-slate-700/50 mx-4" />

                {/* Details */}
                <div className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-2 items-center">
                  {/* Date + time */}
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block">التاريخ والوقت</span>
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-latin" dir="ltr">
                      {booking.date}  {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
                    </span>
                  </div>

                  {/* Pitch */}
                  {pitch && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">الملعب</span>
                      <span className="text-sm text-gray-700 dark:text-gray-200">{pitch.name}</span>
                      <PitchTypeBadge type={pitch.type as PitchType} variant="badge" size="xs" />
                    </div>
                  )}
                </div>

                {/* Booking code chip */}
                <div className="px-4 pb-4">
                  <span className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green text-xs font-bold font-latin px-3 py-1.5 rounded-full tracking-wider">
                    {booking.booking_code}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
        <CalendarX className="w-7 h-7 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-bold text-gray-700 dark:text-gray-200 text-base">ما كاين حتى حجز</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">احجز ملعبك دابا</p>
      </div>
      <Link
        href="/fields"
        className="mt-2 bg-brand-green hover:bg-brand-green-dark text-white font-bold px-6 py-3 rounded-2xl text-sm transition-colors shadow-sm shadow-brand-green/30"
      >
        شوف الملاعب
      </Link>
    </div>
  )
}
