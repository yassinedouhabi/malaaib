import { CalendarCheck, Banknote, Clock, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOwnerField, getOwnerBookings, getOwnerStats } from '@/lib/queries/owner'
import { StatCard } from '@/components/owner/stat-card'
import { PitchTypeBadge } from '@/components/ui/pitch-type-badge'
import { BookingActions } from '@/components/owner/booking-actions'
import type { PitchType } from '@/types'

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
  'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر',
]

const STATUS_LABEL: Record<string, string> = {
  pending: 'انتظار', confirmed: 'مؤكد', cancelled: 'ملغى', completed: 'مكتمل',
}

const STATUS_CHIP: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  confirmed: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  completed: 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400',
}

export default async function OwnerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const ownerId = user?.id ?? 'owner-1'

  const field = await getOwnerField(supabase, ownerId)
  const fieldId = field.id

  const [stats, allBookings] = await Promise.all([
    getOwnerStats(supabase, fieldId),
    getOwnerBookings(supabase, fieldId),
  ])

  // Upcoming: today + future, not cancelled/completed
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = allBookings
    .filter(b => b.date >= today && b.status !== 'cancelled' && b.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time))
    .slice(0, 6)

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 pb-24">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {field.name} — {field.city}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={CalendarCheck} label="حجوزات اليوم" value={stats.todayCount} unit="حجز" color="green" />
        <StatCard icon={Banknote} label="إيرادات اليوم" value={stats.todayRevenue} unit="درهم" color="blue" />
        <StatCard icon={Clock} label="قيد الانتظار" value={stats.pendingCount} unit="حجز" color="amber" />
        <StatCard icon={TrendingUp} label="هذا الأسبوع" value={stats.weekCount} unit="حجز" />
      </div>

      {/* Upcoming bookings */}
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
        الحجوزات القادمة
      </h2>

      {upcoming.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 px-4 py-8 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">ما كاين حتى حجز قادم</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {upcoming.map(booking => {
            const bookingDate = new Date(booking.date + 'T00:00:00')
            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden"
              >
                {/* Top row */}
                <div className="px-4 py-3 flex items-center gap-3">
                  {/* Date chip */}
                  <div className="flex-shrink-0 text-center w-10">
                    <p className="text-xl font-bold text-gray-900 dark:text-white font-latin leading-none">
                      {bookingDate.getDate()}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                      {ARABIC_MONTHS[bookingDate.getMonth()]}
                    </p>
                  </div>

                  <div className="w-px h-8 bg-gray-100 dark:bg-slate-700 flex-shrink-0" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-latin text-gray-700 dark:text-gray-200" dir="ltr">
                        {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
                      </span>
                      {booking.pitch && (
                        <PitchTypeBadge type={booking.pitch.type as PitchType} variant="badge" size="xs" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      {booking.player?.full_name ?? '—'}
                      {booking.pitch ? ` · ${booking.pitch.name}` : ''}
                    </p>
                  </div>

                  {/* Status + code */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-current/20 ${STATUS_CHIP[booking.status]}`}>
                      {STATUS_LABEL[booking.status]}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-latin">
                      {booking.booking_code}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <div className="px-4 pb-3 border-t border-gray-50 dark:border-slate-700/40 pt-2.5">
                    <BookingActions
                      bookingId={booking.id}
                      initialStatus={booking.status}
                      totalPrice={booking.total_price}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Recent completed */}
      {allBookings.filter(b => b.status === 'completed').length > 0 && (
        <>
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 mt-6">
            الحجوزات المنتهية
          </h2>
          <div className="flex flex-col gap-2">
            {allBookings
              .filter(b => b.status === 'completed')
              .slice(0, 3)
              .map(booking => {
                const bookingDate = new Date(booking.date + 'T00:00:00')
                return (
                  <div
                    key={booking.id}
                    className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 px-4 py-3 flex items-center gap-3 opacity-70"
                  >
                    <div className="flex-shrink-0 text-center w-10">
                      <p className="text-xl font-bold text-gray-700 dark:text-gray-300 font-latin leading-none">
                        {bookingDate.getDate()}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                        {ARABIC_MONTHS[bookingDate.getMonth()]}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-gray-100 dark:bg-slate-700 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-latin text-gray-600 dark:text-gray-300" dir="ltr">
                          {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
                        </span>
                        {booking.pitch && (
                          <PitchTypeBadge type={booking.pitch.type as PitchType} variant="badge" size="xs" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                        {booking.player?.full_name ?? '—'}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-current/20 ${STATUS_CHIP.completed}`}>
                      {STATUS_LABEL.completed}
                    </span>
                  </div>
                )
              })}
          </div>
        </>
      )}

    </main>
  )
}
