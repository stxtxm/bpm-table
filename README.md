# BPM TABLE

BPM TABLE is a React + TypeScript web app for BPM conversion and percentage change lookup, matching the original reference table values with fixed 2-decimal precision.

## Features

- Responsive SPA layout (desktop + mobile)
- Full BPM matrix with source/destination selection
- Mobile-optimized destination list workflow
- Exact percentage math with deterministic rounding
- PWA-ready setup (manifest + service worker)
- Vercel-ready deployment configuration

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

## Vercel Deployment

The repository includes `vercel.json` with:

- `framework`: `vite`
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`

Deployment flow:

1. Push to GitHub
2. Import the repository in Vercel
3. Deploy

## PWA

Install prompt support is enabled through `beforeinstallprompt`.

Key files:

- `public/manifest.webmanifest`
- `public/sw.js`

## License

Private/internal use by default. Add a public license file if needed.
