# BPM TABLE

BPM TABLE is a React + TypeScript web app for BPM conversion and percentage change lookup, matching the original reference table values with fixed 2-decimal precision.

## Features

- Responsive SPA layout (desktop + mobile)
- Full BPM matrix with source/destination selection
- Mobile-optimized destination list workflow
- Exact percentage math with deterministic rounding
- PWA-ready setup (manifest + service worker)
- GitHub Pages deployment via GitHub Actions

Reference outputs:

- `125 -> 126 = +0.80%`
- `122 -> 123 = +0.82%`
- `100 -> 101 = +1.00%`

## Tech Stack

- React 18
- TypeScript
- Vite 5
- SCSS

## Getting Started

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Because `vite.config.ts` sets `base: '/bpm-table/'`, the preview server serves the app at
<http://localhost:4173/bpm-table/>.

## Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` runs `tsc -b && vite build`
- `npm run preview` serves the production build locally

## Calculation Model

The core logic is implemented in `src/lib/bpm.ts` using `BigInt` to avoid floating-point drift.

Formula:

`((destination - source) / source) * 100`

Values are then formatted to exactly 2 decimals with explicit sign handling (`+` / `-`).

## Project Structure

- `src/App.tsx` application state and UI composition
- `src/components/BpmTable.tsx` full matrix table
- `src/components/BpmList.tsx` mobile destination list
- `src/lib/bpm.ts` table generation and math engine
- `src/styles.scss` responsive theme and layout
- `src/types/pwa.d.ts` install prompt typings
- `src/vite-env.d.ts` Vite env typings

## GitHub Pages Deployment

Deployed at <https://stxtxm.github.io/bpm-table/>.

`.github/workflows/deploy.yml` builds on every push to `master` and publishes `dist/`:

1. `actions/configure-pages` resolves the Pages base path and exposes it as `base_path`
2. `npm run build` runs with `BASE_PATH=<base_path>/`
3. `actions/upload-pages-artifact` uploads `dist`
4. `actions/deploy-pages` publishes it

Setup steps (already done):

- Repo Settings → Pages → Source: **GitHub Actions**
- `vite.config.ts` default base: `/bpm-table/`

### Subpath handling

Everything is served from a repository subpath, so paths are base-aware:

- `vite.config.ts` reads `process.env.BASE_PATH` (defaults to `/bpm-table/`)
- `src/main.tsx` registers the service worker via `import.meta.env.BASE_URL`
- `public/sw.js` derives its base from `new URL('./', self.location.href)`
- `public/manifest.webmanifest` uses relative `start_url`, `scope` and icon `src`
- `public/.nojekyll` disables Jekyll processing on Pages

If a custom domain is added at the apex (base path `""`), the workflow passes `BASE_PATH=/`
and everything keeps working without code changes.

## PWA

Install prompt support is enabled through `beforeinstallprompt`.

Key files:

- `public/manifest.webmanifest`
- `public/sw.js`

## License

Private/internal use by default. Add a public license file if needed.
