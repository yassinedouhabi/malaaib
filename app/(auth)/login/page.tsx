'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [otp, setOtp] = useState('')

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: integrate Supabase phone OTP
    setStep('otp')
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: verify OTP and redirect by role
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo / Brand */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-600 tracking-wide">ملاعب</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-latin">
          احجز ملعبك الآن · Réservez votre terrain
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 space-y-6">
        {step === 'phone' ? (
          <>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                تسجيل الدخول
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-latin">
                Connexion par numéro de téléphone
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  رقم الهاتف
                </label>
                <input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  placeholder="+212 6XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-4 py-3 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-green-600 py-3 text-base font-semibold text-white hover:bg-green-700 active:scale-[0.98] transition-all"
              >
                إرسال الرمز · Envoyer le code
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              ليس لديك حساب؟{' '}
              <a href="#" className="text-green-600 hover:underline font-medium">
                إنشاء حساب
              </a>
            </p>
          </>
        ) : (
          <>
            <div>
              <button
                onClick={() => setStep('phone')}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-1"
              >
                ← {phone}
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                أدخل الرمز
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-latin">
                Entrez le code reçu par WhatsApp
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                dir="ltr"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-4 py-3 text-center text-2xl tracking-[1rem] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                required
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-green-600 py-3 text-base font-semibold text-white hover:bg-green-700 active:scale-[0.98] transition-all"
              >
                تأكيد · Confirmer
              </button>

              <button
                type="button"
                className="w-full text-sm text-gray-500 hover:text-green-600 transition"
              >
                إعادة إرسال الرمز · Renvoyer
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
