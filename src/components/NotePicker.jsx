import React, { useState, useEffect } from 'react';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const ACCIDENTALS = [
  { value: 'b', glyph: '\u266D' },
  { value: '',  glyph: '\u266E' },
  { value: '#', glyph: '\u266F' },
];

const parseSlot = (s) => {
  if (!s) return { letter: '', accidental: '' };
  return { letter: s[0] || '', accidental: s.slice(1) || '' };
};

const formatNote = (s) =>
  s.replace('##', '\u{1D12A}').replace('bb', '\u{1D12B}')
   .replace('#', '\u266F').replace('b', '\u266D');

// Note-slot picker.
// Props:
//   value:       string[] of notes (e.g. ['C', 'E', 'G'])
//   onChange:    (next: string[]) => void
//   slotLabels:  string[] same length as count (e.g. ['1', '3', '5'])
//   slotNames:   optional friendly names (e.g. ['ROOT', '3rd', '5th'])
//   count:       number of slots
export default function NotePicker({ value, onChange, slotLabels, slotNames, count }) {
  const [focused, setFocused] = useState(0);
  const [armedAcc, setArmedAcc] = useState('');

  // Keep focus in range as count changes between cards
  useEffect(() => {
    if (focused >= count) setFocused(0);
  }, [count, focused]);

  const slots = Array.from({ length: count }, (_, i) => parseSlot(value[i] || ''));

  const updateSlot = (i, note) => {
    const next = [...value];
    while (next.length < count) next.push('');
    next[i] = note;
    onChange(next.slice(0, count));
  };

  const findNextEmpty = (from) => {
    for (let i = from + 1; i < count; i++) {
      if (!slots[i].letter) return i;
    }
    for (let i = 0; i < from; i++) {
      if (!slots[i].letter) return i;
    }
    return -1;
  };

  const handleLetter = (letter) => {
    const cur = slots[focused];
    if (cur.letter) {
      // Already has a letter — revise, keep accidental
      updateSlot(focused, letter + cur.accidental);
    } else {
      // Empty slot: apply letter + armed accidental, advance
      updateSlot(focused, letter + armedAcc);
      setArmedAcc('');
      const next = findNextEmpty(focused);
      if (next !== -1) setFocused(next);
    }
  };

  const handleAccidental = (acc) => {
    const cur = slots[focused];
    if (cur.letter) {
      // Apply directly to filled slot (toggle off if same)
      updateSlot(focused, cur.letter + (cur.accidental === acc ? '' : acc));
      setArmedAcc('');
    } else {
      // Empty slot: arm for next letter (toggle off if same)
      setArmedAcc(armedAcc === acc ? '' : acc);
    }
  };

  const handleSlotTap = (i) => {
    setFocused(i);
    setArmedAcc('');
  };

  const handleClear = () => {
    onChange(Array.from({ length: count }, () => ''));
    setFocused(0);
    setArmedAcc('');
  };

  return (
    <div className="np-wrapper">
      <div className="np-slots">
        {slots.map((s, i) => {
          const isFocused = i === focused;
          return (
            <button
              key={i}
              type="button"
              className={`np-slot ${isFocused ? 'focused' : ''} ${s.letter ? 'filled' : ''}`}
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

      <div className="np-acc-row">
        {ACCIDENTALS.map((a) => {
          const cur = slots[focused];
          const isOn = cur.letter
            ? cur.accidental === a.value
            : armedAcc === a.value;
          return (
            <button
              key={a.value || 'natural'}
              type="button"
              className={`np-acc ${isOn ? 'on' : ''}`}
              onClick={() => handleAccidental(a.value)}
            >
              {a.glyph}
            </button>
          );
        })}
        <button type="button" className="np-clear" onClick={handleClear}>Clear</button>
      </div>

      <div className="np-letter-row">
        {LETTERS.map((l) => (
          <button
            key={l}
            type="button"
            className="np-letter"
            onClick={() => handleLetter(l)}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
