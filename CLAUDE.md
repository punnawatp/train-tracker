# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Read this before writing any Next.js code

This project uses **Next.js 16** with **React 19** — both have breaking changes from prior versions. Before touching routing, data fetching, or middleware, read the relevant guide in `node_modules/next/dist/docs/`. APIs and conventions differ significantly from training data.

## Commands

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build (also type-checks)
npm run lint     # ESLint
```

No test suite exists.

## Environment

Copy `.env.local.example` to `.env.local` and set:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Architecture

### Data model
All user state is a single `AppState` blob stored in Supabase as JSONB (`user_data.data`). There is one row per user. The shape is defined in [lib/types.ts](lib/types.ts). Every action in the store mutates and re-persists the entire blob via `upsert`.

### State management
`store/useTrainStore.ts` is a single Zustand store that owns all app state and all business logic. It exposes `load()` (fetch from Supabase on mount) and `save(next)` (optimistic set + async persist). Every action calls `save()` at the end. There is no separate API layer.

### Auth flow
- `proxy.ts` (Next.js 16's renamed `middleware.ts`) checks Supabase session on every request and redirects unauthenticated users to `/login`. **Do not create a `middleware.ts`** — Next.js 16 uses `proxy.ts` and will error if both exist.
- `app/auth/callback/route.ts` handles the Supabase email-confirmation redirect and exchanges the code for a session.
- Supabase client: browser → `lib/supabase/client.ts`, server/middleware → `lib/supabase/server.ts`.

### Game logic
`lib/game-logic.ts` contains all XP, level, belt, combo multiplier, quest, and stat calculations as pure functions. `lib/constants.ts` holds static config (belts, default lifts, quests, achievements). Neither file imports from the store.

### UI
Single-page dashboard (`app/page.tsx`) composed of feature components from `components/`. Modals live in `components/modals/`. Overlay UI (toasts, level-up, PR flash, confetti) lives in `components/ui/`. Tailwind 4 is used — no `tailwind.config.js`; configuration is in CSS via `app/globals.css`.
