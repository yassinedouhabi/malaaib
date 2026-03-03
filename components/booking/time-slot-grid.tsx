import type { TimeSlot } from '@/types'

interface TimeSlotGridProps {
  slots: TimeSlot[]
  selected: string | null
  onSelect: (startTime: string) => void
}

export function TimeSlotGrid({ slots, selected, onSelect }: TimeSlotGridProps) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
        ما كاين حتى وقت متاح
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map(slot => {
        const isSelected = selected === slot.start_time
        const taken = !slot.is_available

        return (
          <button
            key={slot.start_time}
            type="button"
            disabled={taken}
            onClick={() => !taken && onSelect(slot.start_time)}
            className={`py-2.5 px-1 rounded-xl text-sm font-latin font-medium transition-all duration-150 text-center ${
              taken
                ? 'bg-gray-100 dark:bg-slate-800/40 text-gray-300 dark:text-slate-600 line-through cursor-not-allowed'
                : isSelected
                ? 'bg-brand-green text-white border-2 border-brand-green shadow-sm shadow-brand-green/30'
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-brand-green'
            }`}
          >
            <span dir="ltr">{slot.start_time}</span>
            {taken && (
              <span className="block text-[10px] font-arabic font-normal not-italic mt-0.5 no-underline">
                محجوز
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
