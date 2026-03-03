export default function BookingLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full" />
        <div className="w-32 h-5 bg-gray-200 dark:bg-slate-700 rounded-full" />
        <div className="w-12 h-5 bg-gray-200 dark:bg-slate-700 rounded-full" />
      </div>

      {/* Section label */}
      <div className="w-24 h-3 bg-gray-200 dark:bg-slate-700 rounded-full mb-3" />

      {/* Pitch card skeletons */}
      {[0, 1].map(i => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded-2xl mb-3" />
      ))}

      {/* Date label */}
      <div className="w-20 h-3 bg-gray-200 dark:bg-slate-700 rounded-full mb-3 mt-5" />

      {/* Date strip skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="w-14 h-16 bg-gray-200 dark:bg-slate-700 rounded-xl flex-shrink-0" />
        ))}
      </div>
    </div>
  )
}
