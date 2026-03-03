import { Clock, Banknote, Smartphone } from 'lucide-react'
import type { Pitch } from '@/types'
import { PitchTypeBadge } from '@/components/ui/pitch-type-badge'

interface PitchListProps {
  pitches: Pitch[]
}

export function PitchList({ pitches }: PitchListProps) {
  if (pitches.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
        ما كاين حتى ملعب متاح
      </p>
    )
  }

  return (
    <div className="space-y-2.5">
      {pitches.map(pitch => (
        <div
          key={pitch.id}
          className="bg-white dark:bg-slate-800/70 rounded-xl p-3.5 border border-gray-100 dark:border-slate-700/50 shadow-sm flex items-center gap-3"
        >
          {/* Type icon square */}
          <PitchTypeBadge type={pitch.type} variant="icon" />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
              {pitch.name}
            </p>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {/* Duration */}
              <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                <Clock className="w-3 h-3" strokeWidth={1.5} />
                <span className="font-latin">{pitch.slot_duration_minutes}</span> دقيقة
              </span>

              {/* Payment chips */}
              {pitch.allow_pay_at_field && (
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700/60 rounded-md px-1.5 py-0.5">
                  <Banknote className="w-3 h-3" strokeWidth={1.5} />
                  عند الملعب
                </span>
              )}
              {pitch.allow_online_payment && (
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700/60 rounded-md px-1.5 py-0.5">
                  <Smartphone className="w-3 h-3" strokeWidth={1.5} />
                  أونلاين
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-end flex-shrink-0">
            <p className="text-xl font-bold text-brand-green font-latin tabular-nums leading-none">
              {pitch.price_per_hour}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">درهم/ساعة</p>
          </div>
        </div>
      ))}
    </div>
  )
}
