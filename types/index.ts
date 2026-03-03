export type UserRole = 'player' | 'owner' | 'admin'
export type Language = 'ar' | 'fr'
export type PitchType = '5v5' | '6v6' | '7v7' | '11v11'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentMethod = 'pay_at_field' | 'cmi' | 'cashplus' | 'wafacash' | 'walk_in'

export interface User {
  id: string
  email: string | null
  phone: string
  full_name: string
  role: UserRole
  preferred_language: Language
  created_at: string
}

export interface Field {
  id: string
  owner_id: string
  name: string
  description: string | null
  address: string
  city: string
  phone: string
  opening_hours: OpeningHours
  is_active: boolean
  is_featured: boolean
  created_at: string
  // joined
  pitches?: Pitch[]
  field_photos?: FieldPhoto[]
  reviews?: Review[]
  avg_rating?: number
}

export interface OpeningHours {
  default: { open: string; close: string }
  overrides?: Record<string, { open: string; close: string } | null>
}

export interface Pitch {
  id: string
  field_id: string
  name: string
  type: PitchType
  price_per_hour: number
  slot_duration_minutes: number
  allow_pay_at_field: boolean
  allow_online_payment: boolean
  is_active: boolean
}

export interface Booking {
  id: string
  booking_code: string
  player_id: string
  pitch_id: string
  date: string
  start_time: string
  end_time: string
  status: BookingStatus
  payment_method: PaymentMethod
  total_price: number
  amount_paid: number
  amount_due_at_field: number
  commission_amount: number
  qr_code_hash: string
  is_walk_in: boolean
  owner_notes: string | null
  created_at: string
  // joined
  pitch?: Pitch
  player?: User
}

export interface Favorite {
  id: string
  player_id: string
  field_id: string
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  player_id: string
  field_id: string
  rating: number
  comment: string | null
  created_at: string
  player?: User
}

export interface FieldPhoto {
  id: string
  field_id: string
  storage_url: string
  is_cover: boolean
  sort_order: number
}
