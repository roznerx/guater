# Güater — Daily Hydration Tracker

A personal hydration tracking app built as a monorepo, with a Next.js web app and a React Native mobile app. Tracks water intake, diuretic drinks, daily goals, and hydration streaks.

---

## Monorepo Structure

```
guater/
  apps/
    web/          # Next.js 16 web app
    mobile/       # React Native / Expo mobile app (in development)
  packages/
    types/        # Shared TypeScript types
```

Built with [Turborepo](https://turbo.build/).

---

## Apps

### Web (`apps/web`)

A full-stack Next.js 16 app using the App Router and Server Components.

**Tech stack:**
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Database | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Deployment | Vercel |

**Features:**
- Email/password auth with Supabase, including password reset
- Water logging with quick-add presets and custom containers
- Edit and delete individual water logs
- Diuretic drink tracking with custom SVG icons
- Unified log sorted by time — water and diuretics in one list
- Clear all logs with confirmation dialog
- Daily hydration goal with animated water bottle and progress bar
- Hydration streak tracking
- Daily warning banners (under-hydrated, over-caffeinated)
- History page — last 7 days bar chart + 30-day heatmap
- Settings — display name, daily goal, unit (ml/oz), timezone, weight, age, activity level, climate
- Weight/age-based recommended intake calculator
- Custom diuretic drink presets
- Dark mode (class-based, persisted to DB)
- Desktop two-column layout, mobile single-column
- Timezone-aware queries throughout
- Tab focus refresh
- Server-side caching with `unstable_cache`

---

### Mobile (`apps/mobile`)

React Native app built with Expo. Shares the same Supabase backend as the web app.

**Tech stack:**
| Layer | Technology |
|---|---|
| Framework | React Native + Expo |
| Database | Supabase (shared with web) |
| Language | TypeScript |
| Deployment | EAS Build |

**Status:** In development.

---

## Shared Packages

### `packages/types`

TypeScript types shared between web and mobile:

```typescript
WaterLog
DiureticLog
DiureticPreset
QuickAddPreset
UserProfile
```

---

## Database Schema (Supabase)

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
| source | text | 'quick' / 'manual' |

### `quick_presets`
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

**Indexes:**
```sql
idx_water_logs_user_id
idx_water_logs_logged_at
idx_water_logs_user_logged      -- composite (user_id, logged_at)
idx_diuretic_logs_user_id
idx_diuretic_logs_logged_at
idx_diuretic_logs_user_logged   -- composite (user_id, logged_at)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- Expo CLI (for mobile)

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

Create `apps/mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Run the SQL migrations in your Supabase SQL editor to create the tables and indexes above.

### Development

```bash
# Web only
npm run dev --filter=web

# Mobile only
npm run start --filter=mobile

# All apps
npm run dev
```

---

## Key Architectural Decisions

**Single Supabase backend** — both web and mobile share the same database and auth. A user can log water on web and see it immediately on mobile.

**Shared types package** — `WaterLog`, `DiureticLog`, and other types are defined once in `packages/types` and imported by both apps. No type drift between platforms.

**Server Components + Server Actions (web)** — all data fetching happens server-side. Client components only handle UI interactions. Actions call `revalidatePath('/')` after mutations to bust the cache.

**`unstable_cache` with tags (web)** — profile, today's logs, diuretic logs, and streak are cached and tagged. Mutations invalidate only the relevant tags, not the entire cache.

**`getUser()` for auth — never `getSession()`** — `getUser()` validates the JWT against Supabase Auth servers on every request. `getSession()` reads from local storage without server validation and is insecure for server-side auth checks.

**Timezone handling** — all day-boundary calculations use the user's stored IANA timezone via `getTodayRangeForTimezone()` in `lib/utils.ts`. The server never assumes UTC for "today".

**Dark mode (web)** — class-based via Tailwind v4 `@variant dark`. Theme is stored in the DB and applied by `ThemeProvider` on mount. Toggle updates the DOM immediately and persists to DB in the background.

---

## Scripts

```bash
npm run dev        # Start all apps in dev mode
npm run build      # Build all apps
npm run lint       # Lint all apps
npm run typecheck  # Type check all packages
```

---

## Roadmap

- [x] Web — water logging with quick-add presets
- [x] Web — diuretic tracking with custom icons
- [x] Web — unified log (water + diuretics)
- [x] Web — history page (7-day bars + 30-day heatmap)
- [x] Web — dark mode
- [x] Web — desktop two-column layout
- [x] Web — timezone-aware queries
- [x] Web — settings with recommended intake calculator
- [x] Web — auth (login, signup, password reset)
- [ ] Mobile app
- [ ] i18n (pre-launch)