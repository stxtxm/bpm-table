# Agent Handover Notes

## État actuel

- Build local OK (`npm run build`)
- Dernière correction Vercel appliquée (types TS / env Vite)
- Layout desktop ajusté :
  - bloc `controls` plus étroit
  - bloc `info-panel` plus large
  - hauteurs uniformisées sur desktop
- Valeurs BPM par défaut :
  - `bpmMin = 120`
  - `sourceBpm = 120`
  - `destBpm = 121`

## Points techniques importants

- Calcul % exact en `BigInt` dans `src/lib/bpm.ts`
- Inputs mutualisés avec composant `NumberField` dans `src/App.tsx`
- Type Vite ajouté dans `src/vite-env.d.ts`
- Config Node/TS pour Vercel dans `tsconfig.node.json`

## Fichiers critiques

- `src/App.tsx`
- `src/lib/bpm.ts`
- `src/styles.scss`
- `tsconfig.node.json`
- `vite.config.ts`
- `.github/workflows/deploy.yml`

## Déploiement

- GitHub Pages (plus de Vercel, quotas épuisés)
- URL : https://stxtxm.github.io/bpm-table/
- Push sur `master` → workflow `deploy.yml` → artefact `dist` → `deploy-pages`
- `BASE_PATH` injecté par `actions/configure-pages` (défaut local : `/bpm-table/`)
- `public/.nojekyll` empêche Jekyll de trier le contenu
- Chemins subpath-safe : service worker via `BASE_URL`, `sw.js` et `manifest.webmanifest` en URLs relatives

## À surveiller / prochaines améliorations

- Ajouter tests unitaires sur `calcPercent` et `buildTable`
- Ajouter tests E2E mobile (ouverture/fermeture table)
- Accessibilité : navigation clavier complète sur mobile list + table fullscreen
- Optionnel : internationalisation FR/EN

## Git

- Branche active : `master`
- Si push échoue sur machine locale, probable problème d'auth GitHub CLI/token.
