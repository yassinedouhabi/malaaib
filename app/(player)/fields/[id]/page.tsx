import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Clock, Share2, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getFieldById } from '@/lib/queries/fields'
import { MOCK_FIELDS } from '@/lib/mock-data'
import { PhotoGallery } from '@/components/fields/photo-gallery'
import { PitchList } from '@/components/fields/pitch-list'
import { ReviewsSection } from '@/components/fields/reviews-section'
import { StarRating } from '@/components/ui/star-rating'
import type { Field } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function fetchField(id: string): Promise<Field | null> {
  try {
    const supabase = await createClient()
    const field = await getFieldById(supabase, id)
    if (field) return field
  } catch {
    // fall through to mock
  }
  return MOCK_FIELDS.find(f => f.id === id) ?? null
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-4 mb-2">
      {children}
    </h2>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden">
      {children}
    </div>
  )
}

export default async function FieldDetailPage({ params }: PageProps) {
  const { id } = await params
  const field = await fetchField(id)
  if (!field) notFound()

  const photos = (field.field_photos ?? []).sort((a, b) => a.sort_order - b.sort_order)
  const pitches = (field.pitches ?? []).filter(p => p.is_active)
  const reviews = field.reviews ?? []
  const hours = field.opening_hours.default
  const whatsappUrl = `https://wa.me/${field.phone.replace(/[^0-9]/g, '')}`
  const minPrice = pitches.length > 0 ? Math.min(...pitches.map(p => p.price_per_hour)) : null

  return (
    <div className="pb-40 md:pb-28 bg-gray-50 dark:bg-slate-950 min-h-screen">

      {/* ── Back link (desktop) ───────────────────────────── */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 pt-5 pb-1">
        <Link
          href="/fields"
          className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
          ارجع للملاعب
        </Link>
      </div>

      {/* ── Two-column grid ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:pt-2 lg:items-start">

        {/* Gallery column — top on mobile, left on desktop (RTL order-2) */}
        <div className="lg:order-2 lg:sticky lg:top-6">

          {/* Mobile: back button overlays gallery */}
          <div className="relative md:hidden">
            <div className="absolute top-4 start-4 z-10">
              <Link
                href="/fields"
                className="w-9 h-9 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center ring-1 ring-white/20"
                aria-label="ارجع"
              >
                <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
              </Link>
            </div>
            <PhotoGallery photos={photos} fieldName={field.name} />
          </div>

          {/* Desktop gallery */}
          <div className="hidden md:block rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800">
            <PhotoGallery photos={photos} fieldName={field.name} />
          </div>
        </div>

        {/* Info column — bottom on mobile, right on desktop (RTL order-1) */}
        <div className="lg:order-1 mt-0">

          {/* ── Field identity ─────────────────────────────── */}
          <div className="px-4 md:px-0 pt-5 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                  {field.name}
                </h1>
                <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-green flex-shrink-0" strokeWidth={2} />
                  {field.city} — {field.address}
                </p>
              </div>
              {field.is_featured && (
                <span className="flex-shrink-0 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 ring-current/20 uppercase tracking-wide">
                  مميز
                </span>
              )}
            </div>

            {(field.avg_rating ?? 0) > 0 && (
              <div className="mt-3">
                <StarRating rating={field.avg_rating!} count={reviews.length} size="md" />
              </div>
            )}

            {field.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                {field.description}
              </p>
            )}
          </div>

          {/* ── Actions ────────────────────────────────────── */}
          <div className="px-4 md:px-0 pb-5 flex gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20be5c] active:scale-[0.98] text-white rounded-xl py-3 text-sm font-semibold transition-all duration-150 shadow-sm shadow-[#25d366]/30"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              واتساب
            </a>
            <button
              className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700/50 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="شارك"
            >
              <Share2 className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" strokeWidth={1.5} />
            </button>
          </div>

          {/* ── Opening hours ──────────────────────────────── */}
          <div className="px-4 md:px-0 pb-4">
            <SectionLabel>أوقات الخدمة</SectionLabel>
            <SectionCard>
              <div className="px-4 py-3.5 flex items-center gap-3 border-s-2 border-brand-green">
                <Clock className="w-4 h-4 text-brand-green flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm text-gray-700 dark:text-gray-200 font-latin">
                  {hours.open} — {hours.close}
                </span>
              </div>
            </SectionCard>
          </div>

          {/* ── Pitches ────────────────────────────────────── */}
          <div className="px-4 md:px-0 pb-4">
            <SectionLabel>الملاعب والأثمنة</SectionLabel>
            <PitchList pitches={pitches} />
          </div>

          {/* ── Reviews ────────────────────────────────────── */}
          {reviews.length > 0 && (
            <div className="px-4 md:px-0 pb-4">
              <SectionLabel>التقييمات</SectionLabel>
              <ReviewsSection reviews={reviews} avgRating={field.avg_rating ?? 0} />
            </div>
          )}
        </div>
      </div>

      {/* ── Book Now bar ──────────────────────────────────── */}
      {/*
        Mobile:  floating pill above the floating nav (bottom-20)
        md+:     full-width flat bar at bottom, offset for sidebar
      */}
      <div className="md:hidden fixed z-20 bottom-20 inset-x-4">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-slate-700/50 shadow-xl shadow-black/10 dark:shadow-black/40 px-4 py-3 flex items-center gap-4">
          {minPrice !== null && (
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">كيبدا من</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-900 dark:text-white font-latin tabular-nums">{minPrice}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">درهم/ساعة</span>
              </div>
            </div>
          )}
          <Link
            href={`/fields/${field.id}/book`}
            className="flex-shrink-0 bg-brand-green hover:bg-brand-green-dark active:scale-[0.97] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-150 shadow-sm shadow-brand-green/30"
          >
            احجز دابا
          </Link>
        </div>
      </div>

      {/* Desktop Book Now bar */}
      <div className="hidden md:block fixed z-20 bottom-0 start-16 end-0 lg:start-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 px-6 py-3">
        <div className="flex items-center gap-4 max-w-3xl mx-auto">
          {minPrice !== null && (
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">كيبدا من</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-900 dark:text-white font-latin tabular-nums">{minPrice}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">درهم/ساعة</span>
              </div>
            </div>
          )}
          <Link
            href={`/fields/${field.id}/book`}
            className="flex-shrink-0 bg-brand-green hover:bg-brand-green-dark active:scale-[0.97] text-white font-bold px-8 py-3 rounded-xl text-sm transition-all duration-150 shadow-sm shadow-brand-green/30"
          >
            احجز دابا
          </Link>
        </div>
      </div>

    </div>
  )
}
