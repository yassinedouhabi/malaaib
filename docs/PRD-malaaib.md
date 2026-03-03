# Product Requirements Document (PRD)
## Malaaib — Football Field Booking Platform — Morocco

**Website:** malaaib.com / malaaib.ma

**Version:** 1.0  
**Date:** March 2026  
**Status:** Draft  
**Author:** Founder  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Target Users](#4-target-users)
5. [User Personas](#5-user-personas)
6. [Core Features — Players](#6-core-features--players)
7. [Core Features — Field Owners](#7-core-features--field-owners)
8. [Payment System](#8-payment-system)
9. [Booking Receipt & QR Code](#9-booking-receipt--qr-code)
10. [Notifications System](#10-notifications-system)
11. [User Flows](#11-user-flows)
12. [Tech Stack & Architecture](#12-tech-stack--architecture)
13. [Database Schema](#13-database-schema)
14. [Business Model & Monetization](#14-business-model--monetization)
15. [Launch Strategy](#15-launch-strategy)
16. [MVP Build Order](#16-mvp-build-order)
17. [Out of Scope (Phase 2)](#17-out-of-scope-phase-2)

---

## 1. Project Overview

A web application that allows football players in Morocco to discover, browse, and book football fields online — and allows field owners to manage their bookings, availability, and revenue from a single dashboard.

The platform replaces the current manual process of booking fields via WhatsApp or in-person visits. It provides a centralized, reliable, and fast experience for both players and field owners.

**Project Name:** Malaaib (ملاعب)  
**Domain:** malaaib.com / malaaib.ma  
**Launch City:** Casablanca  
**Languages Supported:** Arabic, French  
**Primary Device:** Mobile (but fully responsive on desktop)

---

## 2. Problem Statement

### Current Situation

In Morocco, booking a football field today means:
- Calling or texting the field owner on WhatsApp
- Going to the field in person to check availability
- Having no confirmation or receipt for the booking
- Dealing with double bookings and miscommunication
- No centralized place to discover all available fields in a city

### Why This Is a Problem

- **For players:** Wasted time, no guarantees, no easy way to compare fields or prices
- **For owners:** No system to manage bookings, risk of missed slots, manual tracking in notebooks or chats
- **For both:** No clear record of payment or booking history

### The Solution

A two-sided platform where:
- Players can browse fields, check real-time availability, and book + pay online in a few taps
- Owners get a professional dashboard to manage all bookings, availability, and revenue in one place

---

## 3. Goals & Success Metrics

### Business Goals

| Goal | Target (3 months post-launch) |
|---|---|
| Number of fields listed | 15+ fields in Casablanca |
| Number of registered players | 500+ accounts |
| Number of bookings processed | 200+ bookings |
| Commission revenue | 5% of each completed booking |

### Product Goals

- Booking should take less than 3 minutes from landing on the platform
- Field owners should be able to confirm a booking in under 30 seconds
- Zero double bookings (real-time slot locking)
- All bookings have a receipt and QR code for field entry

---

## 4. Target Users

This is a two-sided marketplace. Both sides are equally important.

### Side 1 — Players
People who want to rent a football field for a casual game or organized match.

- Age: 16–40
- Location: Casablanca (at launch)
- Devices: Mostly mobile (Android & iOS via browser)
- Language preference: Arabic or French
- Currently books via WhatsApp or in person

### Side 2 — Field Owners
Businesses or individuals who own and operate football fields (5v5, 6v6, 7v7, or 11v11 pitches).

- Age: 25–55
- Business size: 1–5 pitches per location
- Currently manage bookings via WhatsApp, phone calls, or notebooks
- Need: A simple system to reduce no-shows, manage availability, and track revenue

---

## 5. User Personas

### Persona 1 — Youssef (Player)

> "I want to book a field quickly without having to message 10 different numbers."

- 24 years old, student in Casablanca
- Plays football every weekend with friends
- Always on his phone
- Frustrated by unavailable fields and last-minute cancellations
- Wants to see real-time availability and confirm instantly

### Persona 2 — Hassan (Field Owner)

> "I lose money every week because of empty slots and no-shows."

- 38 years old, owns a 5v5 and 7v7 field in Ain Sebaa
- Manages bookings manually via WhatsApp
- Deals with no-shows and double bookings regularly
- Wants a simple tool — not too technical
- Needs WhatsApp notifications because he's always on it

---

## 6. Core Features — Players

### 6.1 Authentication

- Sign up with phone number (OTP via WhatsApp or SMS)
- Log in / Log out
- Password reset via WhatsApp OTP
- Profile page: name, phone number, profile photo (optional)

### 6.2 Browse & Search Fields

- See a list of all available fields in the city
- Filter by:
  - Pitch type: 5v5 / 6v6 / 7v7 / 11v11
  - Price range (MAD per hour)
  - Availability (specific date or "today")
  - Area/neighborhood in the city
- Each field has a card showing:
  - Field name
  - Photos
  - Pitch types available
  - Price per hour
  - Average rating (stars)
  - Distance (text only, no map for now)

### 6.3 Field Detail Page

Each field has its own dedicated page showing:
- Field name, description, full address
- Photos gallery
- List of pitches (e.g. Pitch A — 5v5, Pitch B — 7v7)
- Price per slot for each pitch
- Availability calendar (date picker + time slots)
- Reviews and ratings from previous players
- Owner contact info (WhatsApp link for questions only)

### 6.4 Booking Flow

Step-by-step flow:
1. Player selects a date from the calendar
2. Player sees available time slots for that date
3. Player selects a time slot (slot is temporarily locked for 10 minutes during checkout)
4. Player selects payment method:
   - **Pay at field** — no upfront payment, player pays the full amount on arrival when their QR code is scanned at the field entrance
   - **Full payment** via CMI, CashPlus, or Wafacash
5. Player reviews the booking summary (field, pitch, date, time, price, payment method)
6. Player confirms (and pays if full payment selected)
7. Booking is confirmed — receipt and QR code are generated

**Slot locking:** Once a player starts checkout, the slot is locked for 10 minutes. If payment is not completed, the slot is released automatically.

### 6.5 Booking Receipt

After a successful booking, the player receives:
- A receipt displayed on screen
- A receipt sent to their email
- A receipt accessible from their "My Bookings" page

Receipt contents are detailed in Section 9.

### 6.6 My Bookings

A page in the player's account showing:
- **Upcoming bookings** — with field name, date, time, QR code button, and status
- **Past bookings** — with field name, date, and option to leave a review
- **Cancelled bookings** — with reason and refund status if applicable

### 6.7 Favorites

- Player can tap a heart icon on any field card or field detail page to save it
- "My Favorites" section in their account lists all saved fields
- Player can also favorite a specific field owner
- Favorites are synced to their account (not local device)

### 6.8 Reviews & Ratings

- After a booking slot has passed, the player is prompted to leave a review
- Rating: 1–5 stars
- Optional written comment
- Reviews are public and shown on the field's detail page
- Player can only leave one review per booking

---

## 7. Core Features — Field Owners

### 7.1 Owner Authentication

- Separate registration flow for owners
- Sign up with: name, phone number, email, field name, address, number of pitches
- Account is reviewed and approved by admin before going live (to ensure quality)
- Login / Logout
- Password reset

### 7.2 Owner Dashboard — Home

The dashboard home shows a quick summary:
- Today's bookings (count)
- Today's revenue (MAD)
- Upcoming bookings for the next 7 days
- Pending confirmations (bookings waiting for owner to confirm)
- Occupancy rate this week (% of slots filled)

### 7.3 Big Calendar

The calendar is the core of the owner experience. It should be full-page and detailed.

**Views available:**
- Day view
- Week view (default)
- Month view

**Each booking slot on the calendar shows:**
- Player name
- Pitch type (5v5, 7v7, etc.)
- Time slot
- Payment status (paid online / pay at field / walk-in)
- Booking status (confirmed / pending / cancelled / walk-in)

**Color coding:**
| Color | Meaning |
|---|---|
| Green | Confirmed booking |
| Yellow | Pending (awaiting owner confirmation) |
| Blue | Walk-in (manually added) |
| Red | Cancelled |
| Grey | Blocked / unavailable |

**Calendar actions:**
- Click on a booking to see full details
- Add a manual/walk-in booking directly on the calendar
- Block a time slot (maintenance, personal use, etc.)
- Cancel a booking from the calendar

**Revenue on calendar:**
- Each day on the month view shows total revenue for that day
- Week view shows a revenue total at the bottom of each day column

### 7.4 Booking Management

- See a list view of all bookings (with filters: date range, status, pitch)
- Click any booking to see:
  - Player name and phone number
  - Pitch and time slot
  - Amount paid / amount due
  - Payment method
  - Booking QR code
- Confirm or cancel a booking
- Add a note to any booking (e.g. "Player called to confirm")

### 7.5 Booking Confirmation

When a player makes a booking, the owner must confirm it. Confirmation can happen in two ways:

**Option A — Via WhatsApp:**
The owner receives a WhatsApp message with:
- Player name
- Field and pitch
- Date and time
- Amount paid
- Two buttons: ✅ Confirm / ❌ Cancel (deep link to dashboard)

**Option B — Via the Dashboard:**
- A notification badge appears on the dashboard
- Owner sees the pending booking and clicks Confirm or Cancel

If the owner does not confirm within 2 hours, the system sends a reminder. If no action after 4 hours, the booking is auto-confirmed to avoid losing the player.

### 7.6 QR Code Scanner

- Owner (or staff) can scan the player's QR code at field entry
- Scanning opens the booking details and marks the player as "arrived"
- Works from the owner's phone browser — no app needed
- If the QR code is invalid or the booking is cancelled, it shows a red error message

### 7.7 Field & Pitch Settings

The owner can configure:

**Field-level settings:**
- Field name and description
- Full address
- Photos (upload multiple images)
- Opening hours (e.g. 08:00–24:00 every day)
- Custom hours per day of week (e.g. Friday closes at 01:00)
- Contact phone number (shown on field page)

**Pitch-level settings (per pitch):**
- Pitch name (e.g. "Terrain 1")
- Pitch type: 5v5 / 6v6 / 7v7 / 11v11
- Price per hour (MAD)
- Slot duration: 1 hour or 1.5 hours
- Available days

**Payment settings:**
- Enable or disable "Pay at field" option for players
- Enable or disable online payment methods (CMI, CashPlus, Wafacash)

### 7.8 Revenue Overview

A separate analytics section showing:
- Total revenue this month vs last month
- Total number of bookings this month
- Revenue per pitch (which pitch earns the most)
- Most booked time slots (peak hours)
- Cancellation rate

---

## 8. Payment System

### 8.1 Payment Methods

| Method | Type | Notes |
|---|---|---|
| **Pay at field** | No upfront payment | Player reserves the slot for free online, pays the full amount at the field when their QR code is scanned on arrival |
| **CMI** | Card payment | Main Moroccan card gateway |
| **CashPlus** | Cash-based digital | Customer pays at a CashPlus agent |
| **Wafacash** | Mobile money | Transfer via Wafacash network |

### 8.2 Pay at Field Logic

- Player books a slot with zero upfront payment
- Booking is confirmed and a QR code is generated immediately
- When the player arrives, the owner scans their QR code
- The QR scan triggers a prompt showing the full amount due
- Player pays the owner directly (cash or mobile payment)
- Owner marks the booking as paid in the dashboard
- The platform's 5% commission is invoiced to the owner at the end of each week based on completed pay-at-field bookings

### 8.3 Full Payment Logic

- Player pays 100% of the booking fee online
- Platform takes 5% commission
- Owner receives 95% of the booking amount

### 8.4 Refund Policy

- If owner cancels: Booking is voided, no payment was made so no refund needed
- If player cancels more than 24h before: Booking is cancelled, no penalty
- If player cancels less than 24h before (pay at field): Owner is notified, slot is released — no financial penalty since no online payment was made
- If player cancels less than 24h before (online payment): No refund (configurable by owner)
- Online payment refunds are processed back to the original payment method within 3–5 business days

### 8.5 Platform Commission

- 5% is deducted from every completed booking
- For **online payments (CMI, CashPlus, Wafacash):** commission is deducted automatically at the time of payment
- For **pay at field bookings:** commission is invoiced to the owner weekly based on completed bookings
- Commission is NOT charged on walk-in bookings added manually by the owner
- Commission is NOT charged on cancelled bookings

---

## 9. Booking Receipt & QR Code

### 9.1 Receipt Contents

Every confirmed booking generates a receipt containing:

| Field | Example |
|---|---|
| Booking ID | #BK-20260301-0042 |
| Field Name | Terrain Casa Nord |
| Pitch | Terrain B — 7v7 |
| Date | Saturday, 15 March 2026 |
| Time Slot | 18:00 – 19:00 |
| Player Name | Youssef El Amrani |
| Payment Method | Pay at field |
| Amount Paid Online | 0 MAD |
| Amount Due at Field | 200 MAD |
| Booking Status | Confirmed |
| QR Code | [unique QR image] |
| Booking Date | 10 March 2026, 14:32 |

### 9.2 QR Code Details

- Each booking has a unique QR code
- The QR code encodes the Booking ID + a security hash (to prevent faking)
- When scanned by the owner at entry, it shows full booking details and the amount due
- Owner marks the player as "paid" and "arrived" after collecting payment
- QR code is valid only for the booked time slot (±30 minutes)
- QR code is displayed on screen after booking and included in the email receipt

### 9.3 Receipt Delivery

- Shown immediately on screen after booking is confirmed
- Sent via **WhatsApp** to the player's registered phone number (link to view full receipt)
- Always accessible in "My Bookings" → click any booking → "View Receipt"

---

## 10. Notifications System

All notifications for both players and field owners are sent exclusively via **WhatsApp**. No email notifications.

### 10.1 Player Notifications

| Event | Channel | Message |
|---|---|---|
| Booking confirmed | WhatsApp | "✅ Booking confirmed at [Field] on [Date] at [Time]. Show your QR code at entry." |
| Booking cancelled by owner | WhatsApp | "❌ Your booking at [Field] on [Date] was cancelled. No payment was taken." |
| Reminder 2h before slot | WhatsApp | "⏰ Your game at [Field] starts in 2 hours. Open your QR code: [link]" |
| Review prompt | WhatsApp | "⭐ How was your experience at [Field]? Leave a review: [link]" |

### 10.2 Owner Notifications

| Event | Channel | Message |
|---|---|---|
| New booking received | WhatsApp | Player name, pitch, date, time, payment method + Confirm/Cancel buttons |
| Booking cancelled by player | WhatsApp | Which slot was cancelled, player name, and date/time freed up |
| Confirmation reminder | WhatsApp | Sent if no action after 2 hours — "You have a pending booking to confirm." |
| Daily summary (optional) | WhatsApp | "📋 Today you have X bookings. Amount to collect: X MAD." |

### 10.3 WhatsApp Integration

- Uses **WhatsApp Business API** (via a provider like Twilio or 360dialog)
- Both players and owners must provide their WhatsApp number at registration
- All messages are sent in Arabic or French based on the user's language preference
- Deep links in WhatsApp messages open directly to the relevant page (booking details, QR code, review form)
- Owner Confirm/Cancel buttons in WhatsApp are deep links to the dashboard action — one tap to confirm

---

## 11. User Flows

### 11.1 Player — Booking a Field

```
Landing page
  → Browse fields (filter by type / price / date)
    → Click on a field
      → Field detail page (photos, pitches, calendar)
        → Select a date
          → See available time slots
            → Select a slot
              → Choose payment method
                → Review booking summary
                  → Pay
                    → Booking confirmed ✅
                      → Receipt + QR code displayed
                        → Email sent
```

### 11.2 Owner — Confirming a Booking

```
New booking is made by player
  → Owner receives WhatsApp notification
    → Owner clicks "Confirm" in WhatsApp
      OR
    → Owner logs into dashboard
      → Sees pending booking notification
        → Reviews booking details
          → Clicks "Confirm"
            → Player is notified ✅
              → Booking appears as confirmed on calendar
```

### 11.3 Player — Field Entry

```
Player arrives at field
  → Opens "My Bookings" on phone
    → Selects upcoming booking
      → Taps "Show QR Code"
        → QR code displayed on screen
          → Owner scans QR with phone camera
            → Booking details shown to owner ✅
              → Player marked as "arrived"
```

### 11.4 Owner — Adding a Walk-in Booking

```
Player arrives without online booking
  → Owner opens dashboard on phone/tablet
    → Goes to calendar
      → Clicks on empty slot
        → Clicks "Add manual booking"
          → Enters player name + payment collected
            → Slot marked as walk-in (blue) ✅
```

---

## 12. Tech Stack & Architecture

### 12.1 Frontend

| Tool | Purpose |
|---|---|
| **Next.js 14** (React) | Main framework — SSR for SEO, fast page loads |
| **Tailwind CSS** | Styling — mobile-first, utility classes |
| **React Query** | Data fetching and caching |
| **Zustand** | Lightweight state management |
| **React Hook Form** | Forms (booking, registration) |
| **FullCalendar.js** | Owner calendar component |
| **QRCode.js** | QR code generation for receipts |

### 12.2 Backend & Database

| Tool | Purpose |
|---|---|
| **Supabase** | Postgres database + auth + real-time + file storage |
| **Supabase Auth** | User authentication (players and owners) |
| **Supabase Realtime** | Live slot availability updates |
| **Supabase Storage** | Field photos and receipt files |
| **Next.js API Routes** | Custom server logic (booking locks, commission calc) |

### 12.3 Payments

| Tool | Purpose |
|---|---|
| **CMI** | Moroccan card payment gateway |
| **CashPlus API** | Cash payment integration |
| **Wafacash API** | Mobile money integration |

### 12.4 Notifications

| Tool | Purpose |
|---|---|
| **WhatsApp Business API** | Owner booking notifications |
| **Twilio or 360dialog** | WhatsApp API provider for all notifications (players + owners) |

### 12.5 Hosting & DevOps

| Tool | Purpose |
|---|---|
| **Vercel** | Frontend hosting + Next.js API routes |
| **Supabase** | Database hosting (free tier to start) |
| **GitHub** | Version control |

### 12.6 Architecture Overview

```
User Browser (Next.js)
    ↕ API calls
Next.js API Routes (Vercel)
    ↕ Database queries
Supabase (Postgres + Auth + Realtime)
    ↕ Events / webhooks
External Services (WhatsApp API, Payment gateways, Email)
```

---

## 13. Database Schema

### 13.1 Core Tables

**users**
```
id (uuid, primary key)
email (string, unique)
phone (string)
full_name (string)
role (enum: player | owner | admin)
preferred_language (enum: ar | fr)
created_at (timestamp)
```

**fields**
```
id (uuid, primary key)
owner_id (uuid → users.id)
name (string)
description (text)
address (string)
city (string)
phone (string)
opening_hours (jsonb)
is_active (boolean)
is_featured (boolean)
created_at (timestamp)
```

**pitches**
```
id (uuid, primary key)
field_id (uuid → fields.id)
name (string)
type (enum: 5v5 | 6v6 | 7v7 | 11v11)
price_per_hour (decimal)
slot_duration_minutes (integer)
allow_pay_at_field (boolean)
allow_online_payment (boolean)
is_active (boolean)
```

**bookings**
```
id (uuid, primary key)
booking_code (string, unique — e.g. BK-20260301-0042)
player_id (uuid → users.id)
pitch_id (uuid → pitches.id)
date (date)
start_time (time)
end_time (time)
status (enum: pending | confirmed | cancelled | completed)
payment_method (enum: pay_at_field | cmi | cashplus | wafacash | walk_in)
total_price (decimal)
amount_paid (decimal)
amount_due_at_field (decimal)
commission_amount (decimal)
qr_code_hash (string)
is_walk_in (boolean)
owner_notes (text)
created_at (timestamp)
```

**favorites**
```
id (uuid, primary key)
player_id (uuid → users.id)
field_id (uuid → fields.id)
created_at (timestamp)
```

**reviews**
```
id (uuid, primary key)
booking_id (uuid → bookings.id)
player_id (uuid → users.id)
field_id (uuid → fields.id)
rating (integer, 1–5)
comment (text)
created_at (timestamp)
```

**field_photos**
```
id (uuid, primary key)
field_id (uuid → fields.id)
storage_url (string)
is_cover (boolean)
sort_order (integer)
```

---

## 14. Business Model & Monetization

### 14.1 Revenue Streams

#### Stream 1 — Commission per Booking (Active from Day 1)

- **Rate:** 5% of every completed booking
- **Calculation:** Applied on every completed booking — deducted automatically for online payments, invoiced weekly for pay-at-field bookings
- **When charged:** Only on confirmed + completed bookings
- **Not charged on:** Walk-in bookings, cancelled bookings
- **Example:** Player books for 200 MAD and pays full → Platform earns 10 MAD

#### Stream 2 — Featured Listings (Active from Phase 2)

- Field owners pay a weekly or monthly fee to appear at the top of search results
- Price: TBD based on market response (estimated 200–500 MAD/month)
- Triggered when there are 5+ fields competing in the same city

### 14.2 Free Trial

- All new field owners get **7 days free** with zero commission
- Trial starts from the day their first booking is received
- After trial ends, 5% commission applies automatically
- Owners are notified by WhatsApp and email when their trial is ending (3 days before)

### 14.3 Revenue Projections (Conservative — Month 3)

| Metric | Estimate |
|---|---|
| Active fields | 15 |
| Bookings per field per week | 20 |
| Average booking price | 150 MAD |
| Total weekly bookings | 300 |
| Total weekly revenue (platform) | 300 × 150 × 5% = **2,250 MAD** |
| Total monthly revenue | ~**9,000 MAD** |

---

## 15. Launch Strategy

### 15.1 Phase 0 — Before Launch (Weeks 1–4)

- Build and test the MVP
- Identify 5 field owners in Casablanca to onboard as early partners
- Visit each owner in person, show them a demo, and sign them up
- Offer the 7-day free trial + 1 month of 0% commission as early adopter benefit
- Collect their field photos, prices, and availability manually to populate the platform

### 15.2 Phase 1 — Soft Launch (Week 5–8)

- Platform goes live with 5–10 fields in Casablanca
- Share on Instagram, TikTok, and WhatsApp groups (football communities)
- Gather player feedback and fix critical bugs
- Monitor bookings and confirm everything works end to end

### 15.3 Phase 2 — Growth (Month 3+)

- Expand to 15–20 fields in Casablanca
- Introduce featured listings
- Add more cities (Rabat, Marrakech)
- Explore subscription plans for owners with premium features

### 15.4 Owner Onboarding Pitch

When approaching field owners, lead with:

1. **"We fill your empty slots"** — show them they're losing money every week from unfilled hours
2. **"No upfront cost"** — 7 days free, then only pay when you earn
3. **"Works with WhatsApp"** — they don't have to change how they communicate
4. **"Reduces no-shows"** — players who book online are far more committed than WhatsApp bookings
5. **"Simple dashboard"** — no complicated training needed

---

## 16. MVP Build Order

Build in this order to have a working product as fast as possible:

| Step | Feature | Priority |
|---|---|---|
| 1 | Auth — Player & Owner registration/login | 🔴 Critical |
| 2 | Field listing page + filters | 🔴 Critical |
| 3 | Field detail page (photos, pitches, info) | 🔴 Critical |
| 4 | Availability calendar — player view | 🔴 Critical |
| 5 | Booking flow (slot selection → summary → confirm) | 🔴 Critical |
| 6 | Pay at field logic — booking confirmed with zero upfront payment | 🔴 Critical |
| 7 | Booking receipt + QR code generation | 🔴 Critical |
| 8 | Owner dashboard — calendar view | 🔴 Critical |
| 9 | Owner booking confirmation (dashboard + WhatsApp) | 🟠 High |
| 10 | QR code scanner for owners | 🟠 High |
| 11 | CMI payment integration | 🟠 High |
| 12 | CashPlus + Wafacash integration | 🟡 Medium |
| 13 | Email receipts | 🟡 Medium |
| 14 | Favorites (fields + owners) | 🟡 Medium |
| 15 | Reviews & ratings | 🟡 Medium |
| 16 | Revenue analytics for owners | 🟡 Medium |
| 17 | Featured listings | 🟢 Phase 2 |
| 18 | Multi-city support | 🟢 Phase 2 |
| 19 | Maps integration | 🟢 Phase 2 |

---

## 17. Out of Scope (Phase 2)

The following features are intentionally excluded from the MVP to keep the build fast and focused:

- **Maps / geolocation** — fields shown by neighborhood text only
- **Mobile app (iOS/Android)** — web only for now (PWA-ready)
- **Subscription plans** — flat monthly fee for owners
- **Multi-city support** — Casablanca only at launch
- **Team management** — organizing recurring team sessions
- **In-app chat** — players and owners communicate via WhatsApp
- **Referral program** — invite friends and earn credit
- **Admin panel** — managed manually during MVP phase

---

*This document will be updated as the product evolves. All decisions made after this version should be recorded in a changelog.*
