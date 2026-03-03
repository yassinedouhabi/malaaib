'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import type { PitchType } from '@/types'

const PITCH_TYPES: { value: PitchType | 'all'; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: '5v5', label: '5v5' },
  { value: '6v6', label: '6v6' },
  { value: '7v7', label: '7v7' },
  { value: '11v11', label: '11v11' },
]

const CITIES: { value: string; label: string }[] = [
  { value: 'all', label: 'كل المدن' },
  { value: 'الدار البيضاء', label: 'الدار البيضاء' },
  { value: 'الرباط', label: 'الرباط' },
  { value: 'مراكش', label: 'مراكش' },
  { value: 'فاس', label: 'فاس' },
  { value: 'طنجة', label: 'طنجة' },
]

const activeChip = 'bg-brand-green text-white shadow-sm shadow-brand-green/30'
const inactiveChip = 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-300 dark:hover:border-slate-600'

export function FieldFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type') ?? 'all'
  const currentCity = searchParams.get('city') ?? 'all'

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'all') params.delete(key)
      else params.set(key, value)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="space-y-2">
      {/* Pitch type */}
      <div className="flex gap-1.5 overflow-x-auto md:overflow-x-visible md:flex-wrap scrollbar-hide pb-0.5">
        {PITCH_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParam('type', value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 font-latin ${currentType === value ? activeChip : inactiveChip}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* City */}
      <div className="flex gap-1.5 overflow-x-auto md:overflow-x-visible md:flex-wrap scrollbar-hide pb-0.5">
        {CITIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParam('city', value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all duration-150 ${currentCity === value ? activeChip : inactiveChip}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
