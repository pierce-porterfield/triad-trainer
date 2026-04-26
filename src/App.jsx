import React from 'react';
import { Outlet } from 'react-router-dom';
import Landing from './components/Landing.jsx';
import TriadTrainer from './components/TriadTrainer.jsx';
import CircleOfFifthsTrainer from './components/CircleOfFifthsTrainer.jsx';
import IntervalTrainer from './components/IntervalTrainer.jsx';
import Daily from './components/Daily.jsx';
import ChordPage from './components/ChordPage.jsx';
import { PUBLISHED_CHORD_SLUGS } from './data/chordContent.js';

// Root layout. vite-react-ssg's <Head> component handles head extraction
// internally, so this is just an Outlet.
const RootLayout = () => <Outlet />;

// Bind the slug as a stable closure for each chord route. We list concrete
// paths (rather than `:slug`) because vite-react-ssg needs to enumerate every
// route to crawl at build time.
const makeChordRoute = (slug) => ({
  path: `chords/${slug}`,
  Component: () => <ChordPage slug={slug} />,
  entry: 'src/components/ChordPage.jsx',
});

export const routes = [
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Landing },
      { path: 'triads', Component: TriadTrainer },
      { path: 'circle-of-fifths', Component: CircleOfFifthsTrainer },
      { path: 'intervals', Component: IntervalTrainer },
      { path: 'daily', Component: Daily },
      ...PUBLISHED_CHORD_SLUGS.map(makeChordRoute),
    ],
  },
];

// Default export kept for any tooling that still imports it.
export default function App() {
  return null;
}
