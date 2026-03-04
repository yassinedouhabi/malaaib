import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function normalizePhone(raw: string) {
  const digits = raw.trim().replace(/\s+/g, '')
  if (digits.startsWith('0') && digits.length === 10) return '+212' + digits.slice(1)
  return digits
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('phone') ?? ''
  const phone = normalizePhone(raw)

  if (!phone) {
    return NextResponse.json({ error: 'missing phone' }, { status: 400 })
  }

  // Use service role to query public.users — bypasses RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .not('role', 'is', null)
    .maybeSingle()

  return NextResponse.json({ exists: !!data })
}
