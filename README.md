## Garmin Dashboard (Monorepo)

Static dashboard built with Vite + React + TypeScript + Tailwind + shadcn-style UI. Data is fetched locally via Python (`python-garminconnect`) and committed as JSON under `frontend/public/data/garmin/`.

### Repository layout

```
frontend/               # Vite React app (builds to frontend/dist)
  public/data/garmin/   # JSON snapshots
backend/                # Local Python scripts for data fetch
.github/workflows/      # CI (type/lint/build, deploy-pages)
```

### GitHub Pages
This repo deploys the frontend to GitHub Pages using `.github/workflows/deploy-pages.yml`.

Vite config (`frontend/vite.config.ts`) uses `base: '/garmin-dashboard/'` and `build.outDir: 'dist'`.

After enabling Pages (Settings → Pages → GitHub Actions), your site will be available at `https://<username>.github.io/garmin-dashboard/`.

If you maintain a separate landing repository like `username.github.io`, link to this project at `/garmin-dashboard/` or add a redirect under `garmin/`.

### Local development

```bash
cd frontend
npm ci
npm run dev
```

### Tailwind + shadcn-style UI
Tailwind is configured in `frontend/tailwind.config.ts`. Minimal primitives under `src/components/ui/` (e.g., `button.tsx`). Add more with your preferred generator or copy patterns.

### Data flow
The frontend loads JSON from `public/data/garmin/` with Zod validation (`src/features/garmin`). Run the Python script to update data, then commit and push.

See `AGENT.md` for backend usage.

### Reference
- python-garminconnect — [github.com/cyberjunky/python-garminconnect](https://github.com/cyberjunky/python-garminconnect)
