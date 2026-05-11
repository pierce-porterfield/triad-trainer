import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import {
  MODES,
  modeById,
  scaleNotesPc,
  degreeLabels,
  pcToSharpName,
  pcToFlatName,
} from '../data/modes';
import { PRESETS } from '../data/jazzMapperPresets';
import ScaleFretboard, { DEGREE_COLORS, positionsForRoot } from './ScaleFretboard';

// ─── Jazz Scale Mapper ──────────────────────────────────────────────────────
//
// A "secondary lead sheet" tool for jazz improvisation practice. The user
// strings together scale-and-bars slots that mirror the tonal centres of a
// tune; the tool renders a fretboard diagram for each slot showing the
// scale notes with their scale-degree colour and label. Each slot has a
// position cycle so the user can see the same scale in different fretboard
// regions (root on E string, A string, etc.).
//
// State persists to localStorage for personal save / load and to the URL
// query string for share links.

const LS_KEY = 'tt-jazz-mapper-tunes-v1';
const URL_PARAM = 't';
const DEFAULT_TIME_SIGNATURE = [4, 4];

// 12 root choices (chromatic, sharp spellings). The display uses sharp
// names but the underlying value is a pitch class so flat-spelled scales
// behave identically.
const ROOT_OPTIONS = [
  { pc: 0,  label: 'C' },
  { pc: 1,  label: 'C♯ / D♭' },
  { pc: 2,  label: 'D' },
  { pc: 3,  label: 'D♯ / E♭' },
  { pc: 4,  label: 'E' },
  { pc: 5,  label: 'F' },
  { pc: 6,  label: 'F♯ / G♭' },
  { pc: 7,  label: 'G' },
  { pc: 8,  label: 'G♯ / A♭' },
  { pc: 9,  label: 'A' },
  { pc: 10, label: 'A♯ / B♭' },
  { pc: 11, label: 'B' },
];

const BAR_OPTIONS = [
  { value: 0.25, label: '¼ bar' },
  { value: 0.5,  label: '½ bar' },
  { value: 1,    label: '1 bar' },
  { value: 2,    label: '2 bars' },
  { value: 4,    label: '4 bars' },
  { value: 8,    label: '8 bars' },
  { value: 16,   label: '16 bars' },
];

const TIME_SIG_OPTIONS = [
  [4, 4], [3, 4], [6, 8], [5, 4], [7, 8], [12, 8],
];

const newSlotId = () => `s-${Math.random().toString(36).slice(2, 9)}`;
const blankSlot = () => ({ id: newSlotId(), rootPc: 2, modeId: 'dorian', bars: 2 });

const blankTune = () => ({
  id: `t-${Math.random().toString(36).slice(2, 9)}`,
  name: '',
  timeSignature: DEFAULT_TIME_SIGNATURE,
  slots: [blankSlot()],
});

// Base64-encode the tune for sharing in a URL. Strips any local-only
// fields and keeps things compact.
const encodeTuneForUrl = (tune) => {
  const payload = {
    n: tune.name,
    t: tune.timeSignature,
    s: tune.slots.map((s) => [s.rootPc, s.modeId, s.bars]),
  };
  try {
    if (typeof btoa !== 'function') return '';
    return btoa(encodeURIComponent(JSON.stringify(payload)));
  } catch (e) {
    return '';
  }
};
const decodeTuneFromUrl = (str) => {
  try {
    if (typeof atob !== 'function') return null;
    const payload = JSON.parse(decodeURIComponent(atob(str)));
    if (!payload || !Array.isArray(payload.s)) return null;
    return {
      id: `t-shared-${Date.now()}`,
      name: payload.n || '',
      timeSignature: Array.isArray(payload.t) ? payload.t : DEFAULT_TIME_SIGNATURE,
      slots: payload.s.map(([rootPc, modeId, bars]) => ({
        id: newSlotId(),
        rootPc: Number(rootPc) || 0,
        modeId: typeof modeId === 'string' ? modeId : 'dorian',
        bars: Number(bars) || 2,
      })),
    };
  } catch (e) {
    return null;
  }
};

const presetToTune = (preset) => ({
  id: `t-preset-${preset.id}-${Date.now()}`,
  name: preset.name,
  timeSignature: preset.timeSignature,
  slots: preset.slots.map((s) => ({ id: newSlotId(), ...s })),
});

export default function JazzMapper() {
  const [tune, setTune] = useState(blankTune);
  const [savedTunes, setSavedTunes] = useState([]);
  const [shareNotice, setShareNotice] = useState('');

  // Load saved tunes from localStorage + check for ?t= URL share on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) setSavedTunes(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(URL_PARAM);
    if (encoded) {
      const decoded = decodeTuneFromUrl(encoded);
      if (decoded) setTune(decoded);
    }
  }, []);

  const persistSavedTunes = (next) => {
    setSavedTunes(next);
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(LS_KEY, JSON.stringify(next)); }
    catch (e) { /* ignore quota issues */ }
  };

  const updateSlot = (id, patch) => {
    setTune((t) => ({
      ...t,
      slots: t.slots.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };
  const addSlot = () => {
    setTune((t) => ({ ...t, slots: [...t.slots, blankSlot()] }));
  };
  const removeSlot = (id) => {
    setTune((t) => ({
      ...t,
      slots: t.slots.length <= 1 ? t.slots : t.slots.filter((s) => s.id !== id),
    }));
  };
  const moveSlot = (id, dir) => {
    setTune((t) => {
      const idx = t.slots.findIndex((s) => s.id === id);
      if (idx < 0) return t;
      const j = idx + dir;
      if (j < 0 || j >= t.slots.length) return t;
      const next = [...t.slots];
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...t, slots: next };
    });
  };

  const saveCurrentTune = () => {
    const name = (tune.name || '').trim();
    if (!name) {
      setShareNotice('Give your tune a name before saving.');
      return;
    }
    // Match by name so re-saving overwrites instead of duplicating.
    const next = savedTunes.filter((t) => t.name !== name);
    next.push({ ...tune, name, updatedAt: Date.now() });
    next.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    persistSavedTunes(next);
    setShareNotice(`Saved “${name}”.`);
  };
  const loadTune = (saved) => {
    setTune({
      ...saved,
      slots: saved.slots.map((s) => ({ ...s, id: newSlotId() })),
    });
    setShareNotice(`Loaded “${saved.name}”.`);
  };
  const deleteSaved = (savedName) => {
    persistSavedTunes(savedTunes.filter((t) => t.name !== savedName));
  };
  const newTune = () => {
    setTune(blankTune());
    setShareNotice('');
    if (typeof window !== 'undefined' && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };
  const loadPreset = (preset) => {
    setTune(presetToTune(preset));
    setShareNotice(`Loaded preset “${preset.name}”.`);
  };

  const shareTune = async () => {
    if (typeof window === 'undefined') return;
    const encoded = encodeTuneForUrl(tune);
    if (!encoded) {
      setShareNotice('Could not encode tune.');
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}?${URL_PARAM}=${encoded}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setShareNotice('Share link copied to clipboard.');
      } else {
        window.prompt('Copy this share link:', url);
      }
    } catch (e) {
      window.prompt('Copy this share link:', url);
    }
    // Also reflect the encoded state into the address bar so a refresh keeps it.
    if (window.history.replaceState) {
      window.history.replaceState(null, '', `${window.location.pathname}?${URL_PARAM}=${encoded}`);
    }
  };

  const totalBars = useMemo(
    () => tune.slots.reduce((sum, s) => sum + (Number(s.bars) || 0), 0),
    [tune.slots]
  );

  return (
    <div className="jm-root">
      <Head>
        <title>Jazz Scale Mapper — practice tune scales by bar | Music Theory Trainer</title>
        <meta name="description" content="Free interactive tool for jazz guitarists. Map out the scales for any tune, bar by bar, and see fretboard diagrams colour-coded by scale degree. Save your charts, share with students, cycle through CAGED positions." />
        <link rel="canonical" href="https://theory-trainer.com/jazz-mapper" />
        <meta property="og:title" content="Jazz Scale Mapper" />
        <meta property="og:description" content="Map out the scales for any jazz tune, bar by bar. Fretboard diagrams colour-coded by scale degree." />
        <meta property="og:url" content="https://theory-trainer.com/jazz-mapper" />
        <meta property="og:image" content="https://theory-trainer.com/og-default.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <style>{styles}</style>

      <header className="jm-header">
        <Link to="/" className="jm-back">← Music Theory Trainer</Link>
        <h1 className="jm-h1">Jazz Scale Mapper</h1>
        <p className="jm-intro">
          A secondary lead sheet for jazz improvisers — map out the tonal centres
          of a tune by bar, and see each scale on the fretboard colour-coded by
          scale degree. Cycle positions to learn the same scale in five places on
          the neck.
        </p>
      </header>

      <main className="jm-main">
        {/* Tune-level controls */}
        <section className="jm-tune-meta">
          <label className="jm-field">
            <span className="jm-field-label">Tune name</span>
            <input
              type="text"
              className="jm-input"
              placeholder="e.g. Autumn Leaves (my changes)"
              value={tune.name}
              onChange={(e) => setTune({ ...tune, name: e.target.value })}
            />
          </label>
          <label className="jm-field jm-field-narrow">
            <span className="jm-field-label">Time</span>
            <select
              className="jm-input"
              value={tune.timeSignature.join('/')}
              onChange={(e) => {
                const [n, d] = e.target.value.split('/').map(Number);
                setTune({ ...tune, timeSignature: [n, d] });
              }}
            >
              {TIME_SIG_OPTIONS.map(([n, d]) => (
                <option key={`${n}/${d}`} value={`${n}/${d}`}>{n}/{d}</option>
              ))}
            </select>
          </label>
          <div className="jm-actions">
            <button type="button" className="jm-btn" onClick={saveCurrentTune}>Save</button>
            <button type="button" className="jm-btn" onClick={shareTune}>Share link</button>
            <button type="button" className="jm-btn jm-btn-ghost" onClick={newTune}>New</button>
          </div>
        </section>
        {shareNotice && <p className="jm-notice">{shareNotice}</p>}

        <p className="jm-totalbars">
          {tune.slots.length} {tune.slots.length === 1 ? 'slot' : 'slots'} · {totalBars} {totalBars === 1 ? 'bar' : 'bars'} total
        </p>

        {/* Slot list */}
        <ol className="jm-slots">
          {tune.slots.map((slot, idx) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              index={idx}
              total={tune.slots.length}
              onChange={(patch) => updateSlot(slot.id, patch)}
              onRemove={() => removeSlot(slot.id)}
              onMove={(dir) => moveSlot(slot.id, dir)}
            />
          ))}
        </ol>

        <button type="button" className="jm-btn jm-btn-add" onClick={addSlot}>+ Add slot</button>

        {/* Saved tunes */}
        <section className="jm-saved">
          <h2 className="jm-h2">Your saved tunes</h2>
          {savedTunes.length === 0 ? (
            <p className="jm-muted">No tunes saved yet. Name your tune and hit Save to add one.</p>
          ) : (
            <ul className="jm-saved-list">
              {savedTunes.map((t) => (
                <li key={t.name} className="jm-saved-row">
                  <span className="jm-saved-name">{t.name}</span>
                  <span className="jm-saved-meta">
                    {t.slots.length} {t.slots.length === 1 ? 'slot' : 'slots'}
                    {' · '}
                    {t.slots.reduce((s, sl) => s + (Number(sl.bars) || 0), 0)} bars
                  </span>
                  <div className="jm-saved-actions">
                    <button type="button" className="jm-btn jm-btn-sm" onClick={() => loadTune(t)}>Load</button>
                    <button type="button" className="jm-btn jm-btn-sm jm-btn-ghost" onClick={() => deleteSaved(t.name)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Presets */}
        <section className="jm-presets">
          <h2 className="jm-h2">Presets</h2>
          <p className="jm-muted">Quick starting points — load one and edit freely.</p>
          <ul className="jm-presets-list">
            {PRESETS.map((p) => (
              <li key={p.id} className="jm-preset-row">
                <span className="jm-preset-name">{p.name}</span>
                <span className="jm-preset-meta">{p.timeSignature.join('/')} · {p.slots.length} slots</span>
                <button type="button" className="jm-btn jm-btn-sm" onClick={() => loadPreset(p)}>Load</button>
              </li>
            ))}
          </ul>
        </section>

        {/* Scale-degree legend */}
        <section className="jm-legend">
          <h2 className="jm-h2">Scale-degree colours</h2>
          <ul className="jm-legend-list">
            {[1, 2, 3, 4, 5, 6, 7].map((deg, i) => (
              <li key={deg} className="jm-legend-item">
                <span className="jm-legend-dot" style={{ background: DEGREE_COLORS[i] }} />
                <span className="jm-legend-label">{deg}</span>
              </li>
            ))}
          </ul>
          <p className="jm-muted jm-muted-sm">
            Altered degrees (♭3, ♯4, ♭7, etc.) use the same colour as the
            corresponding scale-degree number — the colour tells you which
            degree of the scale, the label tells you whether it's flat,
            natural, or sharp.
          </p>
        </section>
      </main>

      <footer className="jm-footer">
        <Link to="/">← Music Theory Trainer</Link>
        <span>Created by Pierce Porterfield</span>
      </footer>
    </div>
  );
}

// ─── Slot card ──────────────────────────────────────────────────────────────

function SlotCard({ slot, index, total, onChange, onRemove, onMove }) {
  const [posIdx, setPosIdx] = useState(0);
  const positions = useMemo(() => positionsForRoot(slot.rootPc), [slot.rootPc]);
  // Clamp position index when the root changes and the available positions shrink.
  const clampedPosIdx = Math.min(posIdx, Math.max(0, positions.length - 1));
  const pos = positions[clampedPosIdx];
  const scaleNotes = useMemo(() => scaleNotesPc(slot.rootPc, slot.modeId), [slot.rootPc, slot.modeId]);
  const labels = useMemo(() => degreeLabels(slot.modeId), [slot.modeId]);
  const mode = modeById(slot.modeId);

  // Root pitch-class is shown with both sharp and flat names so the user
  // gets the spelling they're reading on the chart.
  const sharpRoot = pcToSharpName(slot.rootPc);
  const flatRoot = pcToFlatName(slot.rootPc);
  const rootDisplay = sharpRoot === flatRoot ? sharpRoot : `${sharpRoot} / ${flatRoot}`;

  return (
    <li className="jm-slot">
      <div className="jm-slot-header">
        <span className="jm-slot-index">#{index + 1}</span>
        <select
          className="jm-input jm-input-tight"
          value={slot.rootPc}
          onChange={(e) => onChange({ rootPc: Number(e.target.value) })}
          aria-label="Root note"
        >
          {ROOT_OPTIONS.map((r) => (
            <option key={r.pc} value={r.pc}>{r.label}</option>
          ))}
        </select>
        <select
          className="jm-input jm-input-tight"
          value={slot.modeId}
          onChange={(e) => onChange({ modeId: e.target.value })}
          aria-label="Mode"
        >
          {MODES.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <select
          className="jm-input jm-input-tight"
          value={slot.bars}
          onChange={(e) => onChange({ bars: Number(e.target.value) })}
          aria-label="Duration"
        >
          {BAR_OPTIONS.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
        <div className="jm-slot-controls">
          <button type="button" className="jm-iconbtn" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
          <button type="button" className="jm-iconbtn" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Move down">↓</button>
          <button type="button" className="jm-iconbtn jm-iconbtn-danger" disabled={total <= 1} onClick={onRemove} aria-label="Remove slot">×</button>
        </div>
      </div>

      <div className="jm-slot-title">
        {rootDisplay} {mode?.name || ''}
        <span className="jm-slot-subtitle">{mode?.subtitle}</span>
      </div>

      <div className="jm-fb-wrap">
        <ScaleFretboard
          rootPc={slot.rootPc}
          scaleNotes={scaleNotes}
          degreeLabels={labels}
          startFret={pos?.startFret ?? 0}
          endFret={pos?.endFret ?? 5}
        />
      </div>

      <div className="jm-pos-controls">
        <button
          type="button"
          className="jm-btn jm-btn-sm"
          onClick={() => setPosIdx((p) => (p - 1 + positions.length) % positions.length)}
        >
          ← Position
        </button>
        <span className="jm-pos-label">
          Pos {clampedPosIdx + 1} / {positions.length} · frets {pos?.startFret ?? 0}–{pos?.endFret ?? 0}
        </span>
        <button
          type="button"
          className="jm-btn jm-btn-sm"
          onClick={() => setPosIdx((p) => (p + 1) % positions.length)}
        >
          Position →
        </button>
      </div>
    </li>
  );
}

const styles = `
  .jm-root {
    --ink: #1a1410;
    --ink-soft: #3d342b;
    --paper: #f4ecdc;
    --paper-deep: #ebe0c9;
    --paper-shadow: #d9cbad;
    --accent: #8b2c20;
    --gold: #a88734;
    font-family: 'Cormorant Garamond', Georgia, serif;
    color: var(--ink);
    background: var(--paper);
    min-height: 100vh;
    padding: 1.5rem 1rem 4rem;
    line-height: 1.55;
  }
  .jm-header { max-width: 980px; margin: 0 auto 1.5rem; }
  .jm-back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--ink-soft); text-decoration: none;
    display: inline-block; margin-bottom: 1rem;
  }
  .jm-back:hover { color: var(--accent); }
  .jm-h1 {
    font-family: 'Italiana', serif;
    font-size: clamp(2.2rem, 5vw, 3.4rem);
    margin: 0 0 0.5rem;
    line-height: 1.05;
  }
  .jm-intro { font-size: 1.05rem; color: var(--ink-soft); margin: 0 0 1rem; max-width: 60ch; }
  .jm-h2 {
    font-family: 'Italiana', serif;
    font-size: 1.4rem;
    margin: 2rem 0 0.6rem;
    color: var(--ink);
  }

  .jm-main { max-width: 980px; margin: 0 auto; }

  .jm-tune-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    align-items: flex-end;
    padding: 1rem;
    background: var(--paper-deep);
    border: 1px solid var(--ink-soft);
    box-shadow: 4px 4px 0 var(--paper-shadow);
    margin-bottom: 1rem;
  }
  .jm-field { display: flex; flex-direction: column; gap: 0.3rem; flex: 1 1 220px; min-width: 0; }
  .jm-field-narrow { flex: 0 0 110px; }
  .jm-field-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .jm-input {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1rem;
    padding: 0.55rem 0.7rem;
    background: var(--paper);
    border: 1px solid var(--ink-soft);
    color: var(--ink);
    min-width: 0;
    width: 100%;
  }
  .jm-input-tight { padding: 0.4rem 0.55rem; font-size: 0.95rem; width: auto; }
  .jm-input:focus { outline: 2px solid var(--accent); outline-offset: 0; }

  .jm-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .jm-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 0.6rem 1rem;
    background: var(--ink);
    color: var(--paper);
    border: 1px solid var(--ink);
    cursor: pointer;
    transition: background 0.12s ease, color 0.12s ease;
  }
  .jm-btn:hover { background: var(--accent); border-color: var(--accent); }
  .jm-btn-ghost { background: transparent; color: var(--ink); }
  .jm-btn-ghost:hover { background: var(--ink); color: var(--paper); }
  .jm-btn-sm { padding: 0.4rem 0.7rem; font-size: 0.6rem; letter-spacing: 0.15em; }
  .jm-btn-add { display: block; margin: 0.5rem auto 1.5rem; }
  .jm-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .jm-iconbtn {
    width: 28px; height: 28px;
    background: transparent;
    border: 1px solid var(--ink-soft);
    color: var(--ink);
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    line-height: 1;
  }
  .jm-iconbtn:hover { background: var(--ink); color: var(--paper); }
  .jm-iconbtn:disabled { opacity: 0.3; cursor: not-allowed; }
  .jm-iconbtn-danger:hover { background: var(--accent); border-color: var(--accent); color: var(--paper); }

  .jm-notice {
    margin: -0.5rem 0 1rem;
    padding: 0.5rem 0.85rem;
    background: var(--paper-deep);
    border-left: 3px solid var(--gold);
    font-size: 0.85rem;
    color: var(--ink-soft);
  }

  .jm-totalbars {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin: 1rem 0 0.5rem;
  }

  .jm-slots { list-style: none; margin: 0 0 1rem; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
  .jm-slot {
    padding: 1rem;
    background: var(--paper-deep);
    border: 1px solid var(--ink);
    box-shadow: 4px 4px 0 var(--paper-shadow);
  }
  .jm-slot-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .jm-slot-index {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    color: var(--ink-soft);
    min-width: 2rem;
  }
  .jm-slot-controls { margin-left: auto; display: flex; gap: 0.35rem; }
  .jm-slot-title {
    font-family: 'Italiana', serif;
    font-size: 1.4rem;
    margin: 0.25rem 0 0.6rem;
    color: var(--ink);
  }
  .jm-slot-subtitle {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-left: 0.6rem;
    opacity: 0.8;
  }

  .jm-fb-wrap {
    overflow-x: auto;
    background: var(--paper);
    padding: 0.5rem;
    border: 1px solid var(--paper-shadow);
  }
  .scale-fb { display: block; max-width: 100%; height: auto; }

  .jm-pos-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    margin-top: 0.6rem;
    flex-wrap: wrap;
  }
  .jm-pos-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    color: var(--ink-soft);
  }

  .jm-saved, .jm-presets, .jm-legend {
    padding: 1rem 1.25rem;
    background: var(--paper-deep);
    border: 1px solid var(--ink-soft);
    margin-top: 1.5rem;
  }
  .jm-saved-list, .jm-presets-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
  .jm-saved-row, .jm-preset-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem 0.7rem;
    background: var(--paper);
    border: 1px solid var(--paper-shadow);
  }
  .jm-saved-name, .jm-preset-name {
    font-family: 'Italiana', serif;
    font-size: 1.1rem;
    color: var(--ink);
    flex: 1 1 auto;
    min-width: 0;
  }
  .jm-saved-meta, .jm-preset-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .jm-saved-actions { display: flex; gap: 0.4rem; }

  .jm-muted { color: var(--ink-soft); margin: 0.25rem 0; }
  .jm-muted-sm { font-size: 0.85rem; max-width: 60ch; }

  .jm-legend-list {
    list-style: none; margin: 0.4rem 0 0.5rem; padding: 0;
    display: flex; flex-wrap: wrap; gap: 0.7rem 1.1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
  }
  .jm-legend-item { display: inline-flex; align-items: center; gap: 0.4rem; }
  .jm-legend-dot {
    display: inline-block; width: 14px; height: 14px; border-radius: 50%;
    border: 1px solid var(--ink);
  }
  .jm-legend-label { font-weight: 600; color: var(--ink); }

  .jm-footer {
    max-width: 980px;
    margin: 3rem auto 0;
    padding-top: 2rem;
    border-top: 1px solid var(--paper-shadow);
    display: flex; justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--ink-soft);
  }
  .jm-footer a { color: var(--ink-soft); text-decoration: none; }
  .jm-footer a:hover { color: var(--accent); }
`;
