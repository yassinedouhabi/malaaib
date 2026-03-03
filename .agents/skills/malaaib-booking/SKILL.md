---
name: malaaib-booking
description: Implement booking features for the Malaaib football field marketplace. Use this skill when working on slot availability, slot locking, the booking flow (slot selection → payment → confirmation), QR code generation/scanning, booking status transitions, commission calculation, or any API routes under /api/bookings and /api/slots.
---

You are implementing booking features for **Malaaib** — a two-sided football field booking marketplace in Casablanca, Morocco.

## Booking Status Flow

```
created → pending → confirmed → completed
                 → cancelled
```

- `pending` = booking created, waiting owner confirmation (max 4 hours, then auto-confirmed)
- `confirmed` = owner confirmed, QR code is active
- `completed` = player arrived + paid (pay_at_field) or slot time has passed
- `cancelled` = cancelled by player or owner

## Slot Availability Rules

A slot is available **only if**:
1. No `confirmed` booking exists for that `pitch_id + date + start_time`
2. No active `slot_lock` exists for that `pitch_id + date + start_time` (check `expires_at > now()`)

Always query both conditions together before showing a slot as bookable.

## Slot Locking

When a player starts checkout:
1. Insert into `slot_locks` with `expires_at = now() + interval '10 minutes'`
2. If lock already exists and is active → return 409 conflict (slot taken)
3. If lock expired → delete it and create a new one

On every availability query, filter out expired locks (`expires_at < now()`).

```typescript
// Lock a slot
const { error } = await supabase.from('slot_locks').insert({
  pitch_id,
  date,
  start_time,
  locked_by: session.user.id,
  expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
})
```

## Creating a Booking

Before inserting, always check inside a transaction:
1. Is the slot still available? (no confirmed booking + no active lock)
2. Generate a unique `booking_code` (e.g. `MAL-YYYYMMDD-XXXXX`)
3. Generate `qr_code_hash` = `SHA256(booking_id + QR_SECRET_KEY + date)`
4. Set `status = 'pending'`
5. Set `commission_amount = total_price * 0.05` (except walk_in)

```typescript
// booking_code format
const bookingCode = `MAL-${format(date, 'yyyyMMdd')}-${nanoid(5).toUpperCase()}`
```

## Commission Rules

| Payment Method | Commission | When Charged |
|---|---|---|
| `cmi`, `cashplus`, `wafacash` | 5% | Deducted at payment time |
| `pay_at_field` | 5% | Logged, invoiced to owner weekly |
| `walk_in` | **0%** | Never charge |
| `cancelled` bookings | **0%** | Never charge |

New owners: no commission for first 7 days (`created_at + 7 days`).

## QR Code

Generate: `SHA256(booking_id + QR_SECRET_KEY + date)` — use `QR_SECRET_KEY` env var.

Valid only within **±30 minutes** of `start_time` on the booking date.

When scanned:
1. Verify hash matches and time window is valid
2. Return booking details + `total_price` (for owner to collect)
3. Set `arrived_at = now()`
4. If `pay_at_field`: owner marks paid → set `paid_at_field_at = now()`, `status = 'completed'`

```typescript
import crypto from 'crypto'
const qrHash = crypto
  .createHash('sha256')
  .update(`${bookingId}${process.env.QR_SECRET_KEY}${date}`)
  .digest('hex')
```

## API Routes

All routes under `app/api/bookings/` and `app/api/slots/`:

```typescript
// Always verify session first
const { data: { session } } = await supabase.auth.getSession()
if (!session) return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })

// Consistent response format
// Success: { data: T, message?: string }
// Error:   { error: string, code: string }
```

## Double Booking Prevention

Use a Supabase RPC function or transaction to atomically check + lock:

```sql
-- Check availability (combine in one query)
SELECT NOT EXISTS (
  SELECT 1 FROM bookings
  WHERE pitch_id = $1 AND date = $2 AND start_time = $3
    AND status = 'confirmed'
) AND NOT EXISTS (
  SELECT 1 FROM slot_locks
  WHERE pitch_id = $1 AND date = $2 AND start_time = $3
    AND expires_at > now()
) AS is_available;
```

## Role Guards

- Players: can only see/modify their own bookings (`player_id = session.user.id`)
- Owners: can only see bookings for their own fields (`field.owner_id = session.user.id`)
- Always enforce in both API routes AND Supabase RLS policies

## Payment Flow Summary

| Method | Flow |
|---|---|
| `pay_at_field` | Lock slot → create booking `pending` → owner confirms → QR issued |
| `cmi` | Lock slot → redirect to CMI → success callback → `confirmed` + QR |
| `cashplus`/`wafacash` | Lock slot → generate reference → player pays at agent → webhook → `confirmed` |

On payment failure (CMI): release slot lock, return error, do not create booking.
