// ═══════════════════════════════════════════════════════════════════════════
// WARDRIVE COMMAND IMPLEMENTATION
// Add this to the commands object in STEAMBREACH.jsx
// ═══════════════════════════════════════════════════════════════════════════

// Import at top of STEAMBREACH.jsx:
// import { 
//   syncWifiWithWorld, 
//   generateWardriveDiscovery, 
//   calculateWardriveSpeed,
//   generateAmbientNetworks,
//   WARDRIVE_CONFIG 
// } from './wifi/wifiGeneration';

// Add to state declarations:
// const [wifiNetworks, setWifiNetworks] = useState([]);
// const [isWardriving, setIsWardriving] = useState(false);
// const [wardriveInterval, setWardriveInterval] = useState(null);

// ───────────────────────────────────────────────────────────────────────────
// WARDRIVE COMMAND
// ───────────────────────────────────────────────────────────────────────────

const wardriveCommand = {
  wardrive: async () => {
    // Check prerequisites
    if (!wifiState.mon) {
      return `[-] Monitor mode not enabled.\n[*] Run 'airmon-ng start' first to enable passive scanning.`;
    }
    
    // Check if already wardriving
    if (isWardriving) {
      // Stop wardriving
      if (wardriveInterval) {
        clearInterval(wardriveInterval);
        setWardriveInterval(null);
      }
      setIsWardriving(false);
      playBlip();
      
      const discovered = wifiNetworks.filter(n => n.discovered).length;
      const targets = wifiNetworks.filter(n => n.discovered && n.target).length;
      
      return `[!] WARDRIVE SESSION ENDED
      
╔════════════════════════════════════════════╗
║           SESSION STATISTICS               ║
╠════════════════════════════════════════════╣
║  Networks Discovered: ${String(discovered).padEnd(18)}║
║  High-Value Targets:  ${String(targets).padEnd(18)}║
║  Heat Generated:      +${String((discovered * WARDRIVE_CONFIG.heatPerNetwork).toFixed(1) + '%').padEnd(17)}║
╚════════════════════════════════════════════╝

[*] View networks: Open map → 📶 WIFI button
[*] Scan specific target: airodump-ng --bssid <BSSID>`;
    }
    
    // ═══ START WARDRIVING ═══
    
    // Check for vehicle/antenna upgrades
    const hasVan = inventory.includes('wardrive_van');
    const hasDrone = inventory.includes('wardrive_drone');
    const hasYagi = inventory.includes('yagi_antenna');
    const hasParabolic = inventory.includes('parabolic_antenna');
    
    const vehicle = hasDrone ? 'drone' : (hasVan ? 'van' : 'car');
    const antenna = hasParabolic ? 'parabolic' : (hasYagi ? 'yagi' : 'stock');
    const discoveryRate = calculateWardriveSpeed(vehicle, antenna);
    
    setIsWardriving(true);
    setHeat(h => Math.min(h + 2, 100)); // Initial heat
    playBeacon();
    
    // Initial ambient networks for region
    if (wifiNetworks.length === 0) {
      const initial = generateAmbientNetworks(currentRegion, 6, director.modifiers);
      initial.forEach(n => n.discovered = true);
      setWifiNetworks(initial);
    }
    
    // Set up discovery interval
    const interval = setInterval(() => {
      // Check max networks
      if (wifiNetworks.filter(n => n.discovered).length >= WARDRIVE_CONFIG.maxNetworksPerRun) {
        clearInterval(interval);
        setWardriveInterval(null);
        setIsWardriving(false);
        setTerminal(prev => [...prev, { 
          type: 'out', 
          text: `[!] WARDRIVE AUTO-STOPPED — Maximum networks reached (${WARDRIVE_CONFIG.maxNetworksPerRun})`, 
          isNew: true 
        }]);
        playBlip();
        return;
      }
      
      // Detection check
      const detectionChance = WARDRIVE_CONFIG.detectionChance[currentRegion] || 0.1;
      if (Math.random() < detectionChance * (heat / 100)) {
        // Detected!
        setHeat(h => Math.min(h + 5, 100));
        setTerminal(prev => [...prev, { 
          type: 'out', 
          text: `[!] WARNING: Mobile scanning detected! Blue Team alerted. Heat +5%`, 
          isNew: true 
        }]);
        playHeatSpike();
      }
      
      // Discover new network
      const newNet = generateWardriveDiscovery(currentRegion, wifiNetworks, director.modifiers);
      
      if (newNet.isUpdate) {
        // Update existing network signal
        setWifiNetworks(prev => prev.map(n => 
          n.bssid === newNet.bssid ? { ...n, signal: newNet.signal } : n
        ));
        setTerminal(prev => [...prev, { 
          type: 'out', 
          text: `[*] Signal update: ${newNet.essid} now at ${newNet.signal}dBm`, 
          isNew: true 
        }]);
      } else {
        // Check if already discovered
        const exists = wifiNetworks.some(n => n.essid === newNet.essid);
        if (!exists) {
          setWifiNetworks(prev => [...prev, newNet]);
          setHeat(h => Math.min(h + WARDRIVE_CONFIG.heatPerNetwork, 100));
          
          const targetBadge = newNet.target ? ' [HIGH VALUE]' : '';
          const encColor = newNet.enc === 'OPEN' ? 'secondary' : (newNet.enc === 'WEP' ? 'warning' : 'danger');
          
          setTerminal(prev => [...prev, { 
            type: 'out', 
            text: `[+] NEW: ${newNet.essid}${targetBadge}\n    BSSID: ${newNet.bssid} | Ch${newNet.channel} | ${newNet.signal}dBm | ${newNet.enc}`, 
            isNew: true 
          }]);
          
          if (newNet.target) {
            playSuccess();
          } else {
            playBlip();
          }
        }
      }
    }, discoveryRate);
    
    setWardriveInterval(interval);
    
    return `
╔═══════════════════════════════════════════════════════════════╗
║                    WARDRIVE MODE ACTIVATED                     ║
╠═══════════════════════════════════════════════════════════════╣
║  Vehicle:    ${vehicle.toUpperCase().padEnd(45)}║
║  Antenna:    ${antenna.toUpperCase().padEnd(45)}║
║  Scan Rate:  ${(discoveryRate / 1000).toFixed(1)}s per network${' '.repeat(33)}║
║  Region:     ${currentRegion.toUpperCase().padEnd(45)}║
╠═══════════════════════════════════════════════════════════════╣
║  [!] Passively scanning for wireless networks...              ║
║  [*] New targets will appear in real-time                     ║
║  [*] Type 'wardrive' again to stop                            ║
╚═══════════════════════════════════════════════════════════════╝`;
  },
};

// ───────────────────────────────────────────────────────────────────────────
// UPDATED AIRODUMP-NG TO USE DYNAMIC NETWORKS
// ───────────────────────────────────────────────────────────────────────────

const updatedAirodumpCommand = {
  'airodump-ng': async () => {
    if (!wifiState.mon) {
      return `[-] Wireless interface not in monitor mode.\n[*] Run 'airmon-ng start' first.`;
    }
    
    // Sync WiFi networks with world state if empty
    if (wifiNetworks.length === 0) {
      const synced = syncWifiWithWorld(world, currentRegion, [], director.modifiers);
      synced.forEach(n => n.discovered = true);
      setWifiNetworks(synced);
    }
    
    // Build network table
    const header = `
  CH  ${wifiNetworks.length > 0 ? wifiNetworks.length : 0} ][ Elapsed: ${Math.floor(Math.random() * 30) + 5}s ][ ${new Date().toLocaleTimeString()}
  
  BSSID              PWR  Beacons  #Data   #/s  CH   ENC    ESSID`;
    
    const networkRows = wifiNetworks
      .filter(n => n.discovered)
      .sort((a, b) => b.signal - a.signal)
      .map(n => {
        const beacons = Math.floor(Math.random() * 3000) + 500;
        const data = Math.floor(Math.random() * 5000) + 100;
        const rate = Math.floor(Math.random() * 40) + 5;
        const targetBadge = n.target ? ' ★' : '';
        return `  ${n.bssid}  ${String(n.signal).padStart(3)}     ${String(beacons).padStart(4)}    ${String(data).padStart(4)}    ${String(rate).padStart(2)}   ${String(n.channel).padStart(2)}   ${n.enc.padEnd(6)} ${n.essid}${targetBadge}`;
      })
      .join('\n');
    
    const targetCount = wifiNetworks.filter(n => n.discovered && n.target).length;
    const footer = `
  
  [+] Found ${wifiNetworks.filter(n => n.discovered).length} networks in range
  [!] HIGH VALUE TARGETS: ${targetCount} (marked with ★)
  [*] Focus on target: airodump-ng --bssid <BSSID> -c <CH> -w capture wlan0mon`;
    
    playSuccess();
    return header + '\n' + networkRows + footer;
  },
};

// ───────────────────────────────────────────────────────────────────────────
// REGION CHANGE HOOK - REGENERATE WIFI ON TRAVEL
// ───────────────────────────────────────────────────────────────────────────

// Add to the 'travel' command after region changes:
// setWifiNetworks([]); // Clear networks on region change
// setWifiState({ mon: false, scanned: false, focused: false, capFile: false, hshake: false, cracked: false, pwd: null, connected: false, targetBssid: null });

// ───────────────────────────────────────────────────────────────────────────
// SHOP ITEMS FOR WARDRIVING
// ───────────────────────────────────────────────────────────────────────────

const WARDRIVE_SHOP_ITEMS = [
  {
    id: 'wardrive_van',
    name: 'Surveillance Van',
    desc: 'Modified van with antenna mounts. 20% faster wardrive scans.',
    price: 75000,
    rep: 50,
    category: 'hardware',
  },
  {
    id: 'wardrive_drone',
    name: 'Recon Drone',
    desc: 'Aerial platform for WiFi scanning. 50% faster, harder to detect.',
    price: 150000,
    rep: 100,
    category: 'hardware',
  },
  {
    id: 'yagi_antenna',
    name: 'Yagi Directional Antenna',
    desc: 'High-gain directional antenna. 30% faster wardrive scans.',
    price: 25000,
    rep: 25,
    category: 'hardware',
  },
  {
    id: 'parabolic_antenna',
    name: 'Parabolic Dish Antenna',
    desc: 'Maximum range antenna. 50% faster wardrive scans.',
    price: 50000,
    rep: 75,
    category: 'hardware',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// HELP MENU ADDITIONS
// ───────────────────────────────────────────────────────────────────────────

const WARDRIVE_HELP = {
  arcade: [
    { cmd: 'wardrive', desc: 'Start/stop passive WiFi scanning while driving' },
  ],
  field: [
    { cmd: 'wardrive', desc: 'Toggle mobile WiFi reconnaissance' },
    { cmd: 'wardrive stop', desc: 'End wardrive session' },
  ],
  operator: [
    { cmd: 'wardrive', desc: 'Mobile passive scanning (requires monitor mode)' },
    { cmd: 'wardrive --stealth', desc: 'Reduced scan rate, lower detection chance' },
  ],
};

export { 
  wardriveCommand, 
  updatedAirodumpCommand, 
  WARDRIVE_SHOP_ITEMS,
  WARDRIVE_HELP 
};
