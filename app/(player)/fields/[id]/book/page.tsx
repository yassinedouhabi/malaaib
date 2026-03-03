'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Loader2, CalendarCheck, CheckCircle2 } from 'lucide-react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { getAvailableSlots, createBooking } from '@/lib/queries/bookings'
import { MOCK_FIELDS } from '@/lib/mock-data'
import { PitchSelector } from '@/components/booking/pitch-selector'
import { DateStrip } from '@/components/booking/date-strip'
import { TimeSlotGrid } from '@/components/booking/time-slot-grid'
import { PaymentSelector } from '@/components/booking/payment-selector'
import { BookingSummary } from '@/components/booking/booking-summary'
import type { Field, Pitch, TimeSlot, PaymentMethod } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchField(id: string): Promise<Field | null> {
  // Client-side: try mock first for dev
  const mock = MOCK_FIELDS.find(f => f.id === id)
  if (mock) return mock
  try {
    const supabase = createBrowserClient()
    const { data } = await supabase
      .from('fields')
      .select('*, pitches(*)')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    return data ?? null
  } catch {
    return null
  }
}

const STEP_TITLES = ['اختر الملعب والتاريخ', 'اختر الوقت', 'أكد الحجز', 'تم الحجز'] as const
const TOTAL_STEPS = 3

// ── Main page ─────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>
}

export default function BookPage({ params }: PageProps) {
  const [fieldId, setFieldId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setFieldId(p.id))
  }, [params])

  if (!fieldId) return null
  return <BookingWizardLoader fieldId={fieldId} />
}

// ── Loader ─────────────────────────────────────────────────────────────────────

function BookingWizardLoader({ fieldId }: { fieldId: string }) {
  const [field, setField] = useState<Field | null | undefined>(undefined)

  useEffect(() => {
    fetchField(fieldId).then(setField)
  }, [fieldId])

  if (field === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
      </div>
    )
  }

  if (!field) {
    notFound()
    return null
  }

  const activePitches = (field.pitches ?? []).filter(p => p.is_active)
  return <BookingWizard field={field} activePitches={activePitches} />
}

// ── Wizard ─────────────────────────────────────────────────────────────────────

function BookingWizard({ field, activePitches }: { field: Field; activePitches: Pitch[] }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
  const [bookingCode, setBookingCode] = useState<string>('')
  const [confirming, setConfirming] = useState(false)

  // Step 2: slots
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const selectedPitch = activePitches.find(p => p.id === selectedPitchId) ?? null

  // Load slots when entering step 2
  useEffect(() => {
    if (step !== 2 || !selectedPitch || !selectedDate) return
    setSlotsLoading(true)
    setSelectedSlot(null)
    const supabase = createBrowserClient()
    getAvailableSlots(
      supabase,
      selectedPitch.id,
      selectedDate,
      field.opening_hours.default,
      selectedPitch.slot_duration_minutes
    ).then(s => {
      setSlots(s)
      setSlotsLoading(false)
    })
  }, [step, selectedPitch, selectedDate, field.opening_hours.default])

  // Auto-select payment if only one option
  useEffect(() => {
    if (step === 3 && selectedPitch && selectedPayment === null) {
      if (selectedPitch.allow_pay_at_field && !selectedPitch.allow_online_payment) {
        setSelectedPayment('pay_at_field')
      } else if (!selectedPitch.allow_pay_at_field && selectedPitch.allow_online_payment) {
        setSelectedPayment('cmi')
      }
    }
  }, [step, selectedPitch, selectedPayment])

  async function handleConfirm() {
    if (!selectedPitch || !selectedDate || !selectedSlot || !selectedPayment) return
    setConfirming(true)
    const supabase = createBrowserClient()
    const user = await supabase.auth.getUser()
    const playerId = user.data.user?.id ?? 'anonymous'
    const result = await createBooking(supabase, {
      pitchId: selectedPitch.id,
      playerId,
      date: selectedDate,
      startTime: selectedSlot.start_time,
      endTime: selectedSlot.end_time,
      paymentMethod: selectedPayment,
      totalPrice: selectedPitch.price_per_hour,
    })
    setBookingCode(result.bookingCode)
    setConfirming(false)
    setStep(4)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28">

      {/* ── Shared header (steps 1–3) ──────────────────────────────── */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/fields/${field.id}`}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="ارجع"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" strokeWidth={2.5} />
          </Link>
          <h1 className="text-base font-bold text-gray-900 dark:text-white">
            {STEP_TITLES[step - 1]}
          </h1>
          <span className="text-sm text-gray-400 dark:text-gray-500 font-latin" dir="ltr">
            {step} / {TOTAL_STEPS}
          </span>
        </div>
      )}

      {/* ── Step 1: Pitch + Date ───────────────────────────────────── */}
      {step === 1 && (
        <div>
          <SectionLabel>اختر الملعب</SectionLabel>
          <PitchSelector
            pitches={activePitches}
            selectedId={selectedPitchId}
            onSelect={id => {
              setSelectedPitchId(id)
              setSelectedSlot(null)
              setSelectedPayment(null)
            }}
          />

          <SectionLabel className="mt-5">اختر التاريخ</SectionLabel>
          <DateStrip
            selectedDate={selectedDate}
            onSelect={d => {
              setSelectedDate(d)
              setSelectedSlot(null)
            }}
          />

          <NextButton
            disabled={!selectedPitchId || !selectedDate}
            onClick={() => setStep(2)}
          />
        </div>
      )}

      {/* ── Step 2: Time slot ──────────────────────────────────────── */}
      {step === 2 && (
        <div>
          <SectionLabel>اختر الوقت المناسب</SectionLabel>

          {slotsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
              <p className="text-sm text-gray-400 dark:text-gray-500">جار التحميل…</p>
            </div>
          ) : (
            <TimeSlotGrid
              slots={slots}
              selected={selectedSlot?.start_time ?? null}
              onSelect={startTime => {
                const s = slots.find(sl => sl.start_time === startTime) ?? null
                setSelectedSlot(s)
              }}
            />
          )}

          <NextButton
            disabled={!selectedSlot || slotsLoading}
            onClick={() => setStep(3)}
          />
        </div>
      )}

      {/* ── Step 3: Summary + Payment + Confirm ───────────────────── */}
      {step === 3 && selectedPitch && selectedDate && selectedSlot && (
        <div>
          <SectionLabel>ملخص الحجز</SectionLabel>
          <BookingSummary
            field={field}
            pitch={selectedPitch}
            date={selectedDate}
            slot={selectedSlot}
          />

          <SectionLabel className="mt-5">طريقة الخلاص</SectionLabel>
          <PaymentSelector
            pitch={selectedPitch}
            selected={selectedPayment}
            onSelect={setSelectedPayment}
          />

          <button
            type="button"
            disabled={!selectedPayment || confirming}
            onClick={handleConfirm}
            className="w-full mt-6 bg-brand-green hover:bg-brand-green-dark disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-base transition-all duration-150 shadow-sm shadow-brand-green/30 flex items-center justify-center gap-2"
          >
            {confirming ? (
              <><Loader2 className="w-5 h-5 animate-spin" /><span>جار التسجيل…</span></>
            ) : (
              <><CalendarCheck className="w-5 h-5" strokeWidth={2} /><span>احجز دابا</span></>
            )}
          </button>
        </div>
      )}

      {/* ── Step 4: Success ───────────────────────────────────────── */}
      {step === 4 && selectedPitch && selectedDate && selectedSlot && (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-brand-green" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {STEP_TITLES[3]}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            تم تسجيل حجزك بنجاح
          </p>

          {/* Booking code card */}
          <div className="w-full bg-brand-green/5 border border-brand-green/20 rounded-2xl px-6 py-6 mb-6">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">رمز الحجز</p>
            <p className="text-4xl font-bold font-latin text-brand-green tracking-widest">
              {bookingCode}
            </p>
          </div>

          {/* Quick summary */}
          <div className="w-full bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 divide-y divide-gray-100 dark:divide-slate-700/50 mb-8 text-start">
            <div className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">الملعب</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedPitch.name}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">التاريخ</span>
              <span className="text-sm font-latin text-gray-900 dark:text-white">{selectedDate}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">الوقت</span>
              <span className="text-sm font-latin text-gray-900 dark:text-white" dir="ltr">
                {selectedSlot.start_time} – {selectedSlot.end_time}
              </span>
            </div>
          </div>

          <div className="w-full flex gap-3">
            <Link
              href="/fields"
              className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm font-semibold text-gray-700 dark:text-gray-200 text-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              ارجع للملاعب
            </Link>
            <Link
              href="/bookings"
              className="flex-1 py-3 rounded-2xl bg-brand-green hover:bg-brand-green-dark text-white text-sm font-bold text-center transition-colors shadow-sm shadow-brand-green/30"
            >
              حجوزاتي
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shared subcomponents ───────────────────────────────────────────────────────

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ${className}`}>
      {children}
    </h2>
  )
}

function NextButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full mt-6 bg-brand-green hover:bg-brand-green-dark disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-base transition-all duration-150 shadow-sm shadow-brand-green/30"
    >
      التالي
    </button>
  )
}
