import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const MAX_ATTEMPTS = 5

// Synthetic email so we can use generateLink for session creation
function syntheticEmail(phone: string) {
  return `${phone.replace(/\D/g, '')}@phones.malaaib`
}

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const { phone, otp } = await req.json()
  if (!phone || !otp) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  const db = admin()

  // ── Fetch OTP record ──────────────────────────────────────────────────────
  const { data: record } = await db
    .from('phone_otps')
    .select('*')
    .eq('phone', phone)
    .maybeSingle()

  if (!record) {
    return NextResponse.json({ error: 'لم يتم إرسال رمز لهذا الرقم' }, { status: 400 })
  }

  // ── Expiry check ──────────────────────────────────────────────────────────
  if (new Date(record.expires_at).getTime() < Date.now()) {
    await db.from('phone_otps').delete().eq('phone', phone)
    return NextResponse.json({ error: 'expired' }, { status: 400 })
  }

  // ── Attempt limit ─────────────────────────────────────────────────────────
  if (record.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'locked' }, { status: 429 })
  }

  // ── Hash compare ──────────────────────────────────────────────────────────
  const valid = await bcrypt.compare(otp.trim(), record.hash)
  if (!valid) {
    await db.from('phone_otps').update({ attempts: record.attempts + 1 }).eq('phone', phone)
    const remaining = MAX_ATTEMPTS - record.attempts - 1
    return NextResponse.json({ error: 'invalid_otp', attempts_left: remaining }, { status: 400 })
  }

  // ── Valid — delete record (single-use) ────────────────────────────────────
  await db.from('phone_otps').delete().eq('phone', phone)

  // ── Get or create Supabase auth user ─────────────────────────────────────
  const email = syntheticEmail(phone)
  let userId: string | null = null

  // Check public.users first (fastest lookup)
  const { data: profileRow } = await db
    .from('users')
    .select('id')
    .eq('phone', phone)
    .maybeSingle()

  if (profileRow?.id) {
    userId = profileRow.id
    // Ensure they have the synthetic email for generateLink
    await db.auth.admin.updateUserById(userId, {
      email,
      email_confirm: true,
      phone_confirm: true,
    })
  } else {
    // New user — create in auth
    const { data: created, error: createErr } = await db.auth.admin.createUser({
      phone,
      phone_confirm: true,
      email,
      email_confirm: true,
    })
    if (createErr) {
      return NextResponse.json({ error: 'فشل إنشاء المستخدم' }, { status: 500 })
    }
    userId = created.user.id
  }

  // ── Generate magic link token for client session exchange ─────────────────
  const { data: linkData, error: linkErr } = await db.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (linkErr || !linkData) {
    return NextResponse.json({ error: 'فشل إنشاء الجلسة' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    token_hash: linkData.properties.hashed_token,
    user_id: userId,
  })
}
