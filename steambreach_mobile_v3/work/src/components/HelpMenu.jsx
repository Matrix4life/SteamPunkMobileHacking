import React, { useMemo, useState } from 'react';
import { COMMAND_REGISTRY } from '../constants/gameConstants';

const SECTION_ORDER = [
  'RECON & ACCESS',
  'WIFI HACKING',
  'PRIVILEGE ESCALATION',
  'BOTNET & C2',
  'PAYLOADS & MALWARE',
  'DATA & CRACKING',
  'ECONOMY & ITEMS',
  'RIVALS & ZERO-DAYS',
  'MORALITY',
  'STORY EVENTS',
  'SYSTEM & NAV',
];

const EXTRA_SECTIONS = {
  'RIVALS & ZERO-DAYS': [
    { cmd: 'rivals', desc: 'List known rival hackers and threat status' },
    { cmd: 'dossier <handle>', desc: 'Field mode dossier lookup' },
    { cmd: 'raid <handle>', desc: 'Field mode rival attack' },
    { cmd: 'taunt <handle>', desc: 'Field mode provocation; increases retaliation risk' },
    { cmd: 'dossier --handle <h>', desc: 'Operator mode dossier lookup' },
    { cmd: 'raid --target <h>', desc: 'Operator mode rival attack' },
    { cmd: 'taunt --target <h>', desc: 'Operator mode provocation' },
    { cmd: 'exploits', desc: 'Show collected zero-days and raid bonuses' },
  ],
  'WIFI HACKING': [
    { cmd: 'Arcade flow', desc: 'airmon-ng → airodump-ng → aireplay-ng → aircrack-ng → nmcli' },
    { cmd: 'Field flow', desc: 'airmon-ng start → airodump-ng scan/focus → aireplay-ng deauth → aircrack-ng crack → nmcli connect' },
    { cmd: 'Operator flow', desc: 'Use full syntax with wlan0mon, --bssid, --deauth, and explicit password args' },
  ],
};

export default function HelpMenu({ onClose, COLORS }) {
  const [openSections, setOpenSections] = useState({});

  const groupedSections = useMemo(() => {
    const grouped = {};
    COMMAND_REGISTRY.forEach(({ category, cmd, desc }) => {
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({ cmd, desc });
    });

    Object.entries(EXTRA_SECTIONS).forEach(([category, rows]) => {
      if (!grouped[category]) grouped[category] = [];
      grouped[category] = [...grouped[category], ...rows];
    });

    return grouped;
  }, []);

  const toggleSection = (category) => {
    setOpenSections(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', justifyContent:'flex-end', alignItems: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', padding: '20px 5% 20px 20px'}}>
      <div style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', background: COLORS.bg, border: `1px solid ${COLORS.primary}`, display: 'flex', flexDirection: 'column', boxShadow: `0 0 30px ${COLORS.primary}40` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: `1px solid ${COLORS.primary}80`, background: `${COLORS.primary}15` }}>
          <span style={{ color: COLORS.primary, fontWeight: 'bold', letterSpacing: '2px' }}>[ STEAMBREACH OPERATOR MANUAL ]</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.danger, cursor: 'pointer', fontWeight: 'bold' }}>[ X ] CLOSE</button>
        </div>

        <div style={{ padding: '16px 20px', overflowY: 'auto', color: COLORS.text, fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}>
          <div style={{ color: COLORS.textDim, marginBottom: '12px' }}>
            Sections start collapsed. Click <span style={{ color: COLORS.primary }}>[+]</span> to expand.
          </div>

          {SECTION_ORDER.map((category) => {
            const rows = groupedSections[category] || [];
            if (rows.length === 0) return null;

            const isOpen = !!openSections[category];
            return (
              <div key={category} style={{ marginBottom: '10px', border: `1px solid ${COLORS.border}`, background: COLORS.bgPanel }}>
                <button
                  onClick={() => toggleSection(category)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    color: COLORS.secondary,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <span>[ {category} ]</span>
                  <span style={{ color: COLORS.primary, fontWeight: 'bold' }}>{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: '10px 12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '10px' }}>
                      {rows.map((row, idx) => (
                        <React.Fragment key={`${category}_${row.cmd}_${idx}`}>
                          <span style={{ color: COLORS.primary }}>{row.cmd}</span>
                          <span>{row.desc}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
