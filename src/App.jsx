import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing.jsx';
import TriadTrainer from './components/TriadTrainer.jsx';
import CircleOfFifthsTrainer from './components/CircleOfFifthsTrainer.jsx';
import IntervalTrainer from './components/IntervalTrainer.jsx';
import Daily from './components/Daily.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/triads" element={<TriadTrainer />} />
      <Route path="/circle-of-fifths" element={<CircleOfFifthsTrainer />} />
      <Route path="/intervals" element={<IntervalTrainer />} />
      <Route path="/daily" element={<Daily />} />
    </Routes>
  );
}
