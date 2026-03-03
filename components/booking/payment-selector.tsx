import { Banknote, Smartphone } from 'lucide-react'
import type { Pitch, PaymentMethod } from '@/types'

interface PaymentSelectorProps {
  pitch: Pitch
  selected: PaymentMethod | null
  onSelect: (method: PaymentMethod) => void
}

export function PaymentSelector({ pitch, selected, onSelect }: PaymentSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      {pitch.allow_pay_at_field && (
        <PaymentCard
          method="pay_at_field"
          icon={<Banknote className="w-5 h-5" strokeWidth={1.5} />}
          label="الخلاص عند الملعب"
          description="ادفع وجهاً لوجه في الملعب"
          selected={selected === 'pay_at_field'}
          onSelect={onSelect}
        />
      )}
      {pitch.allow_online_payment && (
        <PaymentCard
          method="cmi"
          icon={<Smartphone className="w-5 h-5" strokeWidth={1.5} />}
          label="الخلاص أونلاين"
          description="ادفع مسبقاً عبر الإنترنت"
          selected={selected === 'cmi'}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}

interface PaymentCardProps {
  method: PaymentMethod
  icon: React.ReactNode
  label: string
  description: string
  selected: boolean
  onSelect: (method: PaymentMethod) => void
}

function PaymentCard({ method, icon, label, description, selected, onSelect }: PaymentCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(method)}
      className={`w-full text-start flex items-center gap-4 p-4 rounded-2xl border transition-all duration-150 ${
        selected
          ? 'ring-2 ring-brand-green border-brand-green bg-brand-green-surface dark:bg-brand-green/10'
          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-brand-green/50'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        selected
          ? 'bg-brand-green text-white'
          : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300'
      }`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="me-auto" />
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
        selected
          ? 'border-brand-green bg-brand-green'
          : 'border-gray-300 dark:border-slate-600'
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  )
}
