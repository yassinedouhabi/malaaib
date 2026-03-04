import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Verify the request comes from Supabase
  const authHeader = req.headers.get('authorization')
  const secret = process.env.SUPABASE_SMS_HOOK_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { phone, otp } = await req.json()
  if (!phone || !otp) {
    return NextResponse.json({ error: 'Missing phone or otp' }, { status: 400 })
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!
  const authToken = process.env.TWILIO_AUTH_TOKEN!
  const from = process.env.TWILIO_PHONE_NUMBER!

  const body = `رمز التحقق الخاص بك في ملاعب: ${otp}`

  const res = await fetch(
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

  if (!res.ok) {
    const err = await res.json()
    console.error('Twilio error:', err)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
