'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const ROLE_HOME: Record<string, string> = {
  player: '/fields',
  owner: '/dashboard',
}

const OTP_TTL     = 180
const RESEND_WAIT = 30

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

type Step = 'details' | 'otp'

function RegisterForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const phone        = searchParams.get('phone') ?? ''

  const [name, setName]   = useState('')
  const [role, setRole]   = useState<'player' | 'owner'>('player')
  const [otp, setOtp]     = useState('')
  const [step, setStep]   = useState<Step>('details')
  const [loading, setLoading] = useState(false)

  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpExpiry, setOtpExpiry]           = useState(0)
  const [lockTimer, setLockTimer]           = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function startResendCooldown() {
    setResendCooldown(RESEND_WAIT)
    setOtpExpiry(OTP_TTL)
    clearTimer()
    timerRef.current = setInterval(() => {
      setResendCooldown(p => {
        if (p <= 1) { clearInterval(timerRef.current!); return 0 }
        return p - 1
      })
      setOtpExpiry(p => (p > 0 ? p - 1 : 0))
    }, 1000)
  }

  function startLockTimer(secs: number) {
    setLockTimer(secs)
    clearTimer()
    timerRef.current = setInterval(() => {
      setLockTimer(p => {
        if (p <= 1) { clearInterval(timerRef.current!); return 0 }
        return p - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearTimer(), [])

  // Redirect to login if no phone in URL
  useEffect(() => {
    if (!phone) router.replace('/login')
  }, [phone, router])

  // Step 1: validate details → check phone uniqueness → send OTP
  async function handleDetails(e: React.FormEvent) {
    e.preventDefault()
    if (!phone) return
    setLoading(true)

    // Check phone is not already registered
    const checkRes = await fetch(`/api/auth/check-phone?phone=${encodeURIComponent(phone)}`)
    const { exists } = await checkRes.json()

    if (exists) {
      setLoading(false)
      toast.error('هذا الرقم مسجل بالفعل')
      setTimeout(() => router.push('/login'), 1500)
      return
    }

    // Send OTP
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      if (json.error === 'rate_limited') {
        startLockTimer(json.seconds_left)
        toast.error(`انتظر ${formatTime(json.seconds_left)} قبل المحاولة مجدداً`)
      } else {
        toast.error(json.error ?? 'فشل إرسال الرمز')
      }
      return
    }

    toast.success('تم إرسال رمز التحقق')
    setStep('otp')
    startResendCooldown()
  }

  async function resendOtp() {
    if (resendCooldown > 0 || loading) return
    setLoading(true)

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      if (json.error === 'rate_limited') {
        startLockTimer(json.seconds_left)
        toast.error(`انتظر ${formatTime(json.seconds_left)}`)
      } else {
        toast.error(json.error ?? 'فشل إعادة الإرسال')
      }
      return
    }

    toast.success('تم إعادة إرسال الرمز')
    startResendCooldown()
  }

  // Step 2: verify OTP → create session → save profile → redirect
  async function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    })
    const json = await res.json()

    if (!res.ok) {
      setLoading(false)
      if (json.error === 'expired') {
        toast.error('انتهت صلاحية الرمز، أعد الإرسال')
        setStep('details')
      } else if (json.error === 'locked') {
        toast.error('تم تجاوز عدد المحاولات المسموح')
      } else if (json.error === 'invalid_otp') {
        const left = json.attempts_left
        toast.error(left > 0 ? `رمز خاطئ — تبقى ${left} محاولات` : 'رمز خاطئ')
      } else {
        toast.error(json.error ?? 'فشل التحقق')
      }
      return
    }

    // Exchange token_hash for Supabase session
    const supabase = createClient()
    const { data: sessionData, error: sessionErr } = await supabase.auth.verifyOtp({
      type: 'magiclink',
      token_hash: json.token_hash,
    })

    if (sessionErr || !sessionData.user) {
      toast.error('فشل إنشاء الجلسة، حاول مجدداً')
      setLoading(false)
      return
    }

    // Save profile
    const { error: profileErr } = await supabase.from('users').upsert({
      id: sessionData.user.id,
      phone,
      name: name.trim(),
      role,
    })

    if (profileErr) {
      toast.error('فشل حفظ البيانات')
      setLoading(false)
      return
    }

    toast.success('مرحباً! تم إنشاء حسابك بنجاح')
    router.push(ROLE_HOME[role])
    router.refresh()
  }

  if (!phone) return null

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-600 tracking-wide">ملاعب</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">إنشاء حساب جديد</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 space-y-6">
        {step === 'details' ? (
          <>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">أكمل بياناتك</h2>
              <p className="mt-1 text-sm text-gray-400" dir="ltr">{phone}</p>
            </div>

            {lockTimer > 0 && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 text-center">
                انتظر <span className="font-mono font-bold">{formatTime(lockTimer)}</span>
              </div>
            )}

            <form onSubmit={handleDetails} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الاسم الكامل
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="أدخل اسمك"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-4 py-3 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نوع الحساب
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['player', 'owner'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                        role === r
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-green-300'
                      }`}
                    >
                      {r === 'player' ? '⚽ لاعب' : '🏟️ صاحب ملعب'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim() || lockTimer > 0}
                className="w-full rounded-xl bg-green-600 py-3 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {loading ? 'جار الإرسال…' : 'إرسال رمز التحقق'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div>
              <button
                onClick={() => { setStep('details'); setOtp(''); clearTimer() }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-1"
              >
                ← رجوع
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">أدخل رمز التحقق</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                تم إرسال الرمز إلى <span dir="ltr">{phone}</span>
              </p>
            </div>

            {otpExpiry > 0 && (
              <div className={`text-center text-sm font-mono ${otpExpiry <= 30 ? 'text-red-500' : 'text-gray-400'}`}>
                ينتهي الرمز بعد {formatTime(otpExpiry)}
              </div>
            )}
            {otpExpiry === 0 && (
              <div className="text-center text-sm text-red-500">انتهت صلاحية الرمز</div>
            )}

            <form onSubmit={handleOtp} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                dir="ltr"
                placeholder="• • • • • •"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-4 py-3 text-center text-2xl tracking-[1rem] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                required
              />
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-xl bg-green-600 py-3 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {loading ? 'جار التحقق…' : 'تأكيد وإنشاء الحساب'}
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={resendOtp}
                className="w-full text-sm text-gray-500 hover:text-green-600 disabled:opacity-50 transition"
              >
                {resendCooldown > 0
                  ? `إعادة الإرسال بعد ${resendCooldown}s`
                  : 'إعادة إرسال الرمز'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
