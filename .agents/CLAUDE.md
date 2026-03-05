# CLAUDE.md
## Malaaib (ملاعب) — Instructions for Claude

Read this file before touching any code. Short, direct, no fluff.

---

## 0. Skills First — Always

Before writing any component, page, or feature, check the `.agents/` folder in the project root.

```
.agents/
  design.md        ← design system rules (read before any UI work)
  auth.md          ← phone OTP auth flow (read before any auth work)
  components.md    ← reusable component patterns
  [others...]
```

**Rule:** If a relevant skill file exists in `.agents/`, read it first and follow it. These files contain project-specific patterns that override general defaults.

---

## 1. What We Are Building

Malaaib is a football field booking platform for Morocco. Two types of users:
- **لاعب (Player)** — finds and books a field
- **مالك (Owner)** — manages their field and bookings

That's it. Keep everything focused on these two goals.

---

## 2. Current Phase — Frontend Only

**We are building the frontend UI only. No backend, no database, no API calls.**

- Use hardcoded mock data for everything
- No Supabase, no API routes, no server logic yet
- DB and backend come after all screens are done and approved
- If you find yourself writing a `fetch()`, `createClient()`, or any DB query — stop. That's Phase 2.

---

## 3. Tech Stack (Frontend Only for Now)

```
Next.js 15        App Router
React 18          UI
Tailwind CSS      Styling only — no CSS modules, no styled-components
Lucide React      Icons only — no emojis anywhere
React Hook Form   Forms
Zustand           UI state (no server state yet)
Framer Motion     Page transitions only — keep it subtle
```

---

## 4. Language — Arabic Only

**Every single word visible to the user must be in Arabic. No exceptions.**

- Buttons, labels, placeholders, error messages, headings — all Arabic
- `<html lang="ar" dir="rtl">` — always set on the root
- All text content flows right-to-left
- Use Tailwind `rtl:` variants where needed
- Do not add French or English text in any UI element

---

## 5. Design System — Non-Negotiable

Read `.agents/design.md` for the full system. Summary below — memorize it.

### Colors
| Token | Hex | Use |
|---|---|---|
| Green | `#16a34a` | CTA, primary actions, active states |
| Green Dim | `#bbf7d0` | Available badge background |
| Green Deep | `#052e16` | Code, hover states |
| Ink | `#0c0c0c` | Headings, primary text |
| Ink-2 | `#3a3a3a` | Body text |
| Soft | `#f0f2f0` | Page background |
| Muted | `#8f9490` | Secondary text, labels |
| Border | `#e2e6e2` | Dividers, input borders |
| Red | `#dc2626` | Booked, error |
| Amber | `#d97706` | Pending, warning |

### Fonts — Only These Three
| Font | Use |
|---|---|
| `IBM Plex Sans Arabic` 600/700 | All headings (h1–h3), display text only |
| `Geist` 300/400/500 | Body, labels, buttons, inputs — everything else |
| `IBM Plex Mono` 400/600 | Prices, times, tags, technical labels |

**Banned fonts:** Inter, Arial, Roboto, system-ui — never use them.

### Glass System
Three card styles — always on a background (never on plain white):
```css
/* Light Glass */
bg: rgba(255,255,255,0.55)  border: rgba(255,255,255,0.75)  blur(20px)

/* Soft Glass */
bg: rgba(240,242,240,0.70)  border: rgba(255,255,255,0.65)  blur(20px)

/* Dark Glass */
bg: rgba(12,12,12,0.82)  border: rgba(255,255,255,0.08)  blur(28px)
```

Use glass for: Topbar, Cards, Modals, Sidebars, Dropdowns.

### Spacing Scale
`4 · 8 · 16 · 24 · 40 · 64` — stick to these values.

### Components
```
Buttons:     height 40px · radius 9px · Geist 500
             btn-ink (#0c0c0c) · btn-green (#16a34a) · btn-ghost (border)
Badges:      IBM Mono · radius 5px · Lucide icon 11px
             متاح (green) · محجوز (red) · انتظار (amber)
Inputs:      Geist 400 · radius 9px · focus border → green · dir="rtl"
Icons:       Lucide React · 16px inline · 20px UI · no emojis ever
Shadows:     shadow-sm only — glass border replaces shadow-xl
Transitions: 0.15s ease for hover · Framer Motion for page transitions only
```

### Rules
- No `shadow-xl` — glass border is enough
- No emojis — use Lucide icons
- No purple gradients
- No cookie-cutter generic card layouts
- `dir="rtl"` on `<html>` — never forget this

---

## 6. Phone Auth Flow

Read `.agents/auth.md` before building any auth screen. Summary:

**Login flow:**
1. User enters phone number (Moroccan format `+212...`)
2. System checks if phone exists
3. Send OTP via SMS — 6 digits, 3-minute window
4. User enters OTP
5. If valid → auto-login (create session)
6. If invalid → show error + resend option after 30s

**Register flow:**
1. User enters phone number
2. Check phone does NOT already exist (show error if it does)
3. Send OTP
4. User enters OTP
5. OTP valid → create user record → auto-login → onboarding

**OTP Engine rules:**
- 6 digits, generated with `crypto.randomBytes(3)`
- TTL: 180 seconds
- Stored as bcrypt hash — never plain text
- Max 5 attempts before lockout
- Single use — invalidate immediately after successful verify
- Auto-read OTP on mobile (use `autocomplete="one-time-code"`)

**For now (FE only):** Build all auth screens with mock behavior. Simulate OTP with a hardcoded code like `123456` during development.

---

## 7. Page Structure

Build screens in this order. **Finish one before starting the next.**

### Player Side
| # | Screen | Notes |
|---|---|---|
| 1 | صفحة تسجيل الدخول / إنشاء حساب | Phone + OTP, two tabs |
| 2 | الصفحة الرئيسية | List of fields, filters |
| 3 | صفحة الملعب | Field detail, pitches, calendar |
| 4 | تدفق الحجز | Slot → payment method → confirm |
| 5 | الوصل والـ QR | Receipt screen + QR code display |
| 6 | حجوزاتي | Upcoming / past / cancelled |
| 7 | المفضلة | Saved fields |

### Owner Side
| # | Screen | Notes |
|---|---|---|
| 8 | لوحة التحكم | Stats summary |
| 9 | التقويم الكبير | Day/week/month, full page |
| 10 | إدارة الحجوزات | List + detail view |
| 11 | الإعدادات | Field info, pitch settings |

---

## 8. File & Folder Conventions

```
app/
  (player)/         Player pages
  (owner)/          Owner dashboard pages
  (auth)/           Login + register
components/
  player/           Player-specific components
  owner/            Owner-specific components
  ui/               Shared base components (Button, Badge, Input, Card...)
lib/
  mock-data.ts      All hardcoded mock data lives here
```

- One component per file
- File names in kebab-case: `field-card.tsx`, `booking-flow.tsx`
- Component names in PascalCase: `FieldCard`, `BookingFlow`
- No barrel `index.ts` files yet — keep it simple
- TypeScript everywhere — no `any`

---

## 9. Mock Data

All data is fake until Phase 2. Put it all in `lib/mock-data.ts`.

Example structure:
```ts
export const mockFields = [
  {
    id: '1',
    name: 'ملعب النجوم',
    neighborhood: 'عين الشق',
    city: 'الدار البيضاء',
    rating: 4.5,
    reviewCount: 23,
    pitches: [
      { id: 'p1', type: '5v5', pricePerHour: 80, name: 'الملعب أ' },
      { id: 'p2', type: '7v7', pricePerHour: 120, name: 'الملعب ب' },
    ],
    photos: ['/mock/field1.jpg'],
  }
]
```

---

## 10. What NOT to Do

- ❌ No backend code, no API routes, no Supabase — frontend only
- ❌ No English or French text in any UI element — Arabic only
- ❌ No emojis in UI — use Lucide icons
- ❌ No Inter, Arial, or Roboto fonts — use IBM Plex + Geist only
- ❌ No `shadow-xl` — glass border is enough
- ❌ No `any` in TypeScript
- ❌ Do not skip reading `.agents/` before starting a feature
- ❌ Do not build screen N+1 before screen N is done
- ❌ No inline styles — Tailwind only
- ❌ No hardcoded Arabic strings scattered in components — keep all text in the component itself for now (i18n comes later)

---

## 11. Done Means Done

A screen is "done" when:
1. It matches the design system (fonts, colors, glass, RTL)
2. All text is in Arabic
3. It works on mobile (375px) first, then desktop
4. Mock data is wired up and displays correctly
5. All interactive states work: hover, focus, active, empty state, error state

---

*For full product context, read `PRD-malaaib.md`. For full agent rules, read `AGENTS.md`.*
