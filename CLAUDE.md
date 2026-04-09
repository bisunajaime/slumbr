# Slumbr — Claude Code Context

## Project Overview

Sleep story web app that generates AI-powered bedtime stories. Users select a theme, optionally add a prompt, and generate. The entire experience is optimized to minimize cognitive load and screen arousal. Ambient music plays across all pages.

**Core UX principle:** 2 taps from app open to a generated story.

## Tech Stack

- **Frontend:** React + TypeScript + SCSS (Vite), Zustand for state
- **Backend:** Node.js + Express + TypeScript
- **Auth:** Clerk (email/password + Google OAuth)
- **AI:** Groq API (`llama-3.3-70b-versatile`) for story generation
- **Database:** PostgreSQL + Prisma ORM
- **Validation:** Zod (shared schemas in `/shared`)
- **Deploy:** Vercel (frontend) + Railway (backend)

## Folder Structure

```
/client/src/
  /assets/music/          ← ambient audio files
  /components/            ← StoryPlayer, StoryTypeSelector, AmberFilter, AmbientPlayer, Settings
  /features/              ← Story, Session
  /hooks/
  /pages/
  /services/
  /store/                 ← Zustand
  /styles/                ← _variables.scss, _mixins.scss, global.scss
  /types/
  /utils/

/server/src/
  /config/
  /controllers/
  /middlewares/
  /models/
  /routes/
  /services/
  /types/
  /utils/
  /validators/
  app.ts
  server.ts

/shared/
  /schemas/               ← Zod schemas shared between client and server
  /types/
```

## Design System

- **Typography:** Cormorant Garamond (display) + DM Sans (UI). Line-height 1.7–1.9. Font + size are user-configurable.
- **Palette:** Warm amber/deep-red only — no cool whites or blues.
  - Background: `#060306` / `#0d060a`
  - Accent: `#c4611a` (amber), `#8b2515` (deep red)
  - Text: `#f0c9a0` (warm cream)
  - All tokens as CSS variables in `_variables.scss`
- **Spacing:** 4pt base grid
- **Border radius:** 8px cards, 12px modals, full for pills
- **Shadows:** Warm amber glow only
- **Motion:** 600ms–2400ms transitions. Slow, restful, like breathing. No snappy animations.
- **Icons:** Lucide React, stroke-only

## Key Features

1. **AI Story Generation** — Theme-based (Forest / Ocean / Cosmos / Cabin / Anime / Fantasy / Brainrot / Horror-lite / Custom). Always sleep-optimized narrative style regardless of theme: no action, no cliffhangers, progressively longer/slower sentences.
2. **Ambient Music** — Global singleton audio instance. Persists across pages. Mutable from Settings.
3. **Amber Screen Mode** — Full UI uses warm palette. Progressive CSS `brightness()` dims to ~20% over 15 minutes while reading.
4. **Reader Settings** — Music toggle, font selector, font size (sm/md/lg/xl), Bionic Reading toggle.
5. **Auto-fadeout** — Screen dims to near-black on story end. No autoplay chains.
6. **Controls auto-hide** — All UI chrome fades after 10s inactivity while reading.

## API

All routes: `/api/v1/`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/story/generate` | Generate a sleep story (rate-limited: 10/hour/user) |
| POST | `/session/save` | Save completed session |
| GET | `/session/history` | Past sessions |
| GET | `/settings` | User settings |
| PUT | `/settings` | Update settings |

Response shape:
```json
{ "success": true, "data": {}, "message": "OK" }
{ "success": false, "error": "Validation failed", "details": [] }
```

## Security

- Zod validation on all inputs
- Clerk JWT middleware on all private endpoints
- `express-rate-limit` on `/story/generate`
- `helmet` + strict CORS
- No stack traces exposed in production

## Code Standards

- TypeScript strict mode (`"strict": true`)
- ESLint + Prettier
- `PascalCase` components, `camelCase` hooks (`use` prefix), `UPPER_SNAKE_CASE` constants
- Co-locate `.tsx` and `.scss` in same component folder
- No magic numbers — extract all durations, colors, animation values as named constants
- Comment the *why*, not the *what*

## Constraints

- Mobile-first. Minimum touch target: 48×48px.
- No autoplay chains — go silent and dark on story end.
- Ambient music is a global singleton, not per-component.
- WCAG 2.1 AA compliance.
