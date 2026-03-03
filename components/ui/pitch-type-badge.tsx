import type { PitchType } from '@/types'

const BADGE_STYLES: Record<PitchType, string> = {
  '5v5':   'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  '6v6':   'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400',
  '7v7':   'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  '11v11': 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
}

const ICON_STYLES: Record<PitchType, string> = {
  '5v5':   'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  '6v6':   'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400',
  '7v7':   'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  '11v11': 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
}

interface PitchTypeBadgeProps {
  type: PitchType
  size?: 'xs' | 'sm'
  variant?: 'badge' | 'icon'
}

export function PitchTypeBadge({ type, size = 'xs', variant = 'badge' }: PitchTypeBadgeProps) {
  if (variant === 'icon') {
    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold font-latin text-xs ${ICON_STYLES[type]}`}>
        {type}
      </div>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium font-latin ring-1 ring-inset ring-current/20 ${size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} ${BADGE_STYLES[type]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 inline-block" />
      {type}
    </span>
  )
}
