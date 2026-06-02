/* ============================================================
   Map visual helpers: palette, org-type glyphs, state visuals.
   Exports to window: MAP_COLORS, OrgGlyph, stateVisual, tierRadius, TIER_LABEL
   ============================================================ */

const MAP_COLORS = {
  bg:        '#08080c',
  bgPanel:   '#0c0d13',
  chassis:   '#0e1016',
  text:      '#fcfcfa',
  textDim:   '#7c7a82',
  primary:   '#78dce8',  // cyan
  secondary: '#a9dc76',  // green
  danger:    '#ff6188',  // pink/red
  warning:   '#ffd866',  // yellow
  file:      '#fc9867',  // orange
  chat:      '#ab9df2',  // purple
  infected:  '#ab9df2',  // purple
  looted:    '#ffd866',
  proxy:     '#fc9867',
  territory: '#a9dc76',
  rival:     '#ff2255',
  quarantine:'#9aa6ff',
  border:    '#2d2a2e',
  borderHi:  '#4a4750',
};

const TIER_LABEL = { low: 'LOW', mid: 'MID', high: 'HIGH', elite: 'ELITE' };
const tierRadius = (tier) => ({ low: 17, mid: 21, high: 26, elite: 32 }[tier] || 18);

// rival status → color
const RIVAL_STATUS = {
  hostile:   { c: MAP_COLORS.rival,      label: 'HOSTILE' },
  neutral:   { c: MAP_COLORS.warning,    label: 'NEUTRAL' },
  allied:    { c: MAP_COLORS.secondary,  label: 'ALLIED' },
  destroyed: { c: MAP_COLORS.textDim,    label: 'DESTROYED' },
};

// state → visual treatment
function stateVisual(node) {
  const s = node.state || 'idle';
  switch (s) {
    case 'injecting': return { color: MAP_COLORS.warning,    label: 'INJECTING',   pulse: true,  ring: 'dash' };
    case 'infected':  return { color: MAP_COLORS.infected,   label: 'C2 ACTIVE',   pulse: true,  ring: 'solid' };
    case 'spreading': return { color: MAP_COLORS.primary,    label: 'SPREADING',   pulse: true,  ring: 'dash' };
    case 'detected':  return { color: MAP_COLORS.danger,     label: 'DETECTED',    pulse: true,  ring: 'pulse' };
    case 'quarantined':return{ color: MAP_COLORS.quarantine, label: 'QUARANTINED', pulse: false, ring: 'dash' };
    case 'dead':      return { color: MAP_COLORS.textDim,    label: 'DEAD',        pulse: false, ring: null };
    case 'looted':    return { color: MAP_COLORS.looted,     label: 'LOOTED',      pulse: false, ring: null };
    default:          return { color: null,                  label: null,          pulse: false, ring: null };
  }
}

// resolve the dominant color for a node (rival > state > owner > security)
function nodeColor(node) {
  if (node.rivalStatus) return (RIVAL_STATUS[node.rivalStatus] || RIVAL_STATUS.hostile).c;
  const sv = stateVisual(node);
  if (sv.color) return sv.color;
  if (node.owner === 'rival') return MAP_COLORS.rival;
  if (node.owner === 'player') return MAP_COLORS.territory;
  if (node.contract) return MAP_COLORS.warning;
  if (node.tier === 'high' || node.tier === 'elite') return MAP_COLORS.danger;
  return MAP_COLORS.primary;
}

/* Org-type line glyphs. Drawn in a -10..10 box, centered on 0,0.
   stroke=currentColor, non-scaling so they stay crisp at any zoom. */
function OrgGlyph({ type }) {
  const stroke = {
    strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke',
    fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (type) {
    case 'startup': // rocket
      return (
        <g {...stroke}>
          <path d="M0 -9 C 4 -4 4 3 0 7 C -4 3 -4 -4 0 -9 Z" />
          <circle cx="0" cy="-2" r="1.8" />
          <path d="M-3.5 3 L -6 7 L -3 6 M3.5 3 L 6 7 L 3 6" />
        </g>
      );
    case 'smallbiz': // storefront
      return (
        <g {...stroke}>
          <path d="M-8 -4 L 8 -4 L 6 -7 L -6 -7 Z" />
          <path d="M-7 -4 L -7 7 L 7 7 L 7 -4" />
          <path d="M-1.5 7 L -1.5 1 L 3.5 1 L 3.5 7" />
        </g>
      );
    case 'personal': // laptop
      return (
        <g {...stroke}>
          <rect x="-7" y="-7" width="14" height="9" rx="1" />
          <path d="M-9 5 L 9 5 L 7.5 2 L -7.5 2 Z" />
        </g>
      );
    case 'corporation': // office tower
      return (
        <g {...stroke}>
          <rect x="-6" y="-9" width="12" height="18" rx="0.5" />
          <path d="M-3 -6 H -1 M2 -6 H 4 M-3 -2 H -1 M2 -2 H 4 M-3 2 H -1 M2 2 H 4" />
        </g>
      );
    case 'government': // capitol
      return (
        <g {...stroke}>
          <path d="M0 -9 L 8 -3 L -8 -3 Z" />
          <path d="M-6 -3 V 6 M-2 -3 V 6 M2 -3 V 6 M6 -3 V 6" />
          <path d="M-8 6 L 8 6 L 8 8 L -8 8 Z" />
        </g>
      );
    case 'military': // shield + chevron
      return (
        <g {...stroke}>
          <path d="M0 -9 L 7 -6 V 1 C 7 6 3 8 0 9 C -3 8 -7 6 -7 1 V -6 Z" />
          <path d="M-3.5 -1 L 0 2.5 L 3.5 -1" />
        </g>
      );
    case 'financial': // bank
      return (
        <g {...stroke}>
          <path d="M0 -8 L 8 -3 L -8 -3 Z" />
          <path d="M-5 -3 V 5 M0 -3 V 5 M5 -3 V 5" />
          <path d="M-8 5 L 8 5 L 8 8 L -8 8 Z" />
        </g>
      );
    case 'classified': // eye / surveillance
      return (
        <g {...stroke}>
          <path d="M-9 0 C -5 -6 5 -6 9 0 C 5 6 -5 6 -9 0 Z" />
          <circle cx="0" cy="0" r="2.6" />
        </g>
      );
    case 'criminal': // skull
      return (
        <g {...stroke}>
          <path d="M0 -8 C 5.5 -8 8 -4.5 8 -1 C 8 2 6.5 3.5 6.5 5 L 6.5 7 4 7 4 5.4 2 5.4 2 7 -2 7 -2 5.4 -4 5.4 -4 7 -6.5 7 -6.5 5 C -6.5 3.5 -8 2 -8 -1 C -8 -4.5 -5.5 -8 0 -8 Z" />
          <circle cx="-3.2" cy="-1.5" r="1.9" fill="currentColor" stroke="none" />
          <circle cx="3.2" cy="-1.5" r="1.9" fill="currentColor" stroke="none" />
          <path d="M0 1 L -1 3 L 1 3 Z" fill="currentColor" stroke="none" />
        </g>
      );
    default:
      return (
        <g {...stroke}>
          <rect x="-6" y="-6" width="12" height="12" rx="2" />
          <circle cx="0" cy="0" r="2" />
        </g>
      );
  }
}

Object.assign(window, { MAP_COLORS, RIVAL_STATUS, OrgGlyph, stateVisual, nodeColor, tierRadius, TIER_LABEL });
