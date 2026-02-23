# Güater — Daily Hydration Tracker

A personal hydration tracking web app built with Next.js 16, Supabase, and Tailwind CSS v4. Tracks water intake, diuretic drinks, daily goals, and hydration streaks.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Database | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Monorepo | Turborepo |
| Deployment | Vercel |

---

## Project Structure

```
apps/
  web/
    src/
      app/
        actions.ts          # Server actions (water, diuretics, profile, theme)
        page.tsx            # Dashboard
        history/            # History page
        settings/           # Settings page
        (auth)/             # Login, signup, forgot password, reset password
      components/
        water/
          diuretics/        # DiureticTracker, DiureticWarningBanner, MinBottle, DiureticPresetsManager
          LogList.tsx        # Unified log (water + diuretics)
          QuickAdd.tsx       # Quick add water buttons
          WaterBottle.tsx    # Animated water bottle SVG
          ProgressBar.tsx
          StreakBadge.tsx
          DailyWarningBanner.tsx
          PresetsManager.tsx
        ui/                 # Button, Card, Input, Toast, ConfirmDialog
        layout/
          Navbar.tsx
        ThemeToggle.tsx
        ThemeProvider.tsx
        RefreshOnFocus.tsx
      lib/
        water.ts            # All data queries (getProfile, getTodayLogs, getStreak, etc.)
        hydration.ts        # Recommended intake calculator
        utils.ts            # getTodayRangeForTimezone, getTimezoneOffset
        supabase/
          client.ts
          server.ts
packages/
  types/                    # Shared TypeScript types (WaterLog, DiureticLog, UserProfile, etc.)
```

---

## Features

### Done
- Email/password auth with Supabase
- Password reset flow
- Water logging with quick-add presets (custom containers)
- Edit and delete individual water logs
- Diuretic drink tracking with custom SVG icons (coffee, espresso, tea, mate, energy drink, etc.)
- Unified log sorted by time — water and diuretics in one list
- Clear all logs (water + diuretics) with confirmation dialog
- Daily hydration goal with progress bar and animated water bottle
- Hydration streak tracking
- Daily warning banners (under-hydrated, over-caffeinated)
- History page — last 7 days bar chart + 30-day heatmap
- Settings — display name, daily goal, unit (ml/oz), timezone, weight, age, activity level, climate
- Weight/age-based recommended intake calculator in settings
- Custom diuretic drink presets
- Dark mode (class-based, persisted to DB)
- Desktop two-column layout, mobile single-column
- Timezone-aware queries throughout
- Tab focus refresh (RefreshOnFocus)
- Caching with `unstable_cache` on profile, logs, diuretic logs, and streak

### Planned
- Mobile app (React Native / Expo)
- i18n (pre-launch)

---

## Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | References auth.users |
| display_name | text | |
| daily_goal_ml | integer | Default 2500 |
| preferred_unit | text | 'ml' or 'oz' |
| timezone | text | IANA timezone string |
| weight_kg | numeric | |
| age | integer | |
| activity_level | text | sedentary / moderate / active / very_active |
| climate | text | cold / temperate / hot |
| theme | text | 'light' or 'dark' |

### `water_logs`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | |
| amount_ml | integer | |
| logged_at | timestamptz | Default now() |
| source | text | 'quick' / 'manual' / 'reminder' |

### `quick_add_presets`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | |
| label | text | |
| amount_ml | integer | |
| sort_order | integer | |

### `diuretic_logs`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | |
| preset_id | uuid | Nullable |
| label | text | |
| amount_ml | integer | |
| diuretic_factor | numeric | 0.0–1.0 |
| logged_at | timestamptz | |

### `diuretic_presets`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | |
| label | text | |
| amount_ml | integer | |
| diuretic_factor | numeric | |
| color | text | Hex color |
| sort_order | integer | |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project

### Setup

```bash
git clone <repo>
cd guater
npm install
```

Create `apps/web/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Run the SQL migrations in your Supabase SQL editor (schema above).

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Key Architectural Decisions

**Server Components + Server Actions** — all data fetching happens server-side. Client components only handle UI interactions. Actions call `revalidatePath('/')` after mutations to bust the cache.

**`unstable_cache` with tags** — profile, today's logs, diuretic logs, and streak are all cached and tagged. Mutations invalidate only the relevant tags.

**Timezone handling** — all day-boundary calculations use the user's stored IANA timezone via `getTodayRangeForTimezone()` in `lib/utils.ts`. The server never assumes UTC for "today".

**Dark mode** — class-based via Tailwind v4 `@variant dark`. Theme is stored in the DB and applied by `ThemeProvider` on mount. Toggle updates DOM immediately and saves to DB in the background.

---

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Lint
```