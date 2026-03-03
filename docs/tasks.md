# Malaaib — Project Milestones & Tasks

---

## M1 — Foundation

- [ ] Initialize Next.js 14 project with Tailwind CSS, ESLint, and TypeScript
- [ ] Configure Supabase project (database, auth, storage buckets)
- [ ] Create all database tables per schema (users, fields, pitches, bookings, favorites, reviews, field_photos)
- [ ] Set up Supabase Auth with phone number + OTP (players and owners)
- [ ] Implement role-based routing and middleware (player / owner / admin)
- [ ] Set up environment variables and project folder structure
- [ ] Configure React Query and Zustand

---

## M2 — Field Discovery

- [ ] Build field listing page with field cards (name, photo, type, price, rating)
- [ ] Implement filters: pitch type, price range, date/today, area/neighborhood
- [ ] Build field detail page: photos gallery, pitch list, pricing, address, description
- [ ] Display owner contact (WhatsApp link) on field detail page
- [ ] Show reviews and ratings on field detail page

---

## M3 — Booking Core

- [ ] Build date picker + time slot availability view (player-facing)
- [ ] Implement real-time slot locking (10-minute hold via Supabase Realtime)
- [ ] Auto-release locked slot on timeout or page exit
- [ ] Build booking summary step (field, pitch, date, time, price, payment method)
- [ ] Implement pay-at-field booking: confirm with zero upfront payment
- [ ] Generate booking code (BK-YYYYMMDD-XXXX format)

---

## M4 — Receipts & QR Codes

- [ ] Generate unique QR code per booking (Booking ID + security hash via QRCode.js)
- [ ] Build receipt display page (all fields from PRD section 9.1)
- [ ] Build "My Bookings" page: upcoming, past, and cancelled tabs
- [ ] Add "View Receipt" and "Show QR Code" actions per booking
- [ ] Send receipt link to player via WhatsApp after booking

---

## M5 — Owner Dashboard

- [ ] Build dashboard home: today's bookings count, today's revenue, 7-day upcoming, pending confirmations
- [ ] Integrate FullCalendar.js with day / week / month views
- [ ] Implement color-coded booking statuses on calendar (green / yellow / blue / red / grey)
- [ ] Show daily revenue totals on month view; column totals on week view
- [ ] Build booking list view with filters (date range, status, pitch)
- [ ] Build booking detail panel: player info, payment status, notes field
- [ ] Implement confirm / cancel actions from dashboard
- [ ] Build manual walk-in booking form (player name + amount collected)
- [ ] Build block slot functionality (maintenance, personal use)

---

## M6 — QR Scanner & Entry

- [ ] Build QR scanner page using browser camera API (no app required)
- [ ] Validate QR hash and check time window (±30 min from slot start)
- [ ] Display full booking details on successful scan
- [ ] Implement "Mark as Arrived" and "Mark as Paid" actions
- [ ] Show clear error for invalid, expired, or cancelled QR codes

---

## M7 — Online Payments

- [ ] Integrate CMI card payment gateway
- [ ] Integrate CashPlus API
- [ ] Integrate Wafacash API
- [ ] Implement 5% platform commission deduction on online payments
- [ ] Handle payment success / failure callbacks and booking status updates
- [ ] Release slot automatically if payment not completed within 10 minutes

---

## M8 — Notifications

- [ ] Set up WhatsApp Business API via Twilio or 360dialog
- [ ] Player notifications: booking confirmed, booking cancelled, 2h reminder, review prompt
- [ ] Owner notifications: new booking received (with Confirm/Cancel deep links), cancellation alert, 2h confirmation reminder, optional daily summary
- [ ] Auto-confirm booking if owner takes no action after 4 hours
- [ ] Support Arabic and French message templates per user language preference

---

## M9 — Player Features

- [ ] Build favorites: heart icon on field cards and detail page
- [ ] Build "My Favorites" page (synced to account)
- [ ] Trigger post-booking review prompt via WhatsApp after slot passes
- [ ] Build review form: 1–5 stars + optional written comment
- [ ] Enforce one review per booking; display reviews on field detail page

---

## M10 — Owner Analytics & Settings

- [ ] Build revenue overview: this month vs last month, total bookings
- [ ] Revenue breakdown per pitch
- [ ] Peak hours chart (most booked time slots)
- [ ] Cancellation rate metric
- [ ] Build field settings page: name, description, address, photos, opening hours
- [ ] Build pitch settings: type, price, slot duration, payment options, available days

---

## M11 — Pre-Launch

- [ ] Full mobile responsiveness audit (Android + iOS browsers)
- [ ] End-to-end booking flow testing (player → book → owner confirm → QR scan)
- [ ] WhatsApp notification delivery testing (all events)
- [ ] Payment flow testing for each gateway (CMI, CashPlus, Wafacash)
- [ ] Performance audit: image optimization, page load times
- [ ] Onboard 5 pilot field owners in Casablanca (photos, pricing, hours)
- [ ] Seed initial field data and run a live test booking per field
