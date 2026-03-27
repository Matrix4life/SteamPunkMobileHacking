import React, { useEffect } from 'react';
import { COLORS } from '../constants/gameConstants';

const DarknetShop = ({ money, reputation, inventory, handleBuy, returnToGame }) => {
  const shopItems = [
    { id: 'Crypter', name: 'FUD Crypter', cost: 10000, desc: 'SOFTWARE: Evades low-sec AV detection', repReq: 0 },
    { id: 'Scanner', name: 'NSE Scripts', cost: 25000, desc: 'SOFTWARE: View SEC levels on map hover', repReq: 0 },
    { id: 'Overclock', name: 'Proxychains', cost: 50000, desc: 'SOFTWARE: Proxy chain: 2 → 3 hops', repReq: 50 },
    { id: 'Wireshark', name: 'Deep Packet Inspector', cost: 35000, desc: 'SOFTWARE: Enables ettercap ARP poisoning', repReq: 25 },
    { id: 'TorRelay', name: 'TOR Relay Network', cost: 120000, desc: 'SOFTWARE: Proxy chain: 3 → 4 hops', repReq: 150 },
    { id: 'ClearLogs', name: 'Bribe SOC Insider', cost: 5000, desc: 'SERVICE: Reduces HEAT by 50%', repReq: 0 },
    { id: 'ATXCase', name: 'Tempered Glass Chassis', cost: 25000, desc: 'HARDWARE: Sleek black case with glass panel', repReq: 0 },
    { id: 'NetCard', name: 'Fiber-Optic Backbone', cost: 40000, desc: 'HARDWARE: nmap discovers 2 nodes at a time', repReq: 20 },
    { id: 'Cooling', name: 'Liquid Immersion Cooling', cost: 65000, desc: 'HARDWARE: xmrig generates 50% less Heat', repReq: 30 },
    { id: 'CPU', name: 'Quantum Thread Ripper', cost: 85000, desc: 'HARDWARE: hashcat cracks passwords 50% faster', repReq: 50 },
    { id: 'GPU', name: 'Neural Net Accelerator', cost: 150000, desc: 'HARDWARE: hashcat cracks passwords instantly', repReq: 100 },
    { id: 'RGB', name: 'ARGB Controller', cost: 15000, desc: 'AESTHETICS: 16.8 million colors for max FPS', repReq: 10 },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { returnToGame(); return; }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [returnToGame]);

  return (
    <div style={{
      background: COLORS.bg, color: COLORS.text,
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', monospace", zIndex: 20
    }}>
      <h2 style={{ color: COLORS.warning, letterSpacing: '2px', fontWeight: 'normal', fontSize: '16px' }}>
        ─── 0xMARKETPLACE ───
      </h2>
      <p style={{ color: COLORS.textDim, fontSize: '12px' }}>
        WALLET: <span style={{ color: COLORS.warning }}>${money.toLocaleString()}</span> │ REP: {reputation}
      </p>
      <div style={{ width: '600px', margin: '16px 0', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px', scrollbarWidth: 'thin', scrollbarColor: `${COLORS.border} transparent` }}>
        {shopItems.map((item, index) => {
          const owned = item.id !== 'ClearLogs' && inventory.includes(item.id);
          const isHardware = item.desc.startsWith('HARDWARE') || item.desc.startsWith('AESTHETICS');
          const isLocked = !owned && reputation < item.repReq;
          
          return (
            <div key={item.id} style={{
              border: `1px solid ${owned ? COLORS.secondary + '40' : COLORS.border}`,
              padding: '12px', marginBottom: '6px', borderRadius: '4px',
              background: owned ? `${COLORS.secondary}08` : COLORS.bgPanel,
              cursor: owned || isLocked ? 'default' : 'pointer', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', opacity: isLocked ? 0.5 : 1
            }} onClick={() => { if(!isLocked && !owned) handleBuy(item.id, item.cost); }}>
              <div>
                <span style={{ color: owned ? COLORS.secondary : (isHardware ? COLORS.ip : COLORS.text) }}>
                  <span style={{color: COLORS.primaryDim}}>[{index + 1}] </span>
                  {owned ? '✓ ' : ''}{item.name}
                </span>
                <div style={{ color: COLORS.textDim, fontSize: '11px', marginTop: '2px' }}>{item.desc}</div>
              </div>
              
              {isLocked ? (
                 <span style={{ color: COLORS.danger, fontSize: '11px', fontWeight: 'bold' }}>[LOCKED: {item.repReq} REP]</span>
              ) : (
                 !owned && <span style={{ color: COLORS.warning, fontSize: '12px' }}>${item.cost.toLocaleString()}</span>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={returnToGame} style={{
        background: 'transparent', color: COLORS.warning, border: `1px solid ${COLORS.warning}`,
        padding: '8px 24px', cursor: 'pointer', fontFamily: 'inherit',
        borderRadius: '4px', fontSize: '12px', letterSpacing: '1px'
      }}>
        [ESC] EXIT TO TERMINAL
      </button>
    </div>
  );
};

// ==========================================
// 9. MAIN GAME ENGINE

export default DarknetShop;
