import type { SupabaseClient } from '@supabase/supabase-js'
import type { Field } from '@/types'

interface FieldFilters {
  type?: string
  city?: string
}

export async function getFields(supabase: SupabaseClient, filters: FieldFilters = {}): Promise<Field[]> {
  let query = supabase
    .from('fields')
    .select(`
      *,
      pitches (*),
      field_photos (*),
      reviews (rating)
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  const { data, error } = await query

  if (error || !data) return []

  let fields = data as Field[]

  // Filter by pitch type client-side (easier than nested filter in PostgREST)
  if (filters.type) {
    fields = fields.filter(f =>
      f.pitches?.some(p => p.type === filters.type && p.is_active)
    )
  }

  // Compute avg_rating from joined reviews
  return fields.map(f => {
    const ratings = (f.reviews ?? []).map((r: { rating: number }) => r.rating)
    const avg = ratings.length > 0
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : 0
    return { ...f, avg_rating: Math.round(avg * 10) / 10 }
  })
}

export async function getFieldById(supabase: SupabaseClient, id: string): Promise<Field | null> {
  const { data, error } = await supabase
    .from('fields')
    .select(`
      *,
      pitches (*),
      field_photos (*),
      reviews (*, player:users(*))
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  const field = data as Field
  const ratings = (field.reviews ?? []).map(r => r.rating)
  const avg = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0

  return {
    ...field,
    avg_rating: Math.round(avg * 10) / 10,
    field_photos: (field.field_photos ?? []).sort((a, b) => a.sort_order - b.sort_order),
    pitches: (field.pitches ?? []).filter(p => p.is_active),
  }
}
