import type { Review } from '@/types'
import { StarRating } from '@/components/ui/star-rating'

interface ReviewsSectionProps {
  reviews: Review[]
  avgRating: number
}

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
]

function getAvatarColor(name: string) {
  const code = name.charCodeAt(0) || 0
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ar-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ReviewsSection({ reviews, avgRating }: ReviewsSectionProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
        مازال ما كاين حتى تقييم
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {/* Summary card */}
      <div className="bg-brand-green/5 dark:bg-brand-green/10 border border-brand-green/15 dark:border-brand-green/20 rounded-2xl p-4 flex items-center gap-4">
        <span className="text-5xl font-bold text-brand-green font-latin tabular-nums leading-none">
          {avgRating.toFixed(1)}
        </span>
        <div>
          <StarRating rating={avgRating} size="md" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            مبني على <span className="font-latin">{reviews.length}</span> تقييم
          </p>
        </div>
      </div>

      {/* Review cards */}
      {reviews.map(review => {
        const name = review.player?.full_name ?? 'مستخدم'
        const avatarColor = getAvatarColor(name)
        const initials = getInitials(name)
        return (
          <div
            key={review.id}
            className="bg-white dark:bg-slate-800/70 rounded-2xl p-4 border border-gray-100 dark:border-slate-700/50"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${avatarColor}`}>
                {initials}
              </div>

              {/* Name + stars */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                  {name}
                </p>
                <div className="mt-1">
                  <StarRating rating={review.rating} />
                </div>
              </div>

              {/* Date */}
              <time className="text-[10px] text-gray-400 dark:text-gray-500 font-latin flex-shrink-0 mt-0.5">
                {formatDate(review.created_at)}
              </time>
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2.5 leading-relaxed">
                {review.comment}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
