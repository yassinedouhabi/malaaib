'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  showLabel?: boolean
  className?: string
}

export function LogoutButton({ showLabel = false, className = '' }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150 disabled:opacity-50 ${className}`}
    >
      <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
      {showLabel && <span className="text-sm">{loading ? 'جار الخروج…' : 'تسجيل الخروج'}</span>}
    </button>
  )
}
