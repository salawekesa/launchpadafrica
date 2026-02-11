# Project Structure

Organisation of the Launch Pad codebase.

## Root

```
plp-spark-launch/
├── docs/                 # All documentation (see Index below)
├── public/               # Static assets (favicon, robots.txt)
├── src/                  # Application source
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env, .env.example
├── .gitignore
├── README.md             # Main project readme (entry point)
├── server.js             # Production server (serves Vite build + API proxy if used)
├── prepare-deploy.sh     # Deployment packaging script
├── prepare-deploy.bat
└── (optional) deploy-package/, fork-launchpad-main/, *.zip  # Build/legacy artifacts
```

## Source (src/)

```
src/
├── App.tsx               # Routes and layout
├── main.tsx
├── index.css             # Global styles
├── vite-env.d.ts
│
├── components/           # Shared UI
│   ├── layout/           # Header, Layout, MobileNav
│   ├── ui/               # shadcn/ui components
│   └── (Hero, NavLink, Leaderboard, …)
│
├── pages/                 # Route-level pages
│   ├── Landing.tsx, Login.tsx, Signup.tsx
│   ├── Dashboard.tsx, Profile.tsx, Community.tsx
│   ├── LaunchPad.tsx, ProjectDetail.tsx
│   ├── Hackathons.tsx, HackathonDetail.tsx, HackathonSubmit.tsx, MyHackathon.tsx
│   ├── StartupDetail.tsx, StartupSubmission.tsx
│   ├── Index.tsx, NotFound.tsx
│   └── api/              # API route handlers (e.g. startups)
│
├── modules/               # Feature modules
│   └── hackathon/
│       ├── index.ts      # Public exports
│       ├── types.ts
│       ├── components/  # CreateHackathonForm, InviteParticipants, JudgeScoreForm, Scoreboard, AwardsPanel
│       ├── views/        # CreateHackathon, HackathonManage, HackathonScoreboard
│       └── services/     # hackathon-api, hackathon-service, hackathon-store
│
├── hooks/                 # Shared hooks (useStartups, useLeaderboard, use-mobile, use-toast)
├── lib/                   # Core lib
│   ├── database.ts       # PostgreSQL pool, init, migrations
│   ├── hackathon-db.ts   # Hackathon CRUD and scoreboard/finalize
│   ├── api.ts            # Startups API (legacy)
│   ├── types.ts          # Shared types (Project, Hackathon, User, …)
│   ├── mock-data.ts      # Mock hackathons, projects, users
│   ├── utils.ts
│   └── (database-client, db-service, startupAdapters)
│
├── server/                # Backend
│   ├── api.ts            # Express app: /api/startups, /api/hackathons, /api/user, …
│   ├── minimal-api.ts
│   └── simple-api.ts
│
├── store/                 # Global state (auth-store, app-store)
└── scripts/               # DB/utility scripts (init-db, add-columns, …)
```

## Docs (docs/)

All Markdown documentation lives under `docs/`. See [docs/INDEX.md](INDEX.md) for the list.

## Suggested cleanup (optional)

- **Deploy / legacy**: Move `deploy-package/`, `fork-launchpad-main/`, and `*.zip` into an `_archive/` or `deploy/` folder if you want a cleaner root.
- **Scripts**: Keep `scripts/` under `src/` or move to root `scripts/` for DB-only scripts used by Node.
