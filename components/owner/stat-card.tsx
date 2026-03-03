import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number
  unit?: string
  color?: 'green' | 'amber' | 'blue' | 'default'
}

const COLOR_MAP = {
  green:   { bg: 'bg-brand-green/10', icon: 'text-brand-green', value: 'text-brand-green' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-950/40', icon: 'text-amber-500', value: 'text-amber-600 dark:text-amber-400' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-950/40', icon: 'text-blue-500', value: 'text-blue-600 dark:text-blue-400' },
  default: { bg: 'bg-gray-100 dark:bg-slate-800/60', icon: 'text-gray-400', value: 'text-gray-900 dark:text-white' },
}

export function StatCard({ icon: Icon, label, value, unit, color = 'default' }: StatCardProps) {
  const c = COLOR_MAP[color]
  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.bg}`}>
        <Icon className={`w-5 h-5 ${c.icon}`} strokeWidth={1.5} />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold font-latin tabular-nums ${c.value}`}>{value}</span>
        {unit && <span className="text-xs text-gray-400 dark:text-gray-500">{unit}</span>}
      </div>
    </div>
  )
}
