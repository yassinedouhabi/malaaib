import React from 'react'

interface StarRatingProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ rating, count, size = 'sm' }: StarRatingProps) {
  const id = React.useId()
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`التقييم: ${rating.toFixed(1)} من 5`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = rating >= star
          const half = !filled && rating >= star - 0.5
          const gradId = `${id}-h${star}`
          return (
            <svg key={star} className={`${starSize} flex-shrink-0`} viewBox="0 0 20 20">
              {half && (
                <defs>
                  <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="var(--color-brand-yellow)" />
                    <stop offset="50%" stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
              )}
              <path
                d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78z"
                fill={
                  filled
                    ? 'var(--color-brand-yellow)'
                    : half
                    ? `url(#${gradId})`
                    : '#e5e7eb'
                }
              />
            </svg>
          )
        })}
      </div>
      <span className={`${textSize} text-gray-500 dark:text-gray-400 font-latin tabular-nums`}>
        {rating.toFixed(1)}
        {count !== undefined && (
          <span className="text-gray-400 dark:text-gray-500"> ({count})</span>
        )}
      </span>
    </div>
  )
}
