import React from 'react';

export const INPUT_MODES = [
  { id: 'tap',    label: 'Tap',    icon: '/icons/ClickTapMode.svg' },
  { id: 'staff',  label: 'Staff',  icon: '/icons/MusicStaffMode.svg' },
  { id: 'piano',  label: 'Piano',  icon: '/icons/PianoKeysMode.svg' },
  { id: 'guitar', label: 'Guitar', icon: '/icons/GuitarMode.svg' },
];

// Single-select if `value` is a string, multi-select if it's an array.
// In multi-select mode `onChange(id)` is called per toggle and the parent
// applies the add/remove to its own state.
export default function InputModeSelector({ value, onChange, modes = INPUT_MODES }) {
  const multi = Array.isArray(value);
  const isOn = (id) => multi ? value.includes(id) : value === id;

  return (
    <div className="ims-row">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`ims-btn ${isOn(m.id) ? 'on' : ''}`}
          onClick={() => onChange(m.id)}
          aria-label={m.label}
          aria-pressed={multi ? isOn(m.id) : undefined}
        >
          <img src={m.icon} alt="" className="ims-icon" />
          <span className="ims-label">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
