import { PitchTypeBadge } from '@/components/ui/pitch-type-badge'
import type { Pitch } from '@/types'

interface PitchSelectorProps {
  pitches: Pitch[]
  selectedId: string | null
  onSelect: (pitchId: string) => void
}

export function PitchSelector({ pitches, selectedId, onSelect }: PitchSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      {pitches.map(pitch => (
        <button
          key={pitch.id}
          type="button"
          onClick={() => onSelect(pitch.id)}
          className={`w-full text-start rounded-2xl border p-4 transition-all duration-150 ${
            selectedId === pitch.id
              ? 'ring-2 ring-brand-green border-brand-green bg-brand-green-surface dark:bg-brand-green/10'
              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-brand-green/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <PitchTypeBadge type={pitch.type} variant="icon" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{pitch.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <PitchTypeBadge type={pitch.type} variant="badge" size="xs" />
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {pitch.slot_duration_minutes} دقيقة
                </span>
              </div>
            </div>
            <div className="text-end flex-shrink-0">
              <span className="text-lg font-bold text-brand-green font-latin tabular-nums">
                {pitch.price_per_hour}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 me-0.5"> درهم</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
