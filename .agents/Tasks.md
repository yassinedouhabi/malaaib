# Malaaib — Milestones & Tasks

---

# Milestone 1 — Project Setup

## Goal

Establish the base frontend architecture.

## Tasks

### Project Initialization

- [x] Create **Next.js 15 project (App Router)**
- [x] Enable **TypeScript**
- [x] Install **Tailwind CSS**
- [x] Configure **Tailwind RTL support**
- [x] Setup **ESLint + Prettier**

### Install Core Libraries

- [x] Install `lucide-react`
- [x] Install `react-hook-form`
- [x] Install `zustand`
- [x] Install `framer-motion`

### Fonts Setup

- [ ] Install **IBM Plex Sans Arabic**
- [ ] Install **IBM Plex Mono**
- [ ] Install **Geist**
- [ ] Configure fonts in `layout.tsx`

### RTL Configuration

- [ ] Set `<html lang="ar" dir="rtl">`
- [ ] Test RTL layout rendering

### Folder Structure

- [ ] Create folders:

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

### Base Files

- [ ] Create `lib/mock-data.ts`
- [ ] Create `components/ui` folder
- [ ] Setup base `layout.tsx`
- [ ] Setup global styles
- [ ] Add spacing scale

---

# Milestone 2 — Design System Implementation

## Goal

Build reusable UI components following the design system.

## Tasks

### Base Components

- [ ] Create `Button`
- [ ] Create `Input`
- [ ] Create `Badge`
- [ ] Create `Card`
- [ ] Create `Modal`
- [ ] Create `Dropdown`
- [ ] Create `Tabs`
- [ ] Create `Topbar`

### Button Variants

- [ ] btn-green
- [ ] btn-ink
- [ ] btn-ghost

### Badge Variants

- [ ] متاح (green)
- [ ] محجوز (red)
- [ ] انتظار (amber)

### Styling

- [ ] Implement **Glass Card styles**
- [ ] Add **hover states**
- [ ] Add **focus states**
- [ ] Ensure **RTL layout compatibility**
- [ ] Use **Lucide icons only**

### Testing

- [ ] Mobile responsiveness
- [ ] Typography verification
- [ ] Spacing system validation

---

# Milestone 3 — Authentication Flow

## Goal

Build phone + OTP login UI (mocked).

## Tasks

### Login / Register Page

- [ ] Create **tabs** (تسجيل الدخول / إنشاء حساب)
- [ ] Create **phone input field**
- [ ] Add Moroccan phone validation
- [ ] Add submit button

### OTP Screen

- [ ] Create **6-digit OTP input**
- [ ] Implement **auto focus between fields**
- [ ] Support **mobile OTP autofill**
- [ ] Add **error message UI**
- [ ] Add **resend OTP button**

### Mock Logic

- [ ] Accept OTP `123456`
- [ ] Show error for invalid OTP
- [ ] Add **30-second resend timer**

### States

- [ ] Loading state
- [ ] Error state
- [ ] Success redirect

---

# Milestone 4 — Player Home

## Goal

Allow players to browse fields.

## Tasks

### Page Layout

- [ ] Create **home page layout**
- [ ] Create **search bar**
- [ ] Create **filter section**

### Field List

- [ ] Create `FieldCard` component
- [ ] Display:
  - [ ] field name
  - [ ] neighborhood
  - [ ] rating
  - [ ] price
  - [ ] availability badge

### Data

- [ ] Create mock fields in `mock-data.ts`
- [ ] Map fields to UI

### States

- [ ] Empty state
- [ ] Loading placeholder

---

# Milestone 5 — Field Detail Page

## Goal

Display full field information.

## Tasks

### Layout

- [ ] Create field detail page
- [ ] Add **photo gallery**
- [ ] Add **field info section**

### Pitches

- [ ] Create `PitchCard`
- [ ] Display pitch type
- [ ] Display hourly price

### Additional Info

- [ ] Display rating
- [ ] Display reviews count
- [ ] Add booking button

---

# Milestone 6 — Booking Flow

## Goal

Allow players to book a slot.

## Tasks

### Slot Selection

- [ ] Create **time slot grid**
- [ ] Add available / booked indicators
- [ ] Allow selecting a slot

### Booking Summary

- [ ] Show pitch
- [ ] Show time
- [ ] Show price

### Payment Screen

- [ ] Create payment method selection
- [ ] Add confirm button

### Confirmation

- [ ] Show booking success screen

---

# Milestone 7 — Receipt & QR

## Goal

Display booking confirmation.

## Tasks

### Receipt UI

- [ ] Show field name
- [ ] Show pitch
- [ ] Show date
- [ ] Show time
- [ ] Show booking ID

### QR Code

- [ ] Generate QR placeholder
- [ ] Display QR card

---

# Milestone 8 — Player Account Pages

## Goal

Allow users to manage activity.

## Tasks

### My Bookings

- [ ] Create page layout
- [ ] Add **tabs**
  - [ ] upcoming
  - [ ] past
  - [ ] cancelled

### Booking Card

- [ ] Display field
- [ ] Display date
- [ ] Display status

### Favorites

- [ ] Create favorites page
- [ ] Display saved fields
- [ ] Handle empty state

---

# Milestone 9 — Owner Dashboard

## Goal

Provide owner overview.

## Tasks

### Dashboard Layout

- [ ] Create dashboard page
- [ ] Add stats cards

### Stats

- [ ] Today's bookings
- [ ] Weekly revenue
- [ ] Upcoming bookings
- [ ] Occupancy rate

---

# Milestone 10 — Owner Calendar

## Goal

Visualize bookings.

## Tasks

### Calendar Layout

- [ ] Create full-page calendar

### Views

- [ ] Day view
- [ ] Week view
- [ ] Month view

### Booking Blocks

- [ ] Show booking time
- [ ] Show pitch name
- [ ] Show status

---

# Milestone 11 — Booking Management

## Goal

Manage reservations.

## Tasks

### Booking List

- [ ] Create bookings table
- [ ] Display status badges

### Booking Detail

- [ ] Create detail panel
- [ ] Show booking info
- [ ] Show player phone

### Filters

- [ ] Filter by date
- [ ] Filter by pitch
- [ ] Filter by status

---

# Milestone 12 — Field Settings

## Goal

Allow owners to manage field configuration.

## Tasks

### Field Info

- [ ] Field name input
- [ ] Neighborhood input
- [ ] Description field

### Pitch Settings

- [ ] Add pitch
- [ ] Edit pitch
- [ ] Set price per hour

### Media

- [ ] Upload field photos
- [ ] Display photo gallery

---

# Milestone 13 — Final UI Polish

## Goal

Reach production-quality UI.

## Tasks

### Responsiveness

- [ ] Mobile layout (375px)
- [ ] Tablet layout
- [ ] Desktop layout

### UX Polish

- [ ] Hover states everywhere
- [ ] Focus states everywhere
- [ ] Motion transitions

### Edge Cases

- [ ] Empty states
- [ ] Error states
- [ ] Disabled states

---

# Milestone 14 — Phase 2 Preparation

## Goal

Prepare for backend integration.

## Tasks

### Data Preparation

- [ ] Define shared types
- [ ] Replace loose interfaces

### Architecture

- [ ] Define API boundaries
- [ ] Identify data flows

### Documentation

- [ ] Document models
- [ ] Document API endpoints

---
