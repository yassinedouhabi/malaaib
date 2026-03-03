---
name: malaaib-database
description: Work with the Malaaib Supabase database. Use this skill when writing database queries, creating Supabase client instances, writing RLS policies, creating migrations, or fetching data in Server Components vs Client Components. Ensures correct schema column names, types, and role-based data isolation are always enforced.
---

You are working with the **Malaaib** Supabase PostgreSQL database.

## Supabase Client — Which to Use

| Context | Client | Import |
|---|---|---|
| Server Component / API route | `createServerClient` | `lib/supabase/server.ts` |
| Client Component | `createBrowserClient` | `lib/supabase/client.ts` |

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
}

// For admin operations (bypasses RLS) — API routes only, never client-side
import { createClient as createAdminClient } from '@supabase/supabase-js'
export const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

## Schema Reference

### users
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| phone | text UNIQUE | Primary identifier |
| full_name | text | |
| role | text | `'player' \| 'owner' \| 'admin'` |
| preferred_language | text | `'ar' \| 'fr'`, default `'ar'` |
| whatsapp_number | text | |
| created_at | timestamptz | |

### fields
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| owner_id | uuid | FK → users.id |
| name | text | |
| address | text | |
| neighborhood | text | |
| city | text | Default `'Casablanca'` |
| phone | text | |
| opening_hours | jsonb | |
| is_active | boolean | |
| is_featured | boolean | Featured = appears first in listings |

### pitches
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| field_id | uuid | FK → fields.id |
| name | text | |
| type | text | `'5v5' \| '6v6' \| '7v7' \| '11v11'` |
| price_per_hour | numeric(10,2) | |
| slot_duration_minutes | integer | 60 or 90 |
| allow_pay_at_field | boolean | |
| allow_online_payment | boolean | |
| is_active | boolean | |

### bookings
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| booking_code | text UNIQUE | `MAL-YYYYMMDD-XXXXX` |
| player_id | uuid | FK → users.id |
| pitch_id | uuid | FK → pitches.id |
| date | date | |
| start_time | time | |
| end_time | time | |
| status | text | `'pending' \| 'confirmed' \| 'cancelled' \| 'completed'` |
| payment_method | text | `'pay_at_field' \| 'cmi' \| 'cashplus' \| 'wafacash' \| 'walk_in'` |
| total_price | numeric(10,2) | |
| amount_paid | numeric(10,2) | |
| amount_due_at_field | numeric(10,2) | |
| commission_amount | numeric(10,2) | 5% except walk_in |
| qr_code_hash | text UNIQUE | SHA256 hash |
| is_walk_in | boolean | |
| arrived_at | timestamptz | Set on QR scan |
| paid_at_field_at | timestamptz | Set when owner marks paid |

### slot_locks
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| pitch_id | uuid | FK → pitches.id |
| date | date | |
| start_time | time | |
| locked_by | uuid | FK → users.id |
| locked_at | timestamptz | |
| expires_at | timestamptz | `locked_at + 10 minutes` |

### Other Tables
- `favorites(id, player_id, field_id, created_at)` — UNIQUE(player_id, field_id)
- `reviews(id, booking_id UNIQUE, player_id, field_id, rating 1-5, comment, created_at)`
- `field_photos(id, field_id, storage_url, is_cover, sort_order)`

## Common Query Patterns

```typescript
// Field listing — featured first
const { data: fields } = await supabase
  .from('fields')
  .select('*, pitches(*), field_photos(*)')
  .eq('is_active', true)
  .order('is_featured', { ascending: false })
  .order('created_at', { ascending: false })

// Player's bookings
const { data: bookings } = await supabase
  .from('bookings')
  .select('*, pitches(*, fields(*))')
  .eq('player_id', session.user.id)
  .order('date', { ascending: false })

// Owner's bookings (must scope to their fields)
const { data: bookings } = await supabase
  .from('bookings')
  .select('*, pitches!inner(*, fields!inner(*))')
  .eq('pitches.fields.owner_id', session.user.id)
  .order('date', { ascending: false })

// Check slot availability
const { data } = await supabase.rpc('check_slot_availability', {
  p_pitch_id: pitchId,
  p_date: date,
  p_start_time: startTime,
})
```

## RLS Policy Pattern

Every table needs RLS. Use this pattern:

```sql
-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Players: only their own bookings
CREATE POLICY "players_own_bookings" ON bookings
  FOR ALL USING (player_id = auth.uid());

-- Owners: only bookings for their fields
CREATE POLICY "owners_field_bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pitches p
      JOIN fields f ON f.id = p.field_id
      WHERE p.id = bookings.pitch_id
        AND f.owner_id = auth.uid()
    )
  );
```

## Migrations

Place migration files in `/supabase/migrations/` with this naming:
`YYYYMMDDHHMMSS_description.sql`

Always include both `up` migration and a commented `down` rollback.

## Data Isolation Rules (CRITICAL)

- **Players**: Only access rows where `player_id = auth.uid()`
- **Owners**: Only access rows tied to `fields.owner_id = auth.uid()`. Never expose another owner's data.
- **Never** use `adminSupabase` (service role) in client components — server-side only
- **Always** verify `session` before any DB write in API routes

## React Query Integration

```typescript
// hooks/useBookings.ts
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useMyBookings() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, pitches(*, fields(*))')
        .order('date', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
```
