import React from 'react';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const ACCIDENTALS = [
  { value: 'b', glyph: '\u266D' },
  { value: '#', glyph: '\u266F' },
];

// Split "C#m7" into root + quality string
const parseChord = (s) => {
  if (!s) return { letter: '', accidental: '', quality: '' };
  const t = s.replace(/\u266F/g, '#').replace(/\u266D/g, 'b');
  const letter = (t[0] || '').toUpperCase();
  if (!'ABCDEFG'.includes(letter)) return { letter: '', accidental: '', quality: '' };
  let i = 1;
  let acc = '';
  while (i < t.length && (t[i] === '#' || t[i] === 'b')) {
    acc += t[i];
    i++;
  }
  return { letter, accidental: acc, quality: t.slice(i) };
};

// qualityOptions: [{ key, symbol, label }]
//   symbol is appended to root (e.g. 'maj7', 'm', '°7', '')
//   label is what shows on the button (e.g. 'maj' for empty string)
export default function ChordPicker({ value, onChange, qualityOptions }) {
  const { letter, accidental, quality } = parseChord(value);

  const compose = (l, a, q) => l ? l + a + q : '';

  const setLetter = (l) => onChange(compose(l, accidental, quality));
  const setAccidental = (a) => {
    if (!letter) return;
    onChange(compose(letter, accidental === a ? '' : a, quality));
  };
  const setQuality = (sym) => {
    if (!letter) return;
    onChange(compose(letter, accidental, quality === sym ? '' : sym));
  };
  const clear = () => onChange('');

  return (
    <div className="np-wrapper">
      <div className="np-letter-row">
        {LETTERS.map((l) => (
          <button
            key={l}
            type="button"
            className={`np-letter ${letter === l ? 'on' : ''}`}
            onClick={() => setLetter(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="np-acc-row">
        {ACCIDENTALS.map((a) => (
          <button
            key={a.value}
            type="button"
            className={`np-acc ${accidental === a.value ? 'on' : ''}`}
            onClick={() => setAccidental(a.value)}
            disabled={!letter}
          >
            {a.glyph}
          </button>
        ))}
        <button type="button" className="np-clear" onClick={clear}>Clear</button>
      </div>

      <div className="cp-quality-grid">
        {qualityOptions.map((q) => (
          <button
            key={q.key}
            type="button"
            className={`cp-quality ${quality === q.symbol ? 'on' : ''}`}
            onClick={() => setQuality(q.symbol)}
            disabled={!letter}
          >
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}
