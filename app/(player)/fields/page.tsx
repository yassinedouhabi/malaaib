import { Suspense } from 'react'
import { SearchX, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getFields } from '@/lib/queries/fields'
import { MOCK_FIELDS } from '@/lib/mock-data'
import { FieldCard } from '@/components/fields/field-card'
import { FieldFilters } from '@/components/fields/field-filters'
import type { Field } from '@/types'

interface PageProps {
  searchParams: Promise<{ type?: string; city?: string }>
}

async function FieldGrid({ type, city }: { type?: string; city?: string }) {
  let fields: Field[] = []

  try {
    const supabase = await createClient()
    fields = await getFields(supabase, { type, city })
  } catch {
    // Supabase not configured — use mock data
  }

  if (fields.length === 0) {
    let mock = MOCK_FIELDS
    if (type) mock = mock.filter(f => f.pitches?.some(p => p.type === type))
    if (city) mock = mock.filter(f => f.city.includes(city))
    fields = mock
  }

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <SearchX className="w-14 h-14 text-gray-200 dark:text-slate-700" strokeWidth={1} />
        <div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">ما كاين حتى ملعب</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">جرب تبدل الفيلتر</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {fields.map(field => (
        <FieldCard key={field.id} field={field} />
      ))}
    </div>
  )
}

export default async function FieldsPage({ searchParams }: PageProps) {
  const { type, city } = await searchParams
  const currentCity = city ?? 'all'

  return (
    <main className="pb-28 md:pb-8">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-white dark:from-slate-950 to-white/95 dark:to-slate-950/95 backdrop-blur-sm border-b border-gray-100/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-3 space-y-3">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">الملاعب</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">قلب ملعبك فالقريبة ديالك</p>
            </div>
            <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200/60 dark:border-slate-700/50 flex-shrink-0 mt-0.5">
              <MapPin className="w-3 h-3 text-brand-green" strokeWidth={2} />
              {currentCity === 'all' ? 'كل المدن' : currentCity}
            </span>
          </div>

          {/* Filters */}
          <Suspense fallback={<div className="h-16" />}>
            <FieldFilters />
          </Suspense>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800/80 rounded-2xl overflow-hidden border border-gray-200/80 dark:border-slate-700/60 animate-pulse">
                <div className="aspect-[4/3] bg-gray-100 dark:bg-slate-700" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-16 bg-gray-100 dark:bg-slate-700 rounded-full" />
                  <div className="h-4 w-28 bg-gray-100 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-20 bg-gray-50 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        }>
          <FieldGrid type={type} city={city} />
        </Suspense>
      </div>
    </main>
  )
}
