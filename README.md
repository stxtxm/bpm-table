# BPM TABLE

Application web React/TypeScript pour convertir des BPM et lire les pourcentages de variation avec **les mêmes valeurs à 2 décimales** que la table de référence.

## Aperçu

- Interface SPA responsive (desktop + mobile)
- Table complète BPM avec sélection source/destination
- Liste mobile optimisée
- Calcul exact (arrondi contrôlé, pas d'approximation flottante)
- PWA (manifest + service worker)
- Déploiement prêt pour Vercel

Exemples attendus :

- `125 -> 126 = +0.80%`
- `122 -> 123 = +0.82%`
- `100 -> 101 = +1.00%`

## Stack

- React 18 + TypeScript
- Vite 5
- SCSS
- PWA basique (`public/manifest.webmanifest`, `public/sw.js`)

## Démarrage local

```bash
npm install
npm run dev
```

Build production :

```bash
npm run build
npm run preview
```

## Scripts

- `npm run dev` : lance Vite en développement
- `npm run build` : `tsc -b && vite build`
- `npm run preview` : prévisualisation du build

## Logique de calcul

Le calcul est fait dans `src/lib/bpm.ts` avec `BigInt` pour éviter les erreurs de flottants JavaScript.

Formule utilisée :

`((dest - src) / src) * 100`

Le formatage est ensuite forcé sur 2 décimales avec gestion du signe (`+` / `-`).

## Architecture rapide

- `src/App.tsx` : composition UI + états + interactions
- `src/components/BpmTable.tsx` : table complète desktop/mobile fullscreen
- `src/components/BpmList.tsx` : liste des BPM destination (mobile)
- `src/lib/bpm.ts` : génération table + logique mathématique
- `src/styles.scss` : thème et layout responsive
- `src/types/pwa.d.ts` : types `beforeinstallprompt`
- `src/vite-env.d.ts` : types Vite (`import.meta.env`)

## Déploiement Vercel

Le repo contient déjà `vercel.json` :

- `framework`: `vite`
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`

### Déploiement

1. Push du repo sur GitHub
2. Import du repo dans Vercel
3. Deploy

### Si erreur TypeScript sur Vercel

Le projet est déjà configuré pour éviter les erreurs classiques (`Map`, `Set`, `import.meta.env`) via :

- `tsconfig.node.json` (lib/types node)
- `src/vite-env.d.ts`
- `@types/node` en devDependencies

## PWA

L'app propose l'installation quand l'événement `beforeinstallprompt` est disponible.

Fichiers clés :

- `public/manifest.webmanifest`
- `public/sw.js`

## Licence

Usage projet interne/privé (à adapter si besoin d'une licence publique).
