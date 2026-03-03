'use client'

import { useState, useTransition } from 'react'
import { Check, X, Loader2, Banknote } from 'lucide-react'
import { confirmBooking, cancelBooking, completeBooking } from '@/lib/actions/bookings'
import type { BookingStatus } from '@/types'

interface BookingActionsProps {
  bookingId: string
  initialStatus: BookingStatus
  totalPrice?: number
  onStatusChange?: (bookingId: string, newStatus: BookingStatus) => void
}

export function BookingActions({
  bookingId,
  initialStatus,
  totalPrice = 0,
  onStatusChange,
}: BookingActionsProps) {
  const [status, setStatus] = useState<BookingStatus>(initialStatus)
  const [isPending, startTransition] = useTransition()

  function execute(action: () => Promise<void>, newStatus: BookingStatus) {
    startTransition(async () => {
      try {
        await action()
      } catch {}
      setStatus(newStatus)
      onStatusChange?.(bookingId, newStatus)
    })
  }

  if (isPending) {
    return (
      <div className="flex items-center h-8">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => execute(() => confirmBooking(bookingId), 'confirmed')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-green/10 text-brand-green hover:bg-brand-green/20 transition-colors"
        >
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          تأكيد
        </button>
        <button
          onClick={() => execute(() => cancelBooking(bookingId), 'cancelled')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          إلغاء
        </button>
      </div>
    )
  }

  if (status === 'confirmed') {
    return (
      <button
        onClick={() => execute(() => completeBooking(bookingId, totalPrice), 'completed')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors"
      >
        <Banknote className="w-3.5 h-3.5" strokeWidth={1.5} />
        تم الخلاص
      </button>
    )
  }

  return null
}
