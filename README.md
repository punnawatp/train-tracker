# Train — Gym · BJJ · MMA Tracker

A gamified personal training tracker. Log gym sessions, BJJ, and MMA. Earn XP, level up through belt ranks, track strength goals, and visualize your year at a glance.

**Stack:** Next.js 16 · Supabase (Postgres + Auth) · Tailwind CSS · Zustand · Vercel

---

## Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment)

---

## Local setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd train-tracker
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project** and fill in a name and database password.
3. Wait for the project to finish provisioning (~1 min).

### 3. Run the database schema

1. In your Supabase project, open the **SQL Editor** (left sidebar).
2. Click **New query**.
3. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql).
4. Click **Run**.

This creates a single `user_data` table with Row Level Security so each user can only see their own data.

### 4. Get your API keys

In your Supabase project go to **Settings → API**. You need:

| Value | Where to find it |
|---|---|
| Project URL | "Project URL" field |
| Anon / public key | "Project API keys" → `anon` `public` |

### 5. Set environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the two values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to the login page.

### 7. Create your account

1. Click **Sign up**, enter an email and password, and submit.
2. Check your inbox for a confirmation email and click the link.
3. Return to the app and **Log in**.

Your training data is now synced to Supabase and accessible from any device.

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "init"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository.
3. Vercel auto-detects Next.js — no framework configuration needed.

### 3. Add environment variables in Vercel

In the Vercel project settings go to **Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

### 4. Deploy

Click **Deploy**. Vercel builds and publishes the app. Your live URL is shown on the dashboard.

---

## Project structure

```
train-tracker/
├── app/
│   ├── globals.css          # Dark theme + shared CSS classes
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main dashboard (auth-protected)
│   └── login/page.tsx       # Login / sign-up page
├── components/
│   ├── ui/                  # Toast, PRFlash, LevelUp overlay, Confetti
│   ├── modals/              # GymModal, LiftModal, AddLiftModal, WidgetModal, SettingsModal
│   ├── Hero.tsx             # Belt badge + XP bar + combo multiplier
│   ├── Quests.tsx           # Daily and weekly quests
│   ├── TrainingCards.tsx    # Gym / BJJ / MMA log buttons + weekly progress
│   ├── TodayLog.tsx         # Today's sessions with exercise detail
│   ├── Widgets.tsx          # Customizable dashboard widgets
│   ├── Attributes.tsx       # STR / CON / TEC / DIS radar chart
│   ├── Bodyweight.tsx       # Weight tracker with sparkline + ETA
│   ├── Lifts.tsx            # Strength goals with progress bars + ETA
│   ├── WeekBar.tsx          # 7-day session overview
│   ├── Heatmap.tsx          # 52-week activity heatmap
│   ├── Stats.tsx            # Summary stats
│   ├── Achievements.tsx     # Achievement grid
│   └── History.tsx          # Scrollable session history
├── lib/
│   ├── types.ts             # TypeScript types
│   ├── constants.ts         # Belts, default lifts, quests, achievements
│   ├── game-logic.ts        # XP, levels, streaks, ETA calculations
│   └── supabase/            # Browser + server Supabase clients
├── store/
│   └── useTrainStore.ts     # Zustand store — all state + Supabase sync
├── proxy.ts                 # Auth route protection (redirects to /login)
├── supabase/
│   └── schema.sql           # One-time DB setup — run this in Supabase SQL editor
└── .env.local.example       # Copy to .env.local and fill in your keys
```

---

## Importing your old data

If you used the original single-file HTML version, you can migrate your data:

1. In the old app open **Settings → Export JSON** and save the file.
2. Log in to the new app, open **Settings** (⚙ top right), and click **Import JSON**.
3. Select the file. Your sessions, lifts, XP, and achievements will be restored.

---

## Development commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (type-checks everything)
npm run lint     # Run ESLint
```
