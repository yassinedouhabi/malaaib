# Malaaib — Project Milestones

## Milestone 1 — Project Setup

**Goal:** Establish the base frontend architecture.

Tasks:

- Initialize **Next.js 15 (App Router)** project
- Configure **Tailwind CSS**
- Install core libraries:
  - React Hook Form
  - Zustand
  - Framer Motion
  - Lucide React

- Configure **RTL support** (`lang="ar"` and `dir="rtl"` on `<html>`)
- Install and configure fonts:
  - IBM Plex Sans Arabic
  - Geist
  - IBM Plex Mono

- Create base folder structure:

```
app/
  (player)/
  (owner)/
  (auth)/
components/
  player/
  owner/
  ui/
lib/
```

- Create `lib/mock-data.ts`
- Add global styles and spacing scale
- Implement base layout

**Outcome:** Clean project scaffold ready for UI development.

---

# Milestone 2 — Design System Implementation

**Goal:** Build reusable UI primitives following the design rules.

Core UI components:

- `Button`
- `Input`
- `Badge`
- `Card`
- `Modal`
- `Topbar`
- `Dropdown`
- `Tabs`

Requirements:

- Glass system implemented
- Correct font usage
- RTL support
- Lucide icons only
- Hover + focus states
- Mobile-first responsiveness

**Outcome:** Reusable UI system ready for screens.

---

# Milestone 3 — Authentication Flow

**Goal:** Build the full phone + OTP authentication UI (mocked).

Screens:

1. تسجيل الدخول
2. إنشاء حساب
3. إدخال رمز التحقق (OTP)

Features:

- Phone number input (`+212`)
- OTP input (6 digits)
- Mock verification (`123456`)
- Error states
- Resend countdown (30s)
- Mobile OTP autofill support

**Outcome:** Complete auth flow UI (no backend yet).

---

# Milestone 4 — Player Home Experience

**Goal:** Allow players to browse football fields.

Screen:

- **الصفحة الرئيسية**

Components:

- Field card
- Rating display
- Price display
- Location display
- Filters
- Search bar

Features:

- Mock field list
- Grid/list layout
- Empty state handling

**Outcome:** Players can browse fields.

---

# Milestone 5 — Field Detail Page

**Goal:** Provide full information about a specific field.

Screen:

- **صفحة الملعب**

Sections:

- Photo gallery
- Field information
- Pitch list
- Price per hour
- Reviews summary
- Booking button

**Outcome:** User understands field details and can start booking.

---

# Milestone 6 — Booking Flow

**Goal:** Enable users to book a time slot.

Flow:

1. Select pitch
2. Choose time slot
3. Choose payment method
4. Confirm booking

Screens:

- Slot selection
- Payment method
- Confirmation

Components:

- Time slot grid
- Booking summary
- Price breakdown

**Outcome:** Complete booking experience using mock data.

---

# Milestone 7 — Receipt & QR Screen

**Goal:** Provide booking confirmation.

Screen:

- **الوصل والـ QR**

Features:

- Booking summary
- Field info
- Date & time
- QR code
- Booking ID

**Outcome:** User receives a digital receipt.

---

# Milestone 8 — Player Account Pages

**Goal:** Allow users to manage their activity.

Screens:

1. **حجوزاتي**
   - Upcoming bookings
   - Past bookings
   - Cancelled bookings

2. **المفضلة**
   - Saved fields list

Features:

- Tabs
- Booking cards
- Empty states

**Outcome:** Player can track bookings and favorites.

---

# Milestone 9 — Owner Dashboard

**Goal:** Provide owners with a business overview.

Screen:

- **لوحة التحكم**

Widgets:

- Today's bookings
- Weekly revenue (mock)
- Upcoming reservations
- Field occupancy

**Outcome:** Owner gets quick performance insights.

---

# Milestone 10 — Owner Calendar System

**Goal:** Allow owners to visualize bookings.

Screen:

- **التقويم الكبير**

Views:

- Day
- Week
- Month

Features:

- Booking blocks
- Time slots
- Pitch differentiation

**Outcome:** Owners see schedule clearly.

---

# Milestone 11 — Booking Management

**Goal:** Enable owners to manage reservations.

Screen:

- **إدارة الحجوزات**

Features:

- Booking list
- Booking detail panel
- Status indicators:
  - متاح
  - محجوز
  - انتظار

- Filters

**Outcome:** Owners can manage reservations easily.

---

# Milestone 12 — Field Settings

**Goal:** Allow owners to configure their field.

Screen:

- **الإعدادات**

Sections:

- Field information
- Pitch configuration
- Pricing per hour
- Photos

**Outcome:** Owners can update field data.

---

# Milestone 13 — Final UI Polish

**Goal:** Bring the UI to production-quality.

Tasks:

- Responsive fixes (375px → desktop)
- Interaction polish
- Motion transitions
- Accessibility review
- Empty states everywhere
- Error states everywhere

**Outcome:** Complete frontend experience ready.

---

# Milestone 14 — Phase 2 Preparation

**Goal:** Prepare the project for backend integration.

Tasks:

- Replace mock interfaces with shared types
- Identify API boundaries
- Prepare state layers for real data
- Document data models

**Outcome:** Frontend ready for backend integration.
