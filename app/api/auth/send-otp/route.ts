import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const MAX_SENDS   = 5
const WINDOW_MS   = 10 * 60 * 1000  // 10 min
const OTP_TTL_S   = 180              // 3 min

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function generateOtp(): string {
  // Cryptographically secure 6-digit OTP
  const bytes = crypto.randomBytes(3)
  const num = ((bytes[0] << 16) | (bytes[1] << 8) | bytes[2]) % 1_000_000
  return num.toString().padStart(6, '0')
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'رقم الهاتف مطلوب' }, { status: 400 })

  const db   = admin()
  const now  = Date.now()

  // ── Rate limit check ────────────────────────────────────────────────────────
  const { data: sendRow } = await db
    .from('otp_sends')
    .select('*')
    .eq('phone', phone)
    .maybeSingle()

  if (sendRow) {
    if (sendRow.locked_until && new Date(sendRow.locked_until).getTime() > now) {
      const secs = Math.ceil((new Date(sendRow.locked_until).getTime() - now) / 1000)
      return NextResponse.json({ error: 'rate_limited', seconds_left: secs }, { status: 429 })
    }

    const age = now - new Date(sendRow.window_start).getTime()

    if (age >= WINDOW_MS) {
      // Window expired — reset counter
      await db.from('otp_sends')
        .update({ send_count: 1, window_start: new Date().toISOString(), locked_until: null })
        .eq('phone', phone)
    } else if (sendRow.send_count >= MAX_SENDS) {
      // Lock until window expires
      const lockedUntil = new Date(new Date(sendRow.window_start).getTime() + WINDOW_MS).toISOString()
      await db.from('otp_sends').update({ locked_until: lockedUntil }).eq('phone', phone)
      const secs = Math.ceil((new Date(lockedUntil).getTime() - now) / 1000)
      return NextResponse.json({ error: 'rate_limited', seconds_left: secs }, { status: 429 })
    } else {
      await db.from('otp_sends').update({ send_count: sendRow.send_count + 1 }).eq('phone', phone)
    }
  } else {
    await db.from('otp_sends').insert({ phone, send_count: 1, window_start: new Date().toISOString() })
  }

  // ── Generate + hash OTP ─────────────────────────────────────────────────────
  const otp      = generateOtp()
  const hash     = await bcrypt.hash(otp, 10)
  const expiresAt = new Date(now + OTP_TTL_S * 1000).toISOString()

  await db.from('phone_otps').upsert({
    phone,
    hash,
    expires_at: expiresAt,
    attempts: 0,
    created_at: new Date().toISOString(),
  })

  // ── Send via Twilio ──────────────────────────────────────────────────────────
  const accountSid = process.env.TWILIO_ACCOUNT_SID!
  const authToken  = process.env.TWILIO_AUTH_TOKEN!
  const from       = process.env.TWILIO_PHONE_NUMBER!
  const body       = `رمز التحقق الخاص بك في ملاعب: ${otp}\nصالح لمدة 3 دقائق.`

  const smsRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: phone, From: from, Body: body }).toString(),
    }
  )

  if (!smsRes.ok) {
    const err = await smsRes.json()
    console.error('Twilio error:', JSON.stringify(err))

    // DEV MODE: if SMS fails, log OTP to console so you can test without verified number
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📱 DEV OTP for ${phone}: [ ${otp} ]\n`)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'فشل إرسال الرسالة' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
