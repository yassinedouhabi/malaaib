import { Phone, MapPin, Clock, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOwnerField } from '@/lib/queries/owner'

function InfoRow({ icon: Icon, label, value }: {
  icon: typeof Phone
  label: string
  value: string
}) {
  return (
    <div className="px-4 py-3.5 flex items-start gap-3 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
      <Icon className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" strokeWidth={1.5} />
      <div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
      {children}
    </h2>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden mb-5">
      {children}
    </div>
  )
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const field = await getOwnerField(supabase, user?.id ?? 'owner-1')
  const pitches = field.pitches ?? []
  const hours = field.opening_hours.default

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">الإعدادات</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">معلومات الملعب</p>
        </div>
        <button
          className="text-sm font-semibold text-brand-green bg-brand-green/10 hover:bg-brand-green/20 px-4 py-2 rounded-xl transition-colors"
          onClick={() => alert('قريبًا')}
        >
          تعديل
        </button>
      </div>

      {/* Field info */}
      <SectionLabel>معلومات عامة</SectionLabel>
      <SectionCard>
        <InfoRow icon={Building2} label="اسم الملعب" value={field.name} />
        <InfoRow icon={MapPin} label="المدينة" value={field.city} />
        <InfoRow icon={MapPin} label="العنوان" value={field.address} />
        <InfoRow icon={Phone} label="الهاتف" value={field.phone} />
        <InfoRow icon={Clock} label="أوقات الخدمة" value={`${hours.open} — ${hours.close}`} />
      </SectionCard>

      {/* Pitches */}
      {pitches.length > 0 && (
        <>
          <SectionLabel>الملاعب ({pitches.length})</SectionLabel>
          <div className="flex flex-col gap-2">
            {pitches.map(pitch => (
              <div
                key={pitch.id}
                className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 px-4 py-3.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{pitch.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                      <span className="font-latin">{pitch.type}</span>
                      <span>·</span>
                      <span className="font-latin">{pitch.price_per_hour} درهم/ساعة</span>
                      <span>·</span>
                      <span className="font-latin">{pitch.slot_duration_minutes} دقيقة</span>
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] text-gray-400 dark:text-gray-500">
                    {pitch.allow_pay_at_field && (
                      <span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">نقداً</span>
                    )}
                    {pitch.allow_online_payment && (
                      <span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">أونلاين</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
