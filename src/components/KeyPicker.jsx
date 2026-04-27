import React from 'react';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const ACCIDENTALS = [
  { value: 'b', glyph: '\u266D' },
  { value: '#', glyph: '\u266F' },
];

const parseKey = (s) => {
  if (!s) return { letter: '', accidental: '', isMinor: false };
  const t = s.replace(/\u266F/g, '#').replace(/\u266D/g, 'b');
  const letter = (t[0] || '').toUpperCase();
  if (!'ABCDEFG'.includes(letter)) return { letter: '', accidental: '', isMinor: false };
  let i = 1;
  let acc = '';
  while (i < t.length && (t[i] === '#' || t[i] === 'b')) {
    acc += t[i];
    i++;
  }
  const rest = t.slice(i).toLowerCase();
  const isMinor = rest === 'm' || rest === 'min' || rest === 'minor' || rest === '-';
  return { letter, accidental: acc, isMinor };
};

// allowMajor / allowMinor: which modes are valid answers.
//   both true  → user picks Major or Minor via toggles below
//   only one   → mode is locked; user picks letter + accidental only,
//                and a small read-only label tells them which mode
//                this card is asking for.
export default function KeyPicker({ value, onChange, allowMajor, allowMinor }) {
  const { letter, accidental, isMinor: parsedMinor } = parseKey(value);

  // If exactly one mode is allowed, force that mode regardless of what's
  // already in `value`. Otherwise honour whatever the user has selected.
  const lockedMinor =
    allowMajor && !allowMinor ? false :
    allowMinor && !allowMajor ? true  :
    null;
  const isMinor = lockedMinor != null ? lockedMinor : parsedMinor;

  const compose = (l, a, m) => l ? l + a + (m ? 'm' : '') : '';

  const setLetter = (l) => onChange(compose(l, accidental, isMinor));
  const setAccidental = (a) => {
    if (!letter) return;
    onChange(compose(letter, accidental === a ? '' : a, isMinor));
  };
  const setMode = (minor) => {
    if (!letter) return;
    onChange(compose(letter, accidental, minor));
  };
  const clear = () => onChange('');

  const showModeToggles = allowMajor && allowMinor;
  const showLockedLabel = lockedMinor != null;

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

      {showModeToggles && (
        <div className="kp-mode-row">
          <button
            type="button"
            className={`kp-mode ${!isMinor ? 'on' : ''}`}
            onClick={() => setMode(false)}
            disabled={!letter}
          >
            Major
          </button>
          <button
            type="button"
            className={`kp-mode ${isMinor ? 'on' : ''}`}
            onClick={() => setMode(true)}
            disabled={!letter}
          >
            Minor
          </button>
        </div>
      )}
      {showLockedLabel && (
        <div className="kp-mode-locked">
          Answering for a <strong>{lockedMinor ? 'minor' : 'major'}</strong> key
        </div>
      )}
    </div>
  );
}
