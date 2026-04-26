import React from 'react';

// Mobile-first full-viewport layout for the "playing" view of any trainer.
// Top bar (~48px) · progress bar · flexible card area · pinned bottom controls.
export default function TrainerLayout({
  topLeft,
  topCenter,
  topRight,
  progress,   // 0..1, optional
  children,   // card area
  controls,   // bottom controls
}) {
  return (
    <div className="trainer-screen">
      <div className="trainer-topbar">
        <div className="trainer-topbar-slot trainer-topbar-left">{topLeft}</div>
        <div className="trainer-topbar-slot trainer-topbar-center">{topCenter}</div>
        <div className="trainer-topbar-slot trainer-topbar-right">{topRight}</div>
      </div>
      {progress != null && (
        <div className="trainer-progress">
          <div
            className="trainer-progress-fill"
            style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
          />
        </div>
      )}
      <div className="trainer-card-area">{children}</div>
      <div className="trainer-controls">{controls}</div>
    </div>
  );
}
