export default function FieldsLoading() {
  return (
    <main className="pb-24">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-slate-800">
        <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
        <div className="h-4 w-36 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="flex gap-2 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-16 bg-gray-100 dark:bg-slate-800 rounded-full animate-pulse" />
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-slate-700" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded-full" />
              <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-20 bg-gray-100 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
