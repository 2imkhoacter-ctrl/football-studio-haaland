const React = require('react');

const Hand4Fingers = ({ x = 0, y = 0, skin = '#ffcc80', stroke = '#111111', scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <rect x="-18" y="-16" width="36" height="32" rx="12" fill={skin} stroke={stroke} strokeWidth="4" />
    <line x1="-8" y1="-14" x2="-8" y2="14" stroke={stroke} strokeWidth="2.5" />
    <line x1="2" y1="-14" x2="2" y2="14" stroke={stroke} strokeWidth="2.5" />
    <line x1="11" y1="-12" x2="11" y2="12" stroke={stroke} strokeWidth="2" />
  </g>
);

const HaalandPose = () => (
  <svg width="600" height="980" viewBox="0 0 300 490" style={{ overflow: 'visible' }}>
    <path
      d="M85,155 L215,155 L235,285 L65,285 Z"
      fill="#6cabdd"
      stroke="#111111"
      strokeWidth="6"
      strokeLinejoin="round"
    />
    <path
      d="M80,285 L220,285 L210,365 L158,365 L150,325 L142,365 L90,365 Z"
      fill="#1e293b"
      stroke="#111111"
      strokeWidth="6"
    />
    <path d="M105,365 L92,465" stroke="#ffcc80" strokeWidth="24" strokeLinecap="round" />
    <path d="M105,365 L92,465" stroke="#111111" strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M192,365 L222,450" stroke="#ffcc80" strokeWidth="24" strokeLinecap="round" />
    <path d="M192,365 L222,450" stroke="#111111" strokeWidth="6" strokeLinecap="round" fill="none" />

    <path d="M75,175 L35,235" stroke="#ffcc80" strokeWidth="20" strokeLinecap="round" />
    <Hand4Fingers x={32} y={242} skin="#ffcc80" scale={0.95} />

    <path d="M215,175 L255,125" stroke="#ffcc80" strokeWidth="20" strokeLinecap="round" />
    <Hand4Fingers x={260} y={118} skin="#ffcc80" scale={1.1} />

    <circle cx="155" cy="95" r="54" fill="#ffcc80" stroke="#111111" strokeWidth="6" />
    <path
      d="M102,82 C105,32 205,30 210,80 C185,62 128,62 102,82 Z"
      fill="#facc15"
      stroke="#111111"
      strokeWidth="5"
    />
    <path d="M124,84 L148,92 M168,92 L192,84" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
    <ellipse cx="160" cy="118" rx="18" ry="22" fill="#7f1d1d" stroke="#111111" strokeWidth="5" />
    <rect x="146" y="100" width="28" height="8" rx="3" fill="#ffffff" />
  </svg>
);

const ViniPose = () => (
  <svg width="600" height="980" viewBox="0 0 300 490" style={{ overflow: 'visible' }}>
    <path
      d="M90,165 L210,165 L222,290 L78,290 Z"
      fill="#f8fafc"
      stroke="#111111"
      strokeWidth="6"
      strokeLinejoin="round"
    />
    <path
      d="M84,290 L216,290 L210,370 L88,370 Z"
      fill="#e2e8f0"
      stroke="#111111"
      strokeWidth="6"
    />
    <path d="M115,370 L110,468" stroke="#6d4c41" strokeWidth="22" strokeLinecap="round" />
    <path d="M185,370 L192,468" stroke="#6d4c41" strokeWidth="22" strokeLinecap="round" />

    <path d="M92,182 L118,142" stroke="#6d4c41" strokeWidth="18" strokeLinecap="round" />
    <path d="M208,182 L182,142" stroke="#6d4c41" strokeWidth="18" strokeLinecap="round" />

    <g transform="translate(150, 98) rotate(7)">
      <circle cx="0" cy="0" r="52" fill="#6d4c41" stroke="#111111" strokeWidth="6" />
      <path d="M-48,-16 C-45,-56 45,-56 48,-16 Z" fill="#18181b" stroke="#111111" strokeWidth="5" />
      <circle cx="-18" cy="-4" r="13" fill="#ffffff" stroke="#111111" strokeWidth="4" />
      <circle cx="-16" cy="-4" r="5" fill="#111111" />
      <circle cx="18" cy="-4" r="13" fill="#ffffff" stroke="#111111" strokeWidth="4" />
      <circle cx="20" cy="-4" r="5" fill="#111111" />
      <circle cx="2" cy="24" r="11" fill="#450a0a" stroke="#111111" strokeWidth="4" />
    </g>

    <Hand4Fingers x={122} y={136} skin="#6d4c41" scale={1.05} />
    <Hand4Fingers x={178} y={136} skin="#6d4c41" scale={1.05} />
  </svg>
);

module.exports = { HaalandPose, ViniPose };