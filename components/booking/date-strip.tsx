'use client'

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function buildDays(): { date: string; dayName: string; dayNum: number }[] {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      date: formatDate(d),
      dayName: ARABIC_DAYS[d.getDay()],
      dayNum: d.getDate(),
    })
  }
  return days
}

interface DateStripProps {
  selectedDate: string | null
  onSelect: (date: string) => void
}

export function DateStrip({ selectedDate, onSelect }: DateStripProps) {
  const days = buildDays()

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      {days.map(day => {
        const isSelected = selectedDate === day.date
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelect(day.date)}
            className={`flex flex-col items-center gap-1 flex-shrink-0 w-14 py-2.5 rounded-xl transition-all duration-150 ${
              isSelected
                ? 'bg-brand-green text-white shadow-sm shadow-brand-green/30'
                : 'bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-brand-green/50'
            }`}
          >
            <span className="text-[10px] font-medium opacity-80">{day.dayName.slice(0, 3)}</span>
            <span className="text-lg font-bold font-latin leading-none">{day.dayNum}</span>
          </button>
        )
      })}
    </div>
  )
}
