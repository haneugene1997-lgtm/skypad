# SkyPad ✈

**Offline-first PWA for long-haul business travelers.**
Read articles, study flashcards, and journal — all at 35,000 feet with no Wi-Fi.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | File-based routing, SSG, easy PWA |
| Styling | Tailwind CSS | Utility-first, dark theme via CSS vars |
| PWA | next-pwa (Workbox) | Service worker + offline caching in ~10 lines |
| Offline DB | IndexedDB via `idb` | Persistent, structured, works offline |
| State | Zustand | Lightweight global state (flight info, active IDs) |
| SRS | Custom (lib/db.ts) | Simple spaced repetition for flashcards |

---

## Project Structure

```
skypad/
├── app/
│   ├── layout.tsx              # Root layout — PWA meta tags
│   ├── page.tsx                # Home — flight card + module grid
│   ├── read/
│   │   ├── page.tsx            # Article list
│   │   └── [id]/page.tsx       # Article reader (tracks scroll progress)
│   ├── learn/
│   │   ├── page.tsx            # Deck list
│   │   └── [id]/page.tsx       # Flashcard review with SRS
│   └── journal/
│       ├── page.tsx            # Entry list
│       └── [id]/page.tsx       # Editor (auto-save to IndexedDB)
├── components/
│   └── ui/
│       ├── BottomNav.tsx       # Shared tab bar
│       ├── OfflineBanner.tsx   # Airplane mode pill
│       ├── ProgressBar.tsx     # Reusable progress bar
│       └── AppShell.tsx        # SW registration + offline listener
├── hooks/
│   ├── useOffline.ts           # Detects navigator.onLine changes
│   └── useDB.ts                # Generic IndexedDB data loader hook
├── lib/
│   ├── db.ts                   # Full IndexedDB schema + CRUD + seed data
│   └── store.ts                # Zustand global store
├── styles/
│   └── globals.css             # Design tokens + Tailwind base
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # App icons (192px, 512px)
├── next.config.js              # next-pwa config + Workbox caching rules
├── tailwind.config.ts
└── tsconfig.json
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run in development (PWA disabled in dev)
npm run dev

# 3. Build for production (generates sw.js + workbox files)
npm run build
npm start
```

> **Note:** The service worker only activates in production builds (`npm run build && npm start`).
> In development, use `npm run dev` — the app still works, just without offline caching.

---

## Adding App Icons

Place two PNG icons in `/public/icons/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

You can generate them from any image at: https://realfavicongenerator.net

---

## Offline Strategy Summary

| Data type | Strategy | Where stored |
|---|---|---|
| Static assets (JS, CSS, fonts) | Cache-first | Service Worker cache |
| App pages (/read, /learn, /journal) | Network-first + fallback | Service Worker cache |
| Articles, decks, journal entries | Persistent client-side | IndexedDB (via `idb`) |
| User progress (reading %, SRS scores) | Written on interaction | IndexedDB |
| Drafts | Auto-save (800ms debounce) | IndexedDB |

---

## Cursor Vibe-Coding Tips

When prompting Cursor to extend this project:

- **"Add a text-to-speech button to the article reader"**
  → use Web Speech API (`window.speechSynthesis`) — works offline, no API key needed

- **"Let users import articles from a URL before the flight"**
  → add a `/read/add` page that calls a server route to fetch + strip HTML, then `saveArticle()` to IndexedDB

- **"Add a progress screen showing flight stats"**
  → query all IndexedDB stores, compute totals, render with a simple SVG or Tailwind progress bars

- **"Sync data to the cloud when back online"**
  → hook into the `online` event in `useOffline.ts`, then POST pending changes to an API route

---

## Design System Quick Reference

```css
/* Colors */
--bg:       #0a0e1a   /* page background */
--surface:  #111827   /* card / input background */
--glass:    rgba(255,255,255,0.06)  /* frosted card */
--muted:    #7a8aaa   /* secondary text */
--blue:     #4f8ef7   /* primary action */
--teal:     #3ecfb2   /* learn / success */
--amber:    #f4b942   /* journal / warning */
--purple:   #7c5cfc   /* read / accent */
--red:      #e05c5c   /* danger / again */
```

```
Fonts: DM Sans (UI) + Space Mono (readings/code)
Border radius: rounded-2xl (cards), rounded-xl (buttons), rounded-full (pills)
Animations: animate-fade-up, animate-slide-in, animate-blink
```
