'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { FieldPhoto } from '@/types'

interface PhotoGalleryProps {
  photos: FieldPhoto[]
  fieldName: string
}

export function PhotoGallery({ photos, fieldName }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (photos.length === 0) {
    return (
      <div className="aspect-[4/3] md:aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
        <MapPin className="w-14 h-14 text-slate-400 dark:text-slate-500" strokeWidth={1} />
      </div>
    )
  }

  const active = photos[activeIndex]

  return (
    <div>
      {/* Main photo */}
      <div className="relative aspect-[4/3] md:aspect-video bg-gray-200 dark:bg-slate-800 overflow-hidden">
        <Image
          src={active.storage_url}
          alt={`${fieldName} — صورة ${activeIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-200"
          priority={activeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Photo counter */}
        {photos.length > 1 && (
          <span dir="ltr" className="absolute top-3 end-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full tabular-nums font-latin">
            {activeIndex + 1} / {photos.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="relative">
          <div className="flex gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setActiveIndex(index)}
                className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all duration-150 ${
                  index === activeIndex
                    ? 'ring-2 ring-brand-green ring-offset-1 opacity-100 scale-105'
                    : 'opacity-55 hover:opacity-80'
                }`}
                aria-label={`صورة ${index + 1}`}
              >
                <Image
                  src={photo.storage_url}
                  alt={`${fieldName} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </button>
            ))}
          </div>
          {/* Fade edge */}
          <div className="absolute inset-y-0 end-0 w-8 bg-gradient-to-s from-white dark:from-slate-950 to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  )
}
