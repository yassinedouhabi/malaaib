# Malaaib — Football Field Booking Platform

## Project Overview

A search-based booking platform for football fields (5v5, 6v6, 7v7, 11v11).
Clients search, browse, and book available fields. Owners list fields and manage bookings.
MVP — free platform, monetization comes later.

---

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, shadcn/ui
- **Backend**: Next.js API Routes (Route Handlers)
- **Database**: MongoDB Atlas (free tier) + Mongoose ODM
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **WhatsApp**: Meta WhatsApp Business Cloud API (free tier: 1,000 service conversations/month)
- **Deployment**: Vercel (frontend + API) + MongoDB Atlas

---

## Design Rules

- shadcn/ui components only — no custom CSS beyond layout
- No emojis, icons, custom colors, fonts, or images
- Clean visual style: white background, card-based, clean typography
- Minimal styling — focus on functionality

---

## Core Decisions (locked)

| Decision | Choice |
|---|---|
| Business model | Free for now, monetize later |
| Client accounts | Both guest (name+phone+email) and optional account |
| Time slots | Owner sets working hours, system auto-generates slots |
| Booking approval | Instant (no owner approval needed) |
| WhatsApp notifications | Both client and owner receive |
| Peak pricing | No — flat price per field for MVP |
| Cities | Owner enters any city (no fixed list) |

---

## User Roles

### Client (Player)
- Location detected automatically (browser geolocation)
- Search fields by city + date + type
- Browse search results with filters
- View field details and available slots
- Book as guest (name + phone + email) or with account
- View booking history (if logged in)
- Receive WhatsApp confirmation

### Field Owner
- Register and login
- Add/edit/delete fields
- Field location captured automatically (geolocation or manual address)
- Set working hours per day of week
- Set price per hour and slot duration
- View dashboard with bookings
- Receive WhatsApp notification on new booking

---

## MongoDB Collections

### Owner
```
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (required, WhatsApp number),
  createdAt: Date
}
```

### Field
```
{
  ownerId: ObjectId (ref: Owner, required),
  name: String (required),
  description: String,
  type: String (enum: "5v5", "6v6", "7v7", "11v11", required),
  city: String (required),
  neighborhood: String,
  address: String,
  location: {
    lat: Number,
    lng: Number
  },
  pricePerHour: Number (required, in MAD),
  workingHours: [
    {
      day: Number (0=Sunday ... 6=Saturday),
      open: String ("14:00"),
      close: String ("00:00")
    }
  ],
  slotDuration: Number (minutes, default: 60),
  amenities: [String] (e.g. ["parking", "lighting", "changing rooms", "water"]),
  isActive: Boolean (default: true),
  createdAt: Date
}
```

### Booking
```
{
  fieldId: ObjectId (ref: Field, required),
  date: String (required, "YYYY-MM-DD"),
  startTime: String (required, "HH:mm"),
  endTime: String (required, "HH:mm"),
  clientName: String (required),
  clientPhone: String (required),
  clientEmail: String,
  userId: ObjectId (ref: User, optional, null for guest),
  status: String (enum: "confirmed", "cancelled", default: "confirmed"),
  totalPrice: Number (required),
  createdAt: Date
}
```

### User
```
{
  name: String (required),
  phone: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date
}
```

---

## Slot Generation Algorithm

This is the most critical backend logic.

1. Receive `fieldId` + `date`
2. Get field's `workingHours` for that day of week
3. If no working hours for that day → return empty (field is closed)
4. Generate all possible slots from `open` to `close` using `slotDuration`
   - Example: open=14:00, close=00:00, duration=60min
   - Slots: 14:00-15:00, 15:00-16:00, ... 23:00-00:00
5. Query all confirmed bookings for that field + date
6. Remove slots that overlap with existing bookings
7. Return available slots only

### Race Condition Protection

When creating a booking, use MongoDB atomic operation:
```javascript
// Check + create in one atomic operation
const existingBooking = await Booking.findOne({
  fieldId, date, startTime, status: "confirmed"
});
if (existingBooking) throw new Error("Slot already booked");

// Use a unique compound index on (fieldId, date, startTime, status)
// to prevent duplicates at the database level
```

Better: create a compound unique index:
```javascript
BookingSchema.index(
  { fieldId: 1, date: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } }
);
```

---

## API Routes

### Public
- `GET /api/fields/search?city=&date=&type=&minPrice=&maxPrice=&amenities=`
- `GET /api/fields/[id]`
- `GET /api/fields/[id]/slots?date=`
- `GET /api/cities`
- `POST /api/bookings`
- `GET /api/bookings/[id]`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Owner (JWT protected)
- `GET /api/owner/fields`
- `POST /api/owner/fields`
- `PUT /api/owner/fields/[id]`
- `DELETE /api/owner/fields/[id]` (soft delete)
- `GET /api/owner/bookings?date=`
- `GET /api/owner/stats`
- `PATCH /api/owner/bookings/[id]/cancel`

### User (JWT protected)
- `GET /api/user/bookings`
- `GET /api/user/profile`
- `PUT /api/user/profile`

---

## Pages

### Client-facing
- `/` — Homepage with search bar (city + date + type)
- `/search` — Search results with filters sidebar
- `/fields/[id]` — Field detail + slot picker
- `/checkout` — Booking checkout (guest or logged in)
- `/booking/[id]` — Booking confirmation
- `/login` — Login page
- `/register` — Register page
- `/my-bookings` — User booking history

### Owner-facing
- `/owner/dashboard` — Bookings overview + stats
- `/owner/fields` — Manage fields
- `/owner/fields/new` — Add new field
- `/owner/fields/[id]/edit` — Edit field

---

## Folder Structure

```
malaaib/
  CLAUDE.md                           (this file)
  src/
    app/
      page.tsx
      layout.tsx
      search/page.tsx
      fields/[id]/page.tsx
      checkout/page.tsx
      booking/[id]/page.tsx
      login/page.tsx
      register/page.tsx
      my-bookings/page.tsx
      owner/
        dashboard/page.tsx
        fields/page.tsx
        fields/new/page.tsx
        fields/[id]/edit/page.tsx
      api/
        fields/
          search/route.ts
          [id]/route.ts
          [id]/slots/route.ts
        cities/route.ts
        bookings/
          route.ts
          [id]/route.ts
        auth/
          login/route.ts
          register/route.ts
        owner/
          fields/route.ts
          fields/[id]/route.ts
          bookings/route.ts
          bookings/[id]/cancel/route.ts
          stats/route.ts
        user/
          bookings/route.ts
          profile/route.ts
    lib/
      db.ts                           (MongoDB connection singleton)
      auth.ts                         (JWT sign/verify + middleware)
      whatsapp.ts                     (Send WhatsApp messages via Meta Cloud API)
      slots.ts                        (Slot generation algorithm)
    models/
      Owner.ts
      Field.ts
      Booking.ts
      User.ts
    components/
      SearchBar.tsx
      FieldCard.tsx
      SlotGrid.tsx
      BookingForm.tsx
      FilterSidebar.tsx
      Navbar.tsx
      BookingSummary.tsx
```

---

## Environment Variables

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
WHATSAPP_TOKEN=your-meta-api-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_VERIFY_TOKEN=your-webhook-verify-token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Development Notes

- MongoDB connection uses singleton pattern (important for Next.js hot reload)
- All API routes validate input before processing
- Passwords hashed with bcrypt (salt rounds: 12)
- JWT expires in 7 days
- All dates stored as strings "YYYY-MM-DD" for simplicity
- All times stored as strings "HH:mm" in 24h format
- Prices in MAD (Moroccan Dirham), stored as integers (no decimals)
