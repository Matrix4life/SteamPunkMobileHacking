import React, { useEffect, useState } from 'react';
import { COLORS } from '../constants/gameConstants';

const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768;

// Added declineContract to the props here!
const ContractBoard = ({ contracts, activeContract, acceptContract, declineContract, returnToGame }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const mobile = isMobile();

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 250);
    return () => clearTimeout(timer);
  }, []);

  // Auto-select first contract on desktop
  useEffect(() => {
    if (!mobile && contracts.length > 0 && !selectedId) setSelectedId(contracts[0].id);
  }, [contracts, mobile, selectedId]);

  const selected = contracts.find(c => c.id === selectedId);
  const canAccept = selected && !selected.completed && !selected.active && !activeContract;

  // Keyboard navigation (desktop only)
  useEffect(() => {
    if (mobile) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { returnToGame(); return; }
      if (contracts.length === 0) return;
      const currentIndex = contracts.findIndex(c => c.id === selectedId);
      if (e.key === 'ArrowDown') setSelectedId(contracts[(currentIndex + 1) % contracts.length].id);
      else if (e.key === 'ArrowUp') setSelectedId(contracts[(currentIndex - 1 + contracts.length) % contracts.length].id);
      else if (e.key === 'Enter' && canAccept && isReady) acceptContract(selectedId);
      // Added DEL/Backspace hotkey for archiving/abandoning
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !selected.active) {
        declineContract(selectedId);
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [contracts, selectedId, canAccept, returnToGame, acceptContract, declineContract, isReady, mobile, selected]);

  const btnStyle = {
    background: 'transparent', border: `1px solid ${COLORS.chat}`,
    color: COLORS.chat, padding: mobile ? '14px 24px' : '8px 24px',
    cursor: 'pointer', fontFamily: 'inherit', borderRadius: '4px',
    fontSize: mobile ? '14px' : '12px', letterSpacing: '1px', width: mobile ? '100%' : 'auto',
  };

  const getProbColor = (prob) => {
    if (!prob) return COLORS.textDim;
    if (prob >= 75) return COLORS.secondary; // Green - Easy
    if (prob >= 50) return COLORS.warning;   // Yellow - Med
    if (prob >= 10) return '#ff9900';        // Orange - Hard
    return COLORS.danger;                    // Red - Insane
  };

  const renderChecklist = (contract) => {
    // Fallback to single objective if multi-node 'objectives' array isn't generated yet
    const objs = contract.objectives || [{
      ip: contract.targetIP,
      name: contract.targetName,
      type: contract.type,
      targetFile: contract.targetFile
    }];

    return objs.map((obj, i) => {
      let actionText = '';
      if (obj.type === 'exfil') actionText = `EXFIL '${obj.targetFile}'`;
      else if (obj.type === 'destroy') actionText = `DESTROY (shred) server`;
      else if (obj.type === 'ransom') actionText = `RANSOM (openssl) server`;

      return (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start', fontSize: '12px' }}>
          <span style={{ color: (obj.completed || contract.completed) ? COLORS.secondary : COLORS.textDim }}>
            [{(obj.completed || contract.completed) ? '✓' : ' '}]
          </span>
          <span style={{ lineHeight: '1.4' }}>
            <span style={{ color: COLORS.primary, fontWeight: 'bold' }}>{actionText}</span>
            <span style={{ color: COLORS.textDim }}> at </span>
            <span style={{ color: COLORS.ip }}>{obj.ip}</span>
            <span style={{ color: COLORS.textDim }}> ({obj.name})</span>
          </span>
        </div>
      );
    });
  };

  // ─── MOBILE: Detail view when a contract is selected ───
  if (mobile && selected) {
    return (
      <div style={{
        background: COLORS.bg, color: COLORS.text,
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', monospace", zIndex: 20,
        padding: '16px', overflow: 'auto',
      }}>
        <div style={{ color: COLORS.chat, fontSize: '12px', letterSpacing: '1.5px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{selected.id} {selected.active ? '● ACTIVE' : ''}{selected.completed ? '✓ DONE' : ''}</span>
          <span style={{ color: getProbColor(selected.probability), fontWeight: 'bold' }}>
            {selected.probability ? `${selected.probability}% SUCCESS PROBABILITY` : 'PROBABILITY: CALC...'}
          </span>
        </div>

        <div style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', color: COLORS.text }}>
          {selected.desc}
        </div>

        <div style={{ fontSize: '13px', color: COLORS.textDim, lineHeight: '2.2', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '12px', marginBottom: '12px' }}>
          <div>REWARD: <span style={{ color: COLORS.warning }}>₿{selected.reward?.toLocaleString()}</span> + <span style={{ color: COLORS.secondary }}>{selected.repReward} REP</span></div>
          <div>TIME LIMIT: <span style={{ color: COLORS.text }}>{selected.timeLimit}s</span></div>
          <div>MAX HEAT: <span style={{ color: selected.heatCap <= 35 ? COLORS.danger : COLORS.warning }}>{selected.heatCap}%</span></div>
          {selected.forbidden_tools?.length > 0 && (
            <div style={{ color: COLORS.danger }}>RESTRICTED: {selected.forbidden_tools.join(', ')}</div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ color: COLORS.textDim, fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>OBJECTIVES CHECKLIST</div>
          {renderChecklist(selected)}
        </div>

        <div style={{ flex: 1 }} />

        {selected.completed && (
          <div style={{ color: COLORS.secondary, fontSize: '14px', letterSpacing: '1px', textAlign: 'center', marginBottom: '12px' }}>✓ CONTRACT FULFILLED</div>
        )}
        {selected.active && !selected.completed && (
          <div style={{ color: COLORS.chat, fontSize: '14px', letterSpacing: '1px', textAlign: 'center', marginBottom: '12px' }}>● CONTRACT IN PROGRESS</div>
        )}

        {canAccept && (
          <button onClick={() => acceptContract(selected.id)} style={{
            background: COLORS.secondary, color: COLORS.bgDark, border: 'none',
            padding: '14px', cursor: 'pointer', fontFamily: 'inherit',
            borderRadius: '5px', fontSize: '15px', fontWeight: 'bold',
            letterSpacing: '1px', width: '100%', marginBottom: '10px',
            WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
          }}>
            ACCEPT CONTRACT
          </button>
        )}

        {/* MOBILE ARCHIVE/ABANDON BUTTON IS RIGHT HERE */}
        {!selected.active && (
          <button onClick={() => { declineContract(selected.id); setSelectedId(null); }} style={{
            background: 'transparent', 
            color: selected.completed ? COLORS.textDim : COLORS.danger, 
            border: `1px solid ${selected.completed ? COLORS.textDim : COLORS.danger}`,
            padding: '14px', cursor: 'pointer', fontFamily: 'inherit',
            borderRadius: '5px', fontSize: '15px', fontWeight: 'bold',
            letterSpacing: '1px', width: '100%', marginBottom: '10px',
            WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
          }}>
            {selected.completed ? 'ARCHIVE' : 'ABANDON'} CONTRACT
          </button>
        )}

        {activeContract && !selected.active && !selected.completed && (
          <div style={{ color: COLORS.danger, fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>
            Complete or abandon active contract first.
          </div>
        )}

        <button onClick={() => setSelectedId(null)} style={{ ...btnStyle, marginBottom: '8px' }}>← BACK TO LIST</button>
        <button onClick={returnToGame} style={btnStyle}>EXIT TO TERMINAL</button>
      </div>
    );
  }

  // ─── MOBILE: Contract list view ───
  if (mobile) {
    return (
      <div style={{
        background: COLORS.bg, color: COLORS.text,
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', monospace", zIndex: 20,
        padding: '16px',
      }}>
        <h2 style={{ color: COLORS.chat, letterSpacing: '2px', fontWeight: 'normal', fontSize: '16px', textAlign: 'center', marginBottom: '4px' }}>
          FIXER CONTRACTS
        </h2>
        <p style={{ color: COLORS.textDim, fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>
          {activeContract ? `ACTIVE: ${activeContract.id}` : 'Tap a contract to review'}
        </p>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {contracts.length === 0 && (
            <div style={{ color: COLORS.textDim, textAlign: 'center', padding: '40px', fontSize: '13px' }}>
              No contracts available.<br />Scan more targets to attract fixers.
            </div>
          )}
          {contracts.map(c => {
            const isActive = c.active;
            let borderColor = COLORS.border;
            if (isActive) borderColor = COLORS.chat;

            return (
              <div key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{
                  border: `1px solid ${borderColor}`,
                  padding: '14px', marginBottom: '8px', borderRadius: '5px',
                  background: isActive ? `${COLORS.chat}10` : COLORS.bgPanel,
                  cursor: 'pointer', opacity: c.completed ? 0.4 : 1,
                  WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: isActive ? COLORS.chat : COLORS.textDim, fontSize: '11px' }}>
                    {c.id} {isActive ? '● ACTIVE' : ''}
                  </span>
                  <span style={{ color: c.completed ? COLORS.secondary : COLORS.warning, fontSize: '13px', fontWeight: 'bold' }}>
                    {c.completed ? '✓ DONE' : `₿${c.reward?.toLocaleString()}`}
                  </span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.5' }}>{c.desc}</div>
                <div style={{ fontSize: '11px', color: COLORS.textDim, marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{c.objectives ? `${c.objectives.length} TARGETS` : c.targetName} • {c.timeLimit}s</span>
                  <span style={{ color: getProbColor(c.probability), fontWeight: 'bold' }}>{c.probability ? `${c.probability}% PROB` : ''}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={returnToGame} style={{ ...btnStyle, marginTop: '12px' }}>EXIT TO TERMINAL</button>
      </div>
    );
  }

  // ─── DESKTOP: Original two-column layout ───
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

      <div style={{ display: 'flex', gap: '16px', width: '800px', maxHeight: '460px' }}>
        <div style={{ flex: '1 1 50%', overflowY: 'auto', paddingRight: '8px' }}>
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
                  cursor: 'pointer', opacity: c.completed ? 0.4 : 1,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: isActive ? COLORS.chat : COLORS.textDim, fontSize: '11px' }}>
                    {c.id} {isActive ? '● ACTIVE' : ''}
                  </span>
                  <span style={{ color: c.completed ? COLORS.secondary : COLORS.warning, fontSize: '11px', fontWeight: 'bold' }}>
                    {c.completed ? '✓ COMPLETED' : `₿${c.reward?.toLocaleString()}`}
                  </span>
                </div>
                <div style={{ fontSize: '12px', lineHeight: '1.4' }}>{c.desc}</div>
                <div style={{ fontSize: '10px', color: COLORS.textDim, marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{c.objectives ? `${c.objectives.length} TARGETS` : c.targetName} • {c.timeLimit}s</span>
                  <span style={{ color: getProbColor(c.probability), fontWeight: 'bold' }}>{c.probability ? `${c.probability}% PROB` : ''}</span>
                </div>
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
          flex: '1 1 50%', border: `1px solid ${COLORS.border}`, borderRadius: '4px',
          background: COLORS.bgPanel, padding: '20px', display: 'flex', flexDirection: 'column',
          justifyContent: selected ? 'flex-start' : 'center', alignItems: selected ? 'stretch' : 'center',
          overflowY: 'auto'
        }}>
          {selected ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: COLORS.chat, fontSize: '11px', letterSpacing: '1px' }}>{selected.id}</span>
                <span style={{ color: getProbColor(selected.probability), fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>
                  {selected.probability ? `${selected.probability}% SUCCESS PROBABILITY` : 'PROBABILITY: CALC...'}
                </span>
              </div>
              
              <div style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>{selected.desc}</div>
              
              <div style={{ fontSize: '11px', color: COLORS.textDim, lineHeight: '2', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '12px', marginBottom: '12px' }}>
                <div>REWARD: <span style={{ color: COLORS.warning }}>₿{selected.reward?.toLocaleString()}</span> + <span style={{ color: COLORS.secondary }}>{selected.repReward} REP</span></div>
                <div>TIME LIMIT: <span style={{ color: COLORS.text }}>{selected.timeLimit}s</span></div>
                <div>MAX HEAT: <span style={{ color: selected.heatCap <= 35 ? COLORS.danger : COLORS.warning }}>{selected.heatCap}%</span></div>
                {selected.forbidden_tools?.length > 0 && (
                  <div style={{ color: COLORS.danger, marginTop: '4px' }}>RESTRICTED: {selected.forbidden_tools.join(', ')}</div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ color: COLORS.textDim, fontSize: '10px', letterSpacing: '2px', marginBottom: '8px' }}>OBJECTIVES CHECKLIST</div>
                {renderChecklist(selected)}
              </div>

              {selected.completed && <div style={{ color: COLORS.secondary, marginTop: '16px', fontSize: '12px', letterSpacing: '1px', textAlign: 'center' }}>✓ CONTRACT FULFILLED</div>}
              {selected.active && !selected.completed && <div style={{ color: COLORS.chat, marginTop: '16px', fontSize: '12px', letterSpacing: '1px', textAlign: 'center' }}>● CONTRACT IN PROGRESS</div>}
              
              {canAccept && (
                <button onClick={() => acceptContract(selected.id)} style={{
                  background: COLORS.secondary, color: COLORS.bgDark, border: 'none',
                  padding: '12px 20px', cursor: 'pointer', fontFamily: 'inherit',
                  borderRadius: '4px', fontSize: '13px', fontWeight: 'bold',
                  letterSpacing: '1px', marginTop: '16px', width: '100%',
                }}>
                  [ENTER] ACCEPT CONTRACT
                </button>
              )}

              {/* DESKTOP ARCHIVE/ABANDON BUTTON IS RIGHT HERE */}
              {!selected.active && (
                <button onClick={() => { declineContract(selected.id); setSelectedId(null); }} style={{
                  background: 'transparent', 
                  color: selected.completed ? COLORS.textDim : COLORS.danger, 
                  border: `1px solid ${selected.completed ? COLORS.textDim : COLORS.danger}`,
                  padding: '12px 20px', cursor: 'pointer', fontFamily: 'inherit',
                  borderRadius: '4px', fontSize: '13px', fontWeight: 'bold',
                  letterSpacing: '1px', marginTop: canAccept ? '8px' : '16px', width: '100%',
                }}>
                  [DEL] {selected.completed ? 'ARCHIVE' : 'ABANDON'} CONTRACT
                </button>
              )}

              {activeContract && !selected.active && !selected.completed && (
                <div style={{ color: COLORS.danger, marginTop: '16px', fontSize: '11px', textAlign: 'center' }}>Complete or abandon active contract first.</div>
              )}
            </>
          ) : (
            <div style={{ color: COLORS.textDim, fontSize: '12px', textAlign: 'center' }}>← Select a contract to review</div>
          )}
        </div>
      </div>

      <button onClick={returnToGame} style={{ ...btnStyle, marginTop: '16px' }}>[ESC] EXIT TO TERMINAL</button>
    </div>
  );
};

export default ContractBoard;
