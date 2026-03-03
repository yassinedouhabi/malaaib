'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function confirmBooking(bookingId: string): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)
  } catch {}
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/reservations')
}

export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
  } catch {}
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/reservations')
}

export async function completeBooking(bookingId: string, totalPrice: number): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase
      .from('bookings')
      .update({
        status: 'completed',
        amount_paid: totalPrice,
        amount_due_at_field: 0,
      })
      .eq('id', bookingId)
  } catch {}
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/reservations')
}
