export default function FieldDetailLoading() {
  return (
    <div className="pb-28 animate-pulse">
      {/* Photo area */}
      <div className="aspect-video bg-gray-200 dark:bg-slate-800" />
      <div className="flex gap-2 p-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
        ))}
      </div>

      <div className="px-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-36 bg-gray-100 dark:bg-slate-800 rounded" />
          <div className="h-4 w-24 bg-gray-100 dark:bg-slate-800 rounded" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <div className="flex-1 h-12 bg-gray-200 dark:bg-slate-700 rounded-xl" />
          <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Pitches */}
        <div className="space-y-3">
          <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
