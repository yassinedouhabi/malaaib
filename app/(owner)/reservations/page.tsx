import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOwnerField, getOwnerBookings, type OwnerBooking } from '@/lib/queries/owner'
import { PitchTypeBadge } from '@/components/ui/pitch-type-badge'
import { BookingActions } from '@/components/owner/booking-actions'
import type { BookingStatus, PitchType } from '@/types'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const VALID_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

const FILTER_TABS: { label: string; status: BookingStatus | undefined }[] = [
  { label: 'الكل', status: undefined },
  { label: 'انتظار', status: 'pending' },
  { label: 'مؤكد', status: 'confirmed' },
  { label: 'مكتمل', status: 'completed' },
  { label: 'ملغى', status: 'cancelled' },
]

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'انتظار', confirmed: 'مؤكد', cancelled: 'ملغى', completed: 'مكتمل',
}

const STATUS_CHIP: Record<BookingStatus, string> = {
  pending:   'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  confirmed: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  completed: 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400',
}

const STATUS_BORDER: Record<BookingStatus, string> = {
  pending:   'border-s-amber-400',
  confirmed: 'border-s-brand-green',
  cancelled: 'border-s-red-400',
  completed: 'border-s-gray-200 dark:border-s-slate-700',
}

export default async function ReservationsPage({ searchParams }: PageProps) {
  const { status: rawStatus } = await searchParams
  const activeStatus = VALID_STATUSES.includes(rawStatus as BookingStatus)
    ? (rawStatus as BookingStatus)
    : undefined

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const field = await getOwnerField(supabase, user?.id ?? 'owner-1')
  const bookings = await getOwnerBookings(supabase, field.id, { status: activeStatus })

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-5">الحجوزات</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
        {FILTER_TABS.map(tab => {
          const isActive = activeStatus === tab.status
          const href = tab.status ? `/reservations?status=${tab.status}` : '/reservations'
          return (
            <Link
              key={tab.label}
              href={href}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-green text-white shadow-sm shadow-brand-green/30'
                  : 'bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-brand-green/50'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Booking list */}
      {bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 px-4 py-10 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">ما كاين حتى حجز</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              statusChip={STATUS_CHIP}
              statusLabel={STATUS_LABEL}
              statusBorder={STATUS_BORDER}
            />
          ))}
        </div>
      )}
    </main>
  )
}

// ── Booking card ───────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  statusChip,
  statusLabel,
  statusBorder,
}: {
  booking: OwnerBooking
  statusChip: Record<BookingStatus, string>
  statusLabel: Record<BookingStatus, string>
  statusBorder: Record<BookingStatus, string>
}) {
  const showActions = booking.status === 'pending' || booking.status === 'confirmed'

  return (
    <div className={`bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 border-s-4 ${statusBorder[booking.status]} overflow-hidden`}>

      {/* Main info */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {booking.player?.full_name ?? '—'}
            </p>
            {booking.player?.phone && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-latin" dir="ltr">
                {booking.player.phone}
              </p>
            )}
          </div>
          <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 ring-current/20 ${statusChip[booking.status]}`}>
            {statusLabel[booking.status]}
          </span>
        </div>

        {/* Date, time, pitch */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400">
          <span className="font-latin" dir="ltr">{booking.date}</span>
          <span>·</span>
          <span className="font-latin" dir="ltr">
            {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
          </span>
          {booking.pitch && (
            <>
              <span>·</span>
              <PitchTypeBadge type={booking.pitch.type as PitchType} variant="badge" size="xs" />
              <span>{booking.pitch.name}</span>
            </>
          )}
        </div>

        {/* Booking code */}
        <div className="mt-2.5">
          <span className="inline-flex items-center bg-brand-green/10 text-brand-green text-[11px] font-bold font-latin px-2.5 py-1 rounded-full tracking-wider">
            {booking.booking_code}
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-4 pb-3.5 border-t border-gray-50 dark:border-slate-700/40 pt-3">
          <BookingActions
            bookingId={booking.id}
            initialStatus={booking.status}
            totalPrice={booking.total_price}
          />
        </div>
      )}
    </div>
  )
}
