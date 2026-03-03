import { createClient } from '@/lib/supabase/server'
import { getOwnerField } from '@/lib/queries/owner'
import { CalendarView } from '@/components/owner/calendar-view'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const field = await getOwnerField(supabase, user?.id ?? 'owner-1')

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">الجدول</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{field.name}</p>
      </div>
      <CalendarView field={field} />
    </main>
  )
}
