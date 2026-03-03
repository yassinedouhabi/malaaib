'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import type { Field, PitchType } from '@/types'
import { StarRating } from '@/components/ui/star-rating'
import { PitchTypeBadge } from '@/components/ui/pitch-type-badge'

interface FieldCardProps {
  field: Field
}

export function FieldCard({ field }: FieldCardProps) {
  const coverPhoto = field.field_photos?.find(p => p.is_cover) ?? field.field_photos?.[0]
  const activePitches = field.pitches?.filter(p => p.is_active) ?? []
  const uniqueTypes = [...new Set(activePitches.map(p => p.type))] as PitchType[]
  const minPrice = activePitches.length > 0
    ? Math.min(...activePitches.map(p => p.price_per_hour))
    : null
  const reviewCount = field.reviews?.length ?? 0

  return (
    <Link href={`/fields/${field.id}`} className="block group">
      <article className="bg-white dark:bg-slate-800/80 rounded-2xl overflow-hidden border border-gray-200/80 dark:border-slate-700/60 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-black/10 dark:group-hover:shadow-black/30">

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
          {coverPhoto ? (
            <Image
              src={coverPhoto.storage_url}
              alt={field.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-slate-400 dark:text-slate-500" strokeWidth={1} />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none" />

          {/* Top row: featured badge + heart */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-start justify-between">
            {field.is_featured ? (
              <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">
                مميز
              </span>
            ) : (
              <span />
            )}
            <button
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/15 dark:bg-black/20 ring-1 ring-white/30 backdrop-blur-md transition-colors hover:bg-white/30"
              aria-label="زيد للمفضلة"
              onClick={e => e.preventDefault()}
            >
              <Heart className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          {/* Pitch type badges */}
          {uniqueTypes.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-1.5">
              {uniqueTypes.map(type => (
                <PitchTypeBadge key={type} type={type} />
              ))}
            </div>
          )}

          {/* Name */}
          <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-white">
            {field.name}
          </h3>

          {/* City */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{field.city}</p>

          {/* Price + rating */}
          <div className="flex items-end justify-between gap-2 mt-2">
            {minPrice !== null ? (
              <p className="text-sm font-bold text-brand-green tabular-nums font-latin">
                {minPrice}{' '}
                <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500 font-arabic">درهم</span>
              </p>
            ) : (
              <span />
            )}
            {(field.avg_rating ?? 0) > 0 && (
              <StarRating rating={field.avg_rating!} count={reviewCount} />
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
