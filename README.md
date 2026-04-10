# slumbr

I built this because I couldn't sleep. I found that reading stories before bed was one of the few things that actually helped me drift off — something about following a quiet narrative slows my thoughts down enough to let sleep in. The problem was finding the right kind of story: calm, unhurried, with no cliffhangers or tension. So I built a generator that creates exactly that, on demand.

slumbr is a web app that generates AI-powered bedtime stories. Pick a theme, optionally add a detail, and let the story carry you to sleep. The entire experience is designed to minimise cognitive load — warm colours, slow animations, ambient music, and a screen that gradually dims as you read.

**Core UX principle:** 2 taps from app open to a generated story.

---

## Features

- **AI story generation** — 9 themes (Forest, Ocean, Cosmos, Cabin, Anime, Fantasy, Brainrot, Horror-lite, Mythology), blendable for mixed settings
- **Perspective control** — First, second, or third person
- **Character & dialogue modes** — Follow a named character; enable natural back-and-forth conversation
- **Ambient music** — Global singleton audio that persists across pages, starts on a random track
- **Amber screen mode** — Full warm palette; screen progressively dims to ~20% over 15 minutes while reading
- **Reader settings** — Font selector, font size (sm/md/lg/xl), Bionic Reading toggle, typewriter speed
- **Story history** — Save and revisit past stories, with the AI provider shown on each
- **Auth** — Email/password + Google OAuth via Clerk

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, SCSS, Vite, Zustand |
| Backend | Node.js, Express, TypeScript |
| Auth | Clerk |
| AI | Groq (primary) → OpenRouter (fallback) |
| Database | PostgreSQL + Prisma |
| Validation | Zod (shared schemas) |

---

## Requirements

- **Node.js** 18+
- **PostgreSQL** database (local or Docker)
- **Clerk** account — [clerk.com](https://clerk.com)
- **Groq** API key — [console.groq.com](https://console.groq.com)
- **OpenRouter** API key (optional fallback) — [openrouter.ai](https://openrouter.ai)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/slumbr.git
cd slumbr
npm install
```

### 2. Start the database

Using Docker:

```bash
docker run -d \
  --name slumbr-postgres \
  -e POSTGRES_USER=slumbr \
  -e POSTGRES_PASSWORD=slumbr \
  -e POSTGRES_DB=slumbr \
  -p 5432:5432 \
  postgres:16
```

Or point `DATABASE_URL` at any existing PostgreSQL instance.

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://slumbr:slumbr@localhost:5432/slumbr

# Clerk — from your Clerk dashboard
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Groq — primary AI provider
GROQ_API_KEY=gsk_...

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# OpenRouter — optional fallback when Groq is rate-limited
FALLBACK_API_KEY=sk-or-v1-...
FALLBACK_MODEL=google/gemini-2.0-flash-001
```

### 4. Run database migrations

```bash
cd server
npx prisma migrate dev
cd ..
```

### 5. Build the shared package

```bash
npm run build -w shared
```

### 6. Start the app

```bash
npm run dev
```

This starts both the client (port 5173) and server (port 3001) concurrently.

Open [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
/client/src/
  /components/     # StoryPlayer, StoryTypeSelector, Settings, AmbientPlayer, …
  /hooks/          # useStoryActions, useSaveSession, useAutoHide, …
  /pages/          # Home, …
  /store/          # Zustand stores (story, settings, toast)
  /styles/         # _variables.scss, _mixins.scss, global.scss

/server/src/
  /controllers/    # storyController, sessionController, settingsController
  /services/       # storyService (AI), sessionService, settingsService
  /routes/         # Express routers
  /config/         # env, prisma
  prisma/
    schema.prisma

/shared/
  /schemas/        # Zod schemas shared between client and server
```

---

## API

All routes are prefixed `/api/v1/`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/story/generate` | Stream a generated story (SSE) |
| `POST` | `/session/save` | Save a completed session |
| `GET` | `/session/history` | Fetch past sessions |
| `GET` | `/settings` | Get user settings |
| `PUT` | `/settings` | Update user settings |
