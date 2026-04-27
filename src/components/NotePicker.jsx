import React, { useState, useEffect } from 'react';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const ACCIDENTALS = [
  { value: 'b', glyph: '\u266D' },
  { value: '#', glyph: '\u266F' },
];

const parseSlot = (s) => {
  if (!s) return { letter: '', accidental: '' };
  return { letter: s[0] || '', accidental: s.slice(1) || '' };
};

const formatNote = (s) =>
  s.replace('##', '\u{1D12A}').replace('bb', '\u{1D12B}')
   .replace('#', '\u266F').replace('b', '\u266D');

// Note-slot picker — letter first, then optional accidental.
//
// Behavior:
//   - Tapping a letter writes it to the first empty slot (or to a slot
//     that's been explicitly selected). After a letter is written, that
//     slot becomes the accidental target.
//   - Tapping ♭ or ♯ toggles the accidental on the accidental-target slot.
//     Natural is the default (no accidental); tap the same accidental again
//     to clear it.
//   - Tapping a slot selects it: the next letter or accidental will operate
//     on that slot. Selection clears after a letter is written.
//   - Clear resets every slot.
export default function NotePicker({ value, onChange, slotLabels, slotNames, count }) {
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [lastFilled, setLastFilled] = useState(-1);

  // Reset selection state when the card changes (count / value identity)
  useEffect(() => {
    setSelectedIdx(-1);
    setLastFilled(-1);
  }, [count]);

  const slots = Array.from({ length: count }, (_, i) => parseSlot(value[i] || ''));

  const findNextEmpty = () => {
    for (let i = 0; i < count; i++) if (!slots[i].letter) return i;
    return -1;
  };

  const writeSlot = (i, note) => {
    const next = [...value];
    while (next.length < count) next.push('');
    next[i] = note;
    onChange(next.slice(0, count));
  };

  const handleLetter = (letter) => {
    // Priority: explicitly-selected slot → next empty slot → overwrite the
    // most recently filled slot. The third fallback means a single-slot
    // picker (Note Trainer, Interval Trainer) always replaces on a fresh
    // tap, and a multi-slot picker lets you correct your last entry without
    // hitting Clear first.
    let targetIdx = selectedIdx >= 0 ? selectedIdx : findNextEmpty();
    if (targetIdx === -1) targetIdx = lastFilled >= 0 ? lastFilled : 0;
    writeSlot(targetIdx, letter); // replace; accidental cleared
    setLastFilled(targetIdx);
    setSelectedIdx(-1);
  };

  const handleAccidental = (acc) => {
    const targetIdx = selectedIdx >= 0 ? selectedIdx : lastFilled;
    if (targetIdx === -1) return;
    const cur = slots[targetIdx];
    if (!cur.letter) return;
    writeSlot(targetIdx, cur.letter + (cur.accidental === acc ? '' : acc));
  };

  const handleSlotTap = (i) => {
    setSelectedIdx(i);
  };

  const handleClear = () => {
    onChange(Array.from({ length: count }, () => ''));
    setSelectedIdx(-1);
    setLastFilled(-1);
  };

  const nextEmptyIdx = findNextEmpty();
  const accTargetIdx = selectedIdx >= 0 ? selectedIdx : lastFilled;
  const accTargetSlot = accTargetIdx >= 0 ? slots[accTargetIdx] : null;

  return (
    <div className="np-wrapper">
      <div className="np-slots">
        {slots.map((s, i) => {
          const isSelected = selectedIdx === i;
          const isReady = selectedIdx === -1 && nextEmptyIdx === i;
          return (
            <button
              key={i}
              type="button"
              className={`np-slot ${isSelected ? 'focused' : ''} ${isReady ? 'ready' : ''} ${s.letter ? 'filled' : ''}`}
              onClick={() => handleSlotTap(i)}
            >
              <span className="np-slot-label">{slotNames ? slotNames[i] : slotLabels[i]}</span>
              <span className="np-slot-value">
                {s.letter ? formatNote(s.letter + s.accidental) : '—'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="np-letter-row">
        {LETTERS.map((l) => (
          <button key={l} type="button" className="np-letter" onClick={() => handleLetter(l)}>
            {l}
          </button>
        ))}
      </div>

      <div className="np-acc-row">
        {ACCIDENTALS.map((a) => {
          const isOn = accTargetSlot && accTargetSlot.letter && accTargetSlot.accidental === a.value;
          const enabled = accTargetSlot && accTargetSlot.letter;
          return (
            <button
              key={a.value}
              type="button"
              className={`np-acc ${isOn ? 'on' : ''}`}
              onClick={() => handleAccidental(a.value)}
              disabled={!enabled}
            >
              {a.glyph}
            </button>
          );
        })}
        <button type="button" className="np-clear" onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
}
