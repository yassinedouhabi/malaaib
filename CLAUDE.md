# CLAUDE.md — Frontend Design Rules

> Personal rules for thepenguinboss. Apply these in every UI task.

---

## 🎨 Visual Style

Two styles in balance — use context to decide which leads:

### Clean Minimal (default for apps, dashboards, forms)
- Generous white space — let elements breathe
- Light backgrounds: `#ffffff`, `#f9f9f7`, `#f5f4f0`
- Thin borders: `1px solid #e5e7eb` or `1px solid #f1f5f9`
- No shadows unless absolutely needed — use borders instead
- One dominant color max per screen, rest is neutral
- Layouts: centered, single-column friendly, clear hierarchy

### Bold & Colorful (for landing pages, headers, CTAs, highlights)
- High contrast: dark on light or light on dark — no soft mid-tones
- Sharp accent colors: `#facc15` (yellow), `#ef4444` (red), `#111111` (black)
- Use color as a weapon — highlight ONE thing, not everything
- Square/sharp corners on buttons and cards (`border-radius: 0` or `2px`)
- Big, heavy typography for headlines
- Accent backgrounds: solid color blocks, not gradients

---

## 🔤 Typography

### Primary Rule
**NEVER use:** Inter, Roboto, Arial, system-ui, sans-serif fallbacks as primary font.

### Font Stack (always load from Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
```

| Role | Font | Weight |
|------|------|--------|
| Arabic body | IBM Plex Sans Arabic | 300–600 |
| Latin body | IBM Plex Sans | 300–500 |
| Code / labels / tags | IBM Plex Mono | 400–600 |
| Bold headlines | IBM Plex Sans Arabic 700 | 700 |

### Type Scale (Tailwind)
- Display: `text-3xl font-bold` or `text-4xl font-bold`
- Heading: `text-xl font-semibold`
- Body: `text-sm font-normal` or `text-base font-light`
- Label/tag: `text-xs font-medium tracking-widest uppercase` (Mono)
- Muted: `text-xs text-gray-400`

---

## 🌐 Arabic / RTL Rules

- **Always** set `dir="rtl"` on `<html>` for Arabic interfaces
- **Always** set `lang="ar"` on `<html>`
- Use `IBM Plex Sans Arabic` as the primary font — handles Arabic beautifully
- In Tailwind RTL: use `rtl:` variants for spacing flips
- Avoid icon-only buttons without labels in Arabic UIs
- Numbers: use Western `0123` consistently (Moroccan standard)
- Currency: `د.م.` (Moroccan Dirham) — place after the amount
- Date format: `dd/mm/yyyy` for Morocco

---

## 🧩 CSS / Tailwind Approach

**Framework:** Tailwind CSS (always)

```html
<script src="https://cdn.tailwindcss.com"></script>
```

### CSS Variables (always define at `:root`)
```css
:root {
  --font-sans: 'IBM Plex Sans Arabic', 'IBM Plex Sans', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  --color-bg: #f5f4f0;
  --color-surface: #ffffff;
  --color-border: #e5e7eb;
  --color-text: #111111;
  --color-muted: #6b7280;
  --color-accent: #facc15;
  --color-accent-alt: #ef4444;
}
```

### Component Patterns

```html
<!-- Button — Minimal -->
<button class="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">
  تسجيل الدخول
</button>

<!-- Button — Bold -->
<button class="px-5 py-2.5 text-sm font-bold bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors" style="border-radius:0;">
  ابدأ الآن ←
</button>

<!-- Input -->
<input class="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-900 transition-colors" placeholder="أدخل رقم الهاتف" dir="rtl"/>

<!-- Card — Minimal -->
<div class="bg-white border border-gray-100 rounded-xl p-5">...</div>

<!-- Tag / Label (always Mono) -->
<span class="font-mono text-xs tracking-widest uppercase text-gray-400">label</span>
```

---

## 🚫 Never Do

- ❌ Inter, Roboto, Arial as primary fonts
- ❌ Purple gradient backgrounds
- ❌ Excessive `shadow-xl` on every card
- ❌ Mixing more than 2 accent colors per screen
- ❌ Cookie-cutter hero: centered text + two rounded buttons
- ❌ `rounded-full` buttons unless intentional pill style

---

## ✅ Always Do

- ✅ IBM Plex Sans Arabic + IBM Plex Mono — no exceptions
- ✅ `dir="rtl"` and `lang="ar"` for Arabic pages
- ✅ CSS variables at `:root` for every project
- ✅ Tailwind as primary styling method
- ✅ One bold accent element per screen max
- ✅ Micro-animations: `transition-colors`, `hover:scale-[1.01]`
- ✅ Style blend: **70% Clean Minimal + 30% Bold accent**

---

## 📁 Stack

- Framework: Tailwind CSS
- Fonts: IBM Plex family only
- Language: Arabic (Moroccan) + English
- Styles: Clean Minimal (base) + Bold & Colorful (accents)
