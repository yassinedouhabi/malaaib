# AGENTS.md
## Malaaib (ملاعب) — AI Agent Instructions

This file tells any AI coding agent (Claude, Cursor, Copilot, etc.) everything it needs to know about this project. Read this file fully before writing any code, suggesting changes, or answering questions.

---

## 1. What Is This Project?

Malaaib is a **two-sided web marketplace** for booking football fields in Morocco.

- **Players** discover fields, check real-time availability, and book a slot in under 3 minutes.
- **Field owners** manage all their bookings, availability, and revenue from one dashboard.

It replaces the current manual system of booking via WhatsApp or visiting fields in person.

**Website:** malaaib.com / malaaib.ma  
**Launch city:** Casablanca, Morocco  
**Languages:** Arabic (ar) and French (fr) — both must always be supported  
**Primary device:** Mobile browser (design mobile-first)

---

## 2. Tech Stack

Always use these tools. Do not suggest alternatives unless explicitly asked.

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| Next.js | 14 (App Router) | Main framework |
| React | 18 | UI library |
| Tailwind CSS | 3 | Styling — utility classes only, mobile-first |
| React Query | v5 | Data fetching and caching |
| Zustand | latest | Global state management |
| React Hook Form | latest | All forms |
| FullCalendar.js | latest | Owner booking calendar |
| QRCode.js | latest | QR code generation |

### Backend & Database
| Tool | Purpose |
|---|---|
| Supabase | Postgres DB + Auth + Realtime + Storage |
| Next.js API Routes | Custom server logic (slot locking, commission, webhooks) |

### Payments
| Tool | Purpose |
|---|---|
| CMI | Moroccan card payment gateway |
| CashPlus API | Cash-based digital payment |
| Wafacash API | Mobile money payment |

### Notifications
| Tool | Purpose |
|---|---|
| WhatsApp Business API | All notifications for both players and owners |
| Twilio or 360dialog | WhatsApp API provider |

> ⚠️ There is NO email system. All notifications go through WhatsApp only.

### Hosting
| Tool | Purpose |
|---|---|
| Vercel | Frontend + API routes |
| Supabase | Database (hosted) |
| GitHub | Version control |

---

## 3. Project Structure

```
malaaib/
├── app/                        # Next.js App Router
│   ├── (player)/               # Player-facing pages
│   │   ├── page.tsx            # Home / field listing
│   │   ├── fields/
│   │   │   └── [id]/page.tsx   # Field detail page
│   │   ├── booking/
│   │   │   └── [id]/page.tsx   # Booking flow
│   │   └── account/
│   │       ├── bookings/       # My bookings
│   │       └── favorites/      # Saved fields
│   ├── (owner)/                # Owner dashboard pages
│   │   ├── dashboard/page.tsx  # Dashboard home
│   │   ├── calendar/page.tsx   # Big calendar
│   │   ├── bookings/page.tsx   # Booking list
│   │   └── settings/page.tsx   # Field & pitch settings
│   ├── (auth)/                 # Auth pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx   # Separate flows for player and owner
│   └── api/                    # Next.js API routes
│       ├── bookings/
│       │   ├── create/route.ts
│       │   ├── confirm/route.ts
│       │   └── cancel/route.ts
│       ├── slots/
│       │   └── lock/route.ts   # Temporary slot locking
│       ├── payments/
│       │   ├── cmi/route.ts
│       │   ├── cashplus/route.ts
│       │   └── wafacash/route.ts
│       └── whatsapp/
│           └── webhook/route.ts
├── components/
│   ├── player/                 # Player-specific components
│   ├── owner/                  # Owner-specific components
│   ├── shared/                 # Used by both sides
│   └── ui/                     # Base UI components
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   ├── whatsapp/
│   │   └── send.ts             # WhatsApp message sending
│   ├── payments/
│   │   └── commission.ts       # Commission calculation logic
│   └── qr/
│       └── generate.ts         # QR code generation
├── hooks/                      # Custom React hooks
├── store/                      # Zustand stores
├── types/                      # TypeScript types
│   └── index.ts                # All shared types
├── utils/                      # Helper functions
├── i18n/                       # Arabic and French translations
│   ├── ar.json
│   └── fr.json
└── supabase/
    ├── migrations/             # Database migrations
    └── seed.sql                # Seed data for development
```

---

## 4. Database Schema

These are the exact tables in Supabase. Always use these names and types.

### users
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
phone           text UNIQUE NOT NULL
full_name       text NOT NULL
role            text CHECK (role IN ('player', 'owner', 'admin')) NOT NULL
preferred_language text CHECK (preferred_language IN ('ar', 'fr')) DEFAULT 'ar'
whatsapp_number text
created_at      timestamptz DEFAULT now()
```

### fields
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
owner_id        uuid REFERENCES users(id) NOT NULL
name            text NOT NULL
description     text
address         text NOT NULL
neighborhood    text
city            text DEFAULT 'Casablanca'
phone           text
opening_hours   jsonb
is_active       boolean DEFAULT false
is_featured     boolean DEFAULT false
created_at      timestamptz DEFAULT now()
```

### pitches
```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
field_id              uuid REFERENCES fields(id) NOT NULL
name                  text NOT NULL
type                  text CHECK (type IN ('5v5', '6v6', '7v7', '11v11')) NOT NULL
price_per_hour        numeric(10,2) NOT NULL
slot_duration_minutes integer DEFAULT 60
allow_pay_at_field    boolean DEFAULT true
allow_online_payment  boolean DEFAULT true
is_active             boolean DEFAULT true
```

### bookings
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
booking_code        text UNIQUE NOT NULL
player_id           uuid REFERENCES users(id) NOT NULL
pitch_id            uuid REFERENCES pitches(id) NOT NULL
date                date NOT NULL
start_time          time NOT NULL
end_time            time NOT NULL
status              text CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending'
payment_method      text CHECK (payment_method IN ('pay_at_field', 'cmi', 'cashplus', 'wafacash', 'walk_in'))
total_price         numeric(10,2) NOT NULL
amount_paid         numeric(10,2) DEFAULT 0
amount_due_at_field numeric(10,2)
commission_amount   numeric(10,2)
qr_code_hash        text UNIQUE NOT NULL
is_walk_in          boolean DEFAULT false
owner_notes         text
arrived_at          timestamptz
paid_at_field_at    timestamptz
created_at          timestamptz DEFAULT now()
```

### slot_locks
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
pitch_id    uuid REFERENCES pitches(id) NOT NULL
date        date NOT NULL
start_time  time NOT NULL
locked_by   uuid REFERENCES users(id)
locked_at   timestamptz DEFAULT now()
expires_at  timestamptz NOT NULL
```

### favorites
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
player_id   uuid REFERENCES users(id) NOT NULL
field_id    uuid REFERENCES fields(id) NOT NULL
created_at  timestamptz DEFAULT now()
UNIQUE(player_id, field_id)
```

### reviews
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
booking_id  uuid REFERENCES bookings(id) UNIQUE NOT NULL
player_id   uuid REFERENCES users(id) NOT NULL
field_id    uuid REFERENCES fields(id) NOT NULL
rating      integer CHECK (rating BETWEEN 1 AND 5) NOT NULL
comment     text
created_at  timestamptz DEFAULT now()
```

### field_photos
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
field_id    uuid REFERENCES fields(id) NOT NULL
storage_url text NOT NULL
is_cover    boolean DEFAULT false
sort_order  integer DEFAULT 0
```

---

## 5. User Roles

There are three roles in the system. Every page and API route must check the correct role.

| Role | Access |
|---|---|
| `player` | Browse fields, make bookings, manage own account |
| `owner` | Dashboard, calendar, manage their own field(s) only |
| `admin` | Approve new owner accounts, manage the platform (manual for MVP) |

- A user cannot be both a player and an owner at the same time.
- Owners can only see and modify data belonging to their own fields. Never expose another owner's data.
- Players can only see and modify their own bookings and account.

---

## 6. Booking Logic — Critical Rules

These rules must be enforced in every booking-related function.

### Slot Locking
- When a player starts the checkout flow, lock the slot for **10 minutes** by inserting into `slot_locks`.
- If payment or confirmation is not completed within 10 minutes, delete the lock automatically (use a Supabase cron job or check on every slot availability query).
- A slot is considered available only if: no confirmed booking exists AND no active lock exists for that pitch + date + time.

### Booking Status Flow
```
created → pending → confirmed → completed
                 → cancelled
```
- `pending` = booking created, waiting for owner to confirm
- `confirmed` = owner confirmed, QR code is active
- `completed` = player arrived and paid (for pay_at_field) or slot time has passed
- `cancelled` = cancelled by player or owner

### Commission Rules
- 5% commission on every completed booking.
- For online payments (CMI, CashPlus, Wafacash): deduct automatically at payment time.
- For `pay_at_field`: log the commission owed, invoice owner weekly.
- Never charge commission on `walk_in` bookings.
- Never charge commission on `cancelled` bookings.

### QR Code
- Generate a unique `qr_code_hash` for every booking: `SHA256(booking_id + secret_key + date)`.
- QR code is valid only within ±30 minutes of `start_time` on the booking date.
- When scanned, return the booking details and amount due. Mark `arrived_at` timestamp.

### Double Booking Prevention
- Before creating a booking, always check: does any confirmed booking or active slot lock exist for this pitch + date + start_time?
- Use a Supabase transaction or Row Level Security policy to prevent race conditions.

---

## 7. Payment Methods

### Pay at Field
- No online transaction.
- Booking is confirmed immediately (or after owner confirmation).
- QR code is issued.
- On QR scan at field: show total_price to owner, owner marks as paid.
- Commission is tracked and invoiced to owner weekly.

### CMI (Card)
- Redirect to CMI payment page.
- On success callback: update booking status to `confirmed`, set `amount_paid`, generate QR.
- On failure: release slot lock, show error.

### CashPlus / Wafacash
- Generate a payment reference number.
- Player pays at agent using reference.
- On payment confirmation webhook: update booking to `confirmed`.
- Slot stays locked until payment confirmed or lock expires.

---

## 8. WhatsApp Notifications

All notifications use WhatsApp. There is no email system.

### Trigger Points

| Event | Recipient | Action |
|---|---|---|
| New booking created | Owner | Send booking details + Confirm/Cancel deep links |
| Booking confirmed | Player | Send confirmation + link to QR code |
| Booking cancelled by owner | Player | Send cancellation notice |
| Booking cancelled by player | Owner | Send cancellation + freed slot info |
| No owner action after 2 hours | Owner | Send reminder |
| Slot starts in 2 hours | Player | Send reminder + QR code link |
| After slot time passes | Player | Send review prompt with link |

### Message Format Rules
- Always send in the user's `preferred_language` (ar or fr).
- Keep messages short and clear — one idea per message.
- Always include a deep link where relevant (booking page, QR code, dashboard).
- Use the WhatsApp template format required by the Business API.
- Deep links format: `https://malaaib.ma/booking/{booking_code}`

### WhatsApp Setup
- Use Twilio or 360dialog as the provider.
- Store the API credentials in environment variables (never hardcode).
- Webhook endpoint: `POST /api/whatsapp/webhook` — handles owner replies (Confirm/Cancel).

---

## 9. i18n — Arabic & French

Every user-facing string must support both Arabic and French.

- Use a translation library (next-intl recommended).
- Translation files live in `/i18n/ar.json` and `/i18n/fr.json`.
- Default language is Arabic (`ar`).
- Language is set per user in their profile (`preferred_language`).
- Arabic uses RTL layout — always set `dir="rtl"` when language is `ar`.
- French uses LTR layout.
- Never hardcode Arabic or French strings in components. Always use translation keys.

---

## 10. Component & Code Rules

Follow these rules in every file you write or modify.

### General
- Use **TypeScript** everywhere. No `any` types.
- Use **named exports** for components. No default exports except for Next.js pages.
- Keep components small and focused — one responsibility per component.
- If a component is over 150 lines, split it.

### Styling
- Use **Tailwind CSS only** for styling. No inline styles, no CSS modules.
- Design **mobile-first**. Start with small screen styles, add `md:` and `lg:` breakpoints only when needed.
- Use the color palette defined in `tailwind.config.ts`. Do not use arbitrary color values.

### Forms
- Use **React Hook Form** for every form. No uncontrolled inputs.
- Always validate on the client before submitting to the server.
- Always show clear error messages in the user's language.

### Data Fetching
- Use **React Query** for all data fetching and mutations on the client.
- Use **Supabase server client** for data fetching in Server Components.
- Never fetch data directly in a client component without React Query.

### API Routes
- Every API route must verify the user's session from Supabase Auth before processing.
- Return consistent error responses: `{ error: string, code: string }`.
- Return consistent success responses: `{ data: T, message?: string }`.

### Security
- Never expose another user's data. Always filter by the authenticated user's ID.
- Owners can only access their own fields and bookings.
- Players can only access their own bookings and profile.
- Validate all inputs server-side, even if already validated on the client.

---

## 11. Environment Variables

Never hardcode secrets. Use these environment variable names exactly.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# WhatsApp
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# Payments
CMI_MERCHANT_ID=
CMI_API_KEY=
CMI_CALLBACK_URL=
CASHPLUS_API_KEY=
CASHPLUS_API_URL=
WAFACASH_API_KEY=
WAFACASH_API_URL=

# QR Code
QR_SECRET_KEY=

# App
NEXT_PUBLIC_APP_URL=https://malaaib.ma
```

---

## 12. What NOT to Do

These are hard rules. Do not break them.

- ❌ Do not add email functionality anywhere. All notifications are WhatsApp only.
- ❌ Do not add maps or geolocation. Fields are shown by neighborhood text only (Phase 2).
- ❌ Do not build a mobile app. Web only. The site should be PWA-ready but not a native app.
- ❌ Do not add multi-city support. Casablanca only for now.
- ❌ Do not add an in-app chat. Players and owners communicate via WhatsApp externally.
- ❌ Do not add subscription/monthly plans for owners. Commission only at this stage.
- ❌ Do not charge commission on walk-in or cancelled bookings.
- ❌ Do not allow an owner to see another owner's bookings, fields, or revenue.
- ❌ Do not hardcode Arabic or French strings — always use translation keys.
- ❌ Do not use `any` in TypeScript.
- ❌ Do not use inline styles — Tailwind only.

---

## 13. MVP Build Order

Build features in this order. Do not jump ahead unless the current step is done and tested.

| Step | Feature |
|---|---|
| 1 | Supabase setup — schema, auth, RLS policies |
| 2 | Auth — player and owner registration and login (OTP via WhatsApp/SMS) |
| 3 | Field listing page — browse and filter fields |
| 4 | Field detail page — photos, pitches, info |
| 5 | Availability calendar — player view, real-time slot availability |
| 6 | Booking flow — slot selection → payment method → confirmation |
| 7 | Pay at field logic — zero upfront, QR code generated on confirmation |
| 8 | QR code generation and display for players |
| 9 | Owner dashboard home — summary stats |
| 10 | Owner big calendar — day/week/month views with booking details |
| 11 | Owner booking confirmation — via dashboard and WhatsApp deep links |
| 12 | QR code scanner — owner scans player QR on arrival |
| 13 | WhatsApp notifications — all trigger points for players and owners |
| 14 | CMI payment integration |
| 15 | CashPlus + Wafacash integration |
| 16 | Favorites system |
| 17 | Reviews and ratings |
| 18 | Owner revenue analytics |

---

## 14. Key Business Rules (Always Enforce)

- A player can only book a slot that is available (no existing confirmed booking or active lock).
- An owner must confirm a booking within 4 hours or it is auto-confirmed.
- Commission is 5% on every completed booking (except walk-ins and cancellations).
- New owners get 7 days free — no commission is charged during the trial period.
- A QR code is only valid within ±30 minutes of the booking start time.
- A player can only leave one review per booking.
- Featured listings (is_featured = true) always appear first in search results.
- A player must provide a valid WhatsApp number at registration — it is the primary communication channel.
- Slot duration is either 60 or 90 minutes, set per pitch by the owner.

---

*Keep this file updated whenever the tech stack, schema, or business rules change.*
