# Music Theory Trainer

A flash-card style web app for practicing music theory fundamentals.

## What's inside

- **Triad Trainer** — Major, minor, diminished, and augmented triads across every root.
  Four modes:
  - Chord name → spell the triad
  - Triad notes → name the chord
  - Chord name → the 2nd of its scale
  - Chord name → the 6th of its scale (natural minor for minor chords)

- **Circle of Fifths Trainer** — All 14 major key signatures.
  Two modes:
  - Key name → mark the sharps and flats
  - Notes of the scale → name the key

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Serve those static files with any host.

## Deploy

The `dist/` folder is plain static HTML/JS/CSS — drop it on:

- **Vercel / Netlify**: connect the repo, set build command `npm run build`, output directory `dist`. Both have free tiers and handle the SPA routing automatically.
- **GitHub Pages**: works, but you'll need to handle SPA routing (the `react-router-dom` routes won't survive a hard refresh on subpaths). Easiest fix is switching `BrowserRouter` to `HashRouter` in `src/main.jsx` for that host.
- **Cloudflare Pages**: same setup as Vercel/Netlify.

## Project structure

```
music-theory-trainer/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                  # entry, wraps App in BrowserRouter
    ├── App.jsx                   # routes
    ├── index.css                 # reset
    └── components/
        ├── Landing.jsx           # home page with two cards
        ├── TriadTrainer.jsx      # Opus I
        └── CircleOfFifthsTrainer.jsx  # Opus II
```

Each trainer is self-contained — all styles live inside the component as a `<style>` block. You can lift either one into a different project by copying the single file plus its `Link` import (or removing the back-link if you don't want routing).

## Tech

- React 18
- Vite 5
- react-router-dom 6
- No CSS framework, no UI library — fonts are loaded from Google Fonts via CSS imports.
