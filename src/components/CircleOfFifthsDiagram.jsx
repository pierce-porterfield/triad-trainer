import React from 'react';

// Static SVG circle-of-fifths diagram. Pure presentation, no interactivity —
// designed to render inside SEO-prerendered HTML for the /learn article on
// how the circle works. Major keys outer, relative minors inner, with the
// key-signature accidental count on each spoke.

// Position 0 is C at top, then clockwise (sharps) → F# at bottom, then
// continuing clockwise the flat side back up to F just left of C.
const ENTRIES = [
  { major: 'C',  minor: 'Am',  count: 0,  type: 'natural' },
  { major: 'G',  minor: 'Em',  count: 1,  type: 'sharp' },
  { major: 'D',  minor: 'Bm',  count: 2,  type: 'sharp' },
  { major: 'A',  minor: 'F♯m', count: 3,  type: 'sharp' },
  { major: 'E',  minor: 'C♯m', count: 4,  type: 'sharp' },
  { major: 'B',  minor: 'G♯m', count: 5,  type: 'sharp' },
  { major: 'F♯', minor: 'D♯m', count: 6,  type: 'sharp', enh: 'G♭' },
  { major: 'D♭', minor: 'B♭m', count: 5,  type: 'flat',  enh: 'C♯' },
  { major: 'A♭', minor: 'Fm',  count: 4,  type: 'flat' },
  { major: 'E♭', minor: 'Cm',  count: 3,  type: 'flat' },
  { major: 'B♭', minor: 'Gm',  count: 2,  type: 'flat' },
  { major: 'F',  minor: 'Dm',  count: 1,  type: 'flat' },
];

// Geometry. ViewBox is square; 0,0 is centre.
const SIZE = 360;          // viewBox is -SIZE..+SIZE on each axis
const OUTER_R = 290;       // major-key labels
const RING_R  = 220;       // outer ring boundary
const INNER_R = 165;       // minor-key labels
const HUB_R   = 105;       // inner ring boundary

// Convert position index (0..11, 0 = top) to (x, y) at radius r.
const polar = (i, r) => {
  const angle = (i / 12) * Math.PI * 2 - Math.PI / 2; // -π/2 puts 0 at top
  return [r * Math.cos(angle), r * Math.sin(angle)];
};

export default function CircleOfFifthsDiagram() {
  const vb = `${-SIZE} ${-SIZE} ${SIZE * 2} ${SIZE * 2}`;

  return (
    <figure className="cof-diagram">
      <svg viewBox={vb} role="img" aria-label="The circle of fifths">
        <title>The circle of fifths</title>
        <desc>
          A circular diagram with twelve segments. C major sits at the top.
          Moving clockwise, each segment adds one sharp to the key signature
          (G, D, A, E, B, F♯). Moving counter-clockwise from C, each segment
          adds one flat (F, B♭, E♭, A♭, D♭). Each major key's relative minor
          is shown on the inside of the circle.
        </desc>

        {/* Outer and inner ring boundaries */}
        <circle cx={0} cy={0} r={RING_R} className="cof-ring" />
        <circle cx={0} cy={0} r={HUB_R} className="cof-ring" />
        <circle cx={0} cy={0} r={OUTER_R + 12} className="cof-outer-frame" />

        {/* 12 spokes */}
        {ENTRIES.map((_, i) => {
          const [x1, y1] = polar(i + 0.5, HUB_R);
          const [x2, y2] = polar(i + 0.5, RING_R);
          return (
            <line
              key={`spoke-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              className="cof-spoke"
            />
          );
        })}

        {/* Major-key labels around the outer ring */}
        {ENTRIES.map((e, i) => {
          const [x, y] = polar(i, (OUTER_R + RING_R) / 2);
          return (
            <g key={`maj-${i}`} className={`cof-major cof-${e.type}`}>
              <text x={x} y={y} dy="0.34em">{e.major}</text>
              <text x={x} y={y + 28} dy="0.34em" className="cof-sig">
                {e.count === 0 ? '—' :
                 `${e.count}${e.type === 'sharp' ? '♯' : '♭'}`}
              </text>
              {e.enh && (
                <text x={x} y={y - 28} dy="0.34em" className="cof-enh">
                  ({e.enh})
                </text>
              )}
            </g>
          );
        })}

        {/* Minor-key labels in the inner ring */}
        {ENTRIES.map((e, i) => {
          const [x, y] = polar(i, (INNER_R + HUB_R) / 2);
          return (
            <text
              key={`min-${i}`}
              x={x} y={y} dy="0.34em"
              className="cof-minor"
            >
              {e.minor}
            </text>
          );
        })}

        {/* Centre marker */}
        <circle cx={0} cy={0} r={HUB_R - 14} className="cof-hub" />
        <text x={0} y={-8} dy="0.34em" className="cof-hub-label">Circle</text>
        <text x={0} y={20} dy="0.34em" className="cof-hub-label">of Fifths</text>
      </svg>
      <figcaption className="cof-caption">
        Major keys around the outside, relative minors inside. Clockwise adds sharps; counter-clockwise adds flats.
      </figcaption>
      <style>{styles}</style>
    </figure>
  );
}

const styles = `
  .cof-diagram {
    margin: 1.5rem auto 2rem;
    max-width: 520px;
    text-align: center;
  }
  .cof-diagram svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .cof-caption {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft, #3d342b);
    font-size: 0.95rem;
    margin-top: 0.75rem;
  }

  /* Rings + spokes */
  .cof-ring {
    fill: none;
    stroke: #1a1410;
    stroke-width: 1.5;
  }
  .cof-outer-frame {
    fill: #ebe0c9;
    stroke: #1a1410;
    stroke-width: 2;
  }
  .cof-spoke {
    stroke: #1a1410;
    stroke-width: 1;
    opacity: 0.5;
  }
  .cof-hub {
    fill: #f4ecdc;
    stroke: #1a1410;
    stroke-width: 1.5;
  }

  /* Labels */
  .cof-major text {
    text-anchor: middle;
    font-family: 'Italiana', serif;
    fill: #1a1410;
  }
  .cof-major > text:first-child {
    font-size: 30px;
  }
  .cof-major.cof-sharp > text:first-child { fill: #1a1410; }
  .cof-major.cof-flat > text:first-child { fill: #3d342b; }
  .cof-major.cof-natural > text:first-child {
    fill: #8b2c20;
    font-weight: 500;
  }
  .cof-sig {
    font-size: 14px !important;
    font-family: 'JetBrains Mono', monospace !important;
    fill: #8b2c20 !important;
    letter-spacing: 0.05em;
  }
  .cof-enh {
    font-size: 12px !important;
    font-family: 'JetBrains Mono', monospace !important;
    fill: #3d342b !important;
    opacity: 0.7;
  }
  .cof-minor {
    text-anchor: middle;
    font-family: 'Italiana', serif;
    font-style: italic;
    font-size: 18px;
    fill: #3d342b;
  }
  .cof-hub-label {
    text-anchor: middle;
    font-family: 'Italiana', serif;
    fill: #3d342b;
    font-size: 16px;
    letter-spacing: 0.05em;
  }
`;
