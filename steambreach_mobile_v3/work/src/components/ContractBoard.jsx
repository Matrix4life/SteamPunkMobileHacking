import React, { useEffect, useState } from 'react';
import { COLORS } from '../constants/gameConstants';

const ContractBoard = ({ contracts, activeContract, acceptContract, returnToGame }) => {
  const [selectedId, setSelectedId] = useState(contracts.length > 0 ? contracts[0].id : null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 250);
    return () => clearTimeout(timer);
  }, []);

  const selected = contracts.find(c => c.id === selectedId);
  const canAccept = selected && !selected.completed && !selected.active && !activeContract;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        returnToGame();
        return;
      }
      if (contracts.length === 0) return;
      const currentIndex = contracts.findIndex(c => c.id === selectedId);

      if (e.key === 'ArrowDown') {
        const nextIndex = (currentIndex + 1) % contracts.length;
        setSelectedId(contracts[nextIndex].id);
      } else if (e.key === 'ArrowUp') {
        const prevIndex = (currentIndex - 1 + contracts.length) % contracts.length;
        setSelectedId(contracts[prevIndex].id);
      } else if (e.key === 'Enter' && canAccept && isReady) {
        acceptContract(selectedId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [contracts, selectedId, canAccept, returnToGame, acceptContract, isReady]);

  return (
    <div style={{
      background: COLORS.bg, color: COLORS.text,
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', monospace", zIndex: 20
    }}>
      <h2 style={{ color: COLORS.chat, letterSpacing: '2px', fontWeight: 'normal', fontSize: '16px' }}>
        ─── FIXER CONTRACTS ───
      </h2>
      <p style={{ color: COLORS.textDim, fontSize: '12px', marginBottom: '16px' }}>
        {activeContract ? `ACTIVE CONTRACT: ${activeContract.id}` : 'Use [UP] and [DOWN] arrows to navigate.'}
      </p>

      <div style={{ display: 'flex', gap: '16px', width: '720px', maxHeight: '420px' }}>
        <div style={{ flex: '1 1 55%', overflowY: 'auto', paddingRight: '4px' }}>
          {contracts.map(c => {
            const isSelected = selectedId === c.id;
            const isActive = c.active;
            let borderColor = COLORS.border;
            if (isSelected) borderColor = COLORS.primary;
            else if (isActive) borderColor = COLORS.chat;

            return (
              <div key={c.id} 
                onMouseEnter={() => setSelectedId(c.id)}
                onClick={() => setSelectedId(c.id)}
                style={{
                  border: `1px solid ${borderColor}`,
                  padding: '12px', marginBottom: '6px', borderRadius: '4px',
                  background: isSelected ? `${COLORS.primary}12` : (isActive ? `${COLORS.chat}10` : COLORS.bgPanel),
                  cursor: 'pointer',
                  opacity: c.completed ? 0.4 : 1,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: isActive ? COLORS.chat : COLORS.textDim, fontSize: '11px' }}>
                    {c.id} {isActive ? '● ACTIVE' : ''}
                  </span>
                  <span style={{ color: c.completed ? COLORS.secondary : COLORS.warning, fontSize: '11px' }}>
                    {c.completed ? '✓ COMPLETED' : `$${c.reward.toLocaleString()}`}
                  </span>
                </div>
                <div style={{ fontSize: '12px', lineHeight: '1.4' }}>{c.desc}</div>
              </div>
            );
          })}
          {contracts.length === 0 && (
            <div style={{ color: COLORS.textDim, textAlign: 'center', padding: '40px', fontSize: '12px' }}>
              No contracts available.<br />Scan more targets to attract fixers.
            </div>
          )}
        </div>

        <div style={{
          flex: '1 1 45%', border: `1px solid ${COLORS.border}`, borderRadius: '4px',
          background: COLORS.bgPanel, padding: '16px', display: 'flex', flexDirection: 'column',
          justifyContent: selected ? 'flex-start' : 'center', alignItems: selected ? 'stretch' : 'center',
        }}>
          {selected ? (
            <>
              <div style={{ color: COLORS.chat, fontSize: '11px', letterSpacing: '1px', marginBottom: '12px' }}>{selected.id}</div>
              <div style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>{selected.desc}</div>

              <div style={{ fontSize: '11px', color: COLORS.textDim, lineHeight: '2' }}>
                <div>TARGET: <span style={{ color: COLORS.ip }}>{selected.targetIP}</span></div>
                <div>ORG: <span style={{ color: COLORS.text }}>{selected.targetName}</span></div>
                <div>REWARD: <span style={{ color: COLORS.warning }}>${selected.reward.toLocaleString()}</span> + <span style={{ color: COLORS.secondary }}>{selected.repReward} REP</span></div>
                <div>TIME LIMIT: <span style={{ color: COLORS.text }}>{selected.timeLimit}s</span></div>
                <div>MAX HEAT: <span style={{ color: selected.heatCap <= 30 ? COLORS.danger : COLORS.warning }}>{selected.heatCap}%</span></div>
                <div>TYPE: <span style={{ color: COLORS.text }}>{selected.type?.toUpperCase() || 'UNKNOWN'}</span></div>
                {selected.forbidden_tools && selected.forbidden_tools.length > 0 && (
                  <div style={{ color: COLORS.danger, marginTop: '8px' }}>
                    RESTRICTED: {selected.forbidden_tools.join(', ')}
                  </div>
                )}
              </div>

              {selected.completed && (
                <div style={{ color: COLORS.secondary, marginTop: '16px', fontSize: '12px', letterSpacing: '1px' }}>
                  ✓ CONTRACT FULFILLED
                </div>
              )}
              {selected.active && !selected.completed && (
                <div style={{ color: COLORS.chat, marginTop: '16px', fontSize: '12px', letterSpacing: '1px' }}>
                  ● CONTRACT IN PROGRESS
                </div>
              )}

              {canAccept && (
                <button onClick={() => acceptContract(selected.id)} style={{
                  background: COLORS.secondary, color: COLORS.bgDark, border: 'none',
                  padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit',
                  borderRadius: '4px', fontSize: '13px', fontWeight: 'bold',
                  letterSpacing: '1px', marginTop: 'auto', width: '100%',
                  transition: 'opacity 0.15s',
                }}>
                  [ENTER] ACCEPT CONTRACT
                </button>
              )}
              {activeContract && !selected.active && !selected.completed && (
                <div style={{ color: COLORS.danger, marginTop: 'auto', fontSize: '11px', textAlign: 'center' }}>
                  Complete or abandon active contract first.
                </div>
              )}
            </>
          ) : (
            <div style={{ color: COLORS.textDim, fontSize: '12px', textAlign: 'center' }}>
              ← Select a contract to review
            </div>
          )}
        </div>
      </div>

      <button onClick={returnToGame} style={{
        background: 'transparent', color: COLORS.chat, border: `1px solid ${COLORS.chat}`,
        padding: '8px 24px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '16px',
        borderRadius: '4px', fontSize: '12px', letterSpacing: '1px'
      }}>
        [ESC] EXIT TO TERMINAL
      </button>
    </div>
  );
};

export default ContractBoard;
