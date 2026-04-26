import React from 'react';

export const INPUT_MODES = [
  { id: 'tap',    label: 'Tap',    icon: '/icons/ClickTapMode.svg' },
  { id: 'staff',  label: 'Staff',  icon: '/icons/MusicStaffMode.svg' },
  { id: 'piano',  label: 'Piano',  icon: '/icons/PianoKeysMode.svg' },
  { id: 'guitar', label: 'Guitar', icon: '/icons/GuitarMode.svg' },
];

export default function InputModeSelector({ value, onChange, modes = INPUT_MODES }) {
  return (
    <div className="ims-row">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`ims-btn ${value === m.id ? 'on' : ''}`}
          onClick={() => onChange(m.id)}
          aria-label={m.label}
        >
          <img src={m.icon} alt="" className="ims-icon" />
          <span className="ims-label">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
