import { MapPin, Calendar, Clock } from 'lucide-react'
import { PitchTypeBadge } from '@/components/ui/pitch-type-badge'
import type { Field, Pitch, TimeSlot } from '@/types'

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
  'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
]
const ARABIC_DAYS_FULL = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

function formatArabicDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${ARABIC_DAYS_FULL[d.getDay()]} ${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

interface BookingSummaryProps {
  field: Field
  pitch: Pitch
  date: string
  slot: TimeSlot
}

export function BookingSummary({ field, pitch, date, slot }: BookingSummaryProps) {
  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden">
      {/* Field */}
      <div className="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700/50 flex items-center gap-3">
        <MapPin className="w-4 h-4 text-brand-green flex-shrink-0" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{field.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{field.city}</p>
        </div>
      </div>

      {/* Pitch */}
      <div className="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700/50 flex items-center gap-3">
        <PitchTypeBadge type={pitch.type} variant="icon" />
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{pitch.name}</p>
          <PitchTypeBadge type={pitch.type} variant="badge" size="xs" />
        </div>
      </div>

      {/* Date */}
      <div className="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700/50 flex items-center gap-3">
        <Calendar className="w-4 h-4 text-brand-green flex-shrink-0" strokeWidth={1.5} />
        <p className="text-sm text-gray-700 dark:text-gray-200">{formatArabicDate(date)}</p>
      </div>

      {/* Time */}
      <div className="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700/50 flex items-center gap-3">
        <Clock className="w-4 h-4 text-brand-green flex-shrink-0" strokeWidth={1.5} />
        <p className="text-sm text-gray-700 dark:text-gray-200 font-latin" dir="ltr">
          {slot.start_time} – {slot.end_time}
        </p>
      </div>

      {/* Price */}
      <div className="px-4 py-3.5 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">المجموع</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-brand-green font-latin tabular-nums">
            {pitch.price_per_hour}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500">درهم</span>
        </div>
      </div>
    </div>
  )
}
