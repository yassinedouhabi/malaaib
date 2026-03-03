---
name: malaaib-i18n
description: Implement Arabic and French internationalization for Malaaib. Use this skill when adding user-facing strings, building components with text, setting up RTL/LTR layout, working with translation files in /i18n/, or handling language switching. Every string that a user sees must go through this system.
---

You are implementing internationalization for **Malaaib**, a marketplace that supports **Arabic (ar)** and **French (fr)** only.

## Core Rules

- **Default language**: Arabic (`ar`)
- **Language source**: `users.preferred_language` field in the database
- **Translation library**: `next-intl`
- **Translation files**: `/i18n/ar.json` and `/i18n/fr.json`
- **NEVER** hardcode Arabic or French strings in components — always use translation keys

## RTL / LTR Layout

Arabic → RTL (`dir="rtl"`), French → LTR (`dir="ltr"`).

Set `dir` on the `<html>` element in the root layout:

```typescript
// app/layout.tsx
export default function RootLayout({ children, params: { locale } }) {
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  )
}
```

For Tailwind RTL support, use logical properties and `rtl:` variants:

```tsx
// Use logical properties instead of left/right
<div className="ps-4 pe-4">         {/* padding-start / padding-end */}
<div className="ms-2">              {/* margin-start */}
<div className="text-start">        {/* text-align: start */}
<div className="rtl:flex-row-reverse flex-row"> {/* flip flex direction */}
```

## Using Translations in Components

```typescript
// Client component
'use client'
import { useTranslations } from 'next-intl'

export function BookingCard() {
  const t = useTranslations('booking')
  return <h2>{t('confirmTitle')}</h2>
}

// Server component
import { getTranslations } from 'next-intl/server'

export async function FieldList() {
  const t = await getTranslations('fields')
  return <h1>{t('browseTitle')}</h1>
}
```

## Translation Key Structure

Organize keys by feature domain:

```json
{
  "common": {
    "confirm": "تأكيد",
    "cancel": "إلغاء",
    "save": "حفظ",
    "loading": "جار التحميل...",
    "error": "حدث خطأ"
  },
  "auth": {
    "login": "تسجيل الدخول",
    "register": "إنشاء حساب",
    "phone": "رقم الهاتف",
    "otp": "رمز التحقق"
  },
  "fields": {
    "browseTitle": "اكتشف الملاعب",
    "filterBy": "تصفية حسب",
    "bookNow": "احجز الآن"
  },
  "booking": {
    "selectSlot": "اختر الموعد",
    "paymentMethod": "طريقة الدفع",
    "confirmTitle": "تأكيد الحجز",
    "pending": "في الانتظار",
    "confirmed": "مؤكد",
    "cancelled": "ملغي",
    "completed": "مكتمل"
  },
  "owner": {
    "dashboard": "لوحة التحكم",
    "myBookings": "الحجوزات",
    "calendar": "التقويم",
    "settings": "الإعدادات"
  },
  "errors": {
    "slotTaken": "هذا الموعد غير متاح",
    "paymentFailed": "فشل الدفع، حاول مجدداً",
    "unauthorized": "غير مصرح لك"
  }
}
```

Always add the same key to both `ar.json` and `fr.json` at the same time.

## Form Error Messages

Use React Hook Form with translated error messages:

```typescript
const { register, formState: { errors } } = useForm()
const t = useTranslations('validation')

<input {...register('phone', { required: t('required') })} />
{errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
```

## Date and Number Formatting

Use `next-intl` formatters — they handle locale automatically:

```typescript
import { useFormatter } from 'next-intl'

const format = useFormatter()

// Date
format.dateTime(new Date(booking.date), { dateStyle: 'full' })
// Arabic: "الأربعاء، 5 مارس 2025" | French: "mercredi 5 mars 2025"

// Currency (Moroccan Dirham)
format.number(price, { style: 'currency', currency: 'MAD' })
// Arabic: "١٢٠٫٠٠ د.م." | French: "120,00 MAD"
```

## WhatsApp Messages

WhatsApp notifications must also be bilingual. Always send in the user's `preferred_language`:

```typescript
// lib/whatsapp/send.ts
export async function sendWhatsApp(userId: string, templateKey: string, params: string[]) {
  const user = await getUserById(userId)
  const lang = user.preferred_language // 'ar' | 'fr'
  // Use the correct WhatsApp template for the language
  const templateName = `${templateKey}_${lang}` // e.g. "booking_confirmed_ar"
}
```

## Language Switching

Language is tied to `users.preferred_language` in the DB. When the user changes language:
1. Update `preferred_language` in Supabase
2. Update the Next.js locale (redirect to `/{locale}/...` or use cookies)
3. The `dir` attribute updates automatically on next render

## Checklist Before Committing

- [ ] All user-facing strings use translation keys
- [ ] Both `ar.json` and `fr.json` have the new keys
- [ ] RTL layout tested for Arabic (flip directions, padding, icons)
- [ ] Date/number formatting uses `next-intl` formatters, not manual strings
- [ ] Form error messages come from translations
