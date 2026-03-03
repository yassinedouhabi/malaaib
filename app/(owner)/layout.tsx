'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, CalendarDays, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'لوحة التحكم', Icon: LayoutDashboard },
  { href: '/reservations', label: 'الحجوزات',    Icon: ClipboardList },
  { href: '/calendar',     label: 'الجدول',       Icon: CalendarDays },
  { href: '/settings',     label: 'الإعدادات',   Icon: Settings },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">

      {/* ── Sidebar (md+) ─────────────────────────────────── */}
      <aside className="hidden md:flex md:flex-col fixed inset-y-0 start-0 z-30 w-16 lg:w-56 bg-white dark:bg-slate-900 border-s border-gray-100 dark:border-slate-800/80">

        {/* Logo */}
        <div className="h-14 flex items-center justify-center lg:justify-start lg:px-4 border-b border-gray-100 dark:border-slate-800/80 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white font-bold text-base">م</span>
          </div>
          <span className="hidden lg:block text-base font-bold text-gray-900 dark:text-white ms-3">ملاعب</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 p-2 pt-3 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 ${
                  isActive
                    ? 'bg-brand-green-surface dark:bg-brand-green/10 text-brand-green'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute start-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-green rounded-full" />
                )}
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="hidden lg:block text-sm font-medium">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Role badge */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800/80 flex-shrink-0">
          <div className="hidden lg:block px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800/40">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">الوضعية</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">صاحب ملعب</p>
          </div>
          <div className="lg:hidden flex justify-center">
            <div className="w-2 h-2 rounded-full bg-brand-green" />
          </div>
        </div>
      </aside>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="md:ms-16 lg:ms-56 min-h-screen">
        {children}
      </div>

      {/* ── Floating pill nav (mobile only) ───────────────── */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-30 flex justify-center pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-sm">
          <div className="flex items-center bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-gray-200/60 dark:border-slate-700/50 rounded-full shadow-xl shadow-black/10 dark:shadow-black/50 px-2 py-1.5 gap-1">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-full transition-colors duration-150 ${
                    isActive ? 'bg-brand-green/10 dark:bg-brand-green/15' : ''
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-brand-green' : 'text-gray-400 dark:text-gray-500'}`}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  <span className={`text-[9px] font-medium leading-none ${isActive ? 'text-brand-green' : 'text-gray-400 dark:text-gray-500'}`}>
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

    </div>
  )
}
