import React from 'react';
import { Outlet } from 'react-router-dom';
import HamburgerNav from './components/HamburgerNav.jsx';
import Landing from './components/Landing.jsx';
import TriadTrainer from './components/TriadTrainer.jsx';
import CircleOfFifthsTrainer from './components/CircleOfFifthsTrainer.jsx';
import IntervalTrainer from './components/IntervalTrainer.jsx';
import NoteTrainer from './components/NoteTrainer.jsx';
import Daily from './components/Daily.jsx';
import ChordPage from './components/ChordPage.jsx';
import KeyPage from './components/KeyPage.jsx';
import ScalePage from './components/ScalePage.jsx';
import LearnPage from './components/LearnPage.jsx';
import { PUBLISHED_CHORD_SLUGS } from './data/chordContent.js';
import { PUBLISHED_KEY_SLUGS } from './data/keyContent.js';
import { PUBLISHED_SCALE_SLUGS } from './data/scaleContent.js';
import { PUBLISHED_LEARN_SLUGS } from './data/learnContent.js';

// Root layout. Renders the persistent hamburger nav on every route so the
// chord library, trainers, and home all link to each other (kills SEO orphan
// pages). vite-react-ssg's <Head> handles head extraction internally.
const RootLayout = () => (
  <>
    <HamburgerNav />
    <Outlet />
  </>
);

// Bind the slug as a stable closure for each chord route. We list concrete
// paths (rather than `:slug`) because vite-react-ssg needs to enumerate every
// route to crawl at build time.
const makeChordRoute = (slug) => ({
  path: `chords/${slug}`,
  Component: () => <ChordPage slug={slug} />,
  entry: 'src/components/ChordPage.jsx',
});

const makeKeyRoute = (slug) => ({
  path: `keys/${slug}`,
  Component: () => <KeyPage slug={slug} />,
  entry: 'src/components/KeyPage.jsx',
});

const makeScaleRoute = (slug) => ({
  path: `scales/${slug}`,
  Component: () => <ScalePage slug={slug} />,
  entry: 'src/components/ScalePage.jsx',
});

const makeLearnRoute = (slug) => ({
  path: `learn/${slug}`,
  Component: () => <LearnPage slug={slug} />,
  entry: 'src/components/LearnPage.jsx',
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
      { path: 'notes', Component: NoteTrainer },
      { path: 'daily', Component: Daily },
      ...PUBLISHED_CHORD_SLUGS.map(makeChordRoute),
      ...PUBLISHED_KEY_SLUGS.map(makeKeyRoute),
      ...PUBLISHED_SCALE_SLUGS.map(makeScaleRoute),
      ...PUBLISHED_LEARN_SLUGS.map(makeLearnRoute),
    ],
  },
];

// Default export kept for any tooling that still imports it.
export default function App() {
  return null;
}
