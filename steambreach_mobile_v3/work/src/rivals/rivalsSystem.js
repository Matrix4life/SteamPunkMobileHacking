// ============================================================================
// HEXOVERRIDE: RIVALS & ZERO-DAY COLLECTIBLES SYSTEM
// ============================================================================

export const RARITY_TIERS = {
  COMMON:    { name: 'Common',    color: '#9CA3AF', dropRate: 0.40, multiplier: 1.0 },
  UNCOMMON:  { name: 'Uncommon',  color: '#22C55E', dropRate: 0.25, multiplier: 1.5 },
  RARE:      { name: 'Rare',      color: '#3B82F6', dropRate: 0.18, multiplier: 2.0 },
  EPIC:      { name: 'Epic',      color: '#A855F7', dropRate: 0.10, multiplier: 3.0 },
  LEGENDARY: { name: 'Legendary', color: '#F59E0B', dropRate: 0.05, multiplier: 5.0 },
  MYTHIC:    { name: 'Mythic',    color: '#EF4444', dropRate: 0.02, multiplier: 10.0 },
};

export const EXPLOIT_CATEGORIES = {
  NETWORK:  { name: 'Network',  icon: '🌐', desc: 'LAN/WAN exploitation' },
  WEB:      { name: 'Web',      icon: '🕸️', desc: 'Web application attacks' },
  KERNEL:   { name: 'Kernel',   icon: '⚙️', desc: 'OS-level exploitation' },
  MOBILE:   { name: 'Mobile',   icon: '📱', desc: 'iOS/Android exploits' },
  HARDWARE: { name: 'Hardware', icon: '🔧', desc: 'Firmware & chip-level' },
  CRYPTO:   { name: 'Crypto',   icon: '🔐', desc: 'Cryptographic attacks' },
};

export const ZERO_DAY_DATABASE = [
  { id: 'zd_001', name: 'Buffer Overflow Basic', rarity: 'COMMON', category: 'KERNEL', power: 5, stealth: 0, successBonus: 5, lore: 'Script kiddie starter pack.' },
  { id: 'zd_002', name: 'SQL Injection Kit', rarity: 'COMMON', category: 'WEB', power: 5, stealth: 5, successBonus: 5, lore: 'Classic injection vectors.' },
  { id: 'zd_003', name: 'Credential Harvester', rarity: 'COMMON', category: 'WEB', power: 3, stealth: 10, successBonus: 3, lore: 'Phishing page generator.' },
  { id: 'zd_004', name: 'Port Scanner Plus', rarity: 'COMMON', category: 'NETWORK', power: 2, stealth: 15, successBonus: 8, lore: 'Enhanced nmap scripts.' },
  { id: 'zd_005', name: 'WiFi Cracker', rarity: 'COMMON', category: 'NETWORK', power: 4, stealth: 5, successBonus: 5, lore: 'WPA2 rainbow tables.' },
  { id: 'zd_006', name: 'Keylogger Lite', rarity: 'COMMON', category: 'KERNEL', power: 3, stealth: 8, successBonus: 3, lore: 'Basic keystroke capture.' },
  { id: 'zd_007', name: 'ARP Spoofer', rarity: 'COMMON', category: 'NETWORK', power: 4, stealth: 6, successBonus: 4, lore: 'MitM on local networks.' },
  { id: 'zd_010', name: 'Privilege Escalation Suite', rarity: 'UNCOMMON', category: 'KERNEL', power: 12, stealth: 5, successBonus: 10, lore: 'DirtyCow, PwnKit, and more.' },
  { id: 'zd_011', name: 'DNS Poisoner', rarity: 'UNCOMMON', category: 'NETWORK', power: 8, stealth: 12, successBonus: 8, lore: 'Redirect traffic silently.' },
  { id: 'zd_012', name: 'Session Hijacker', rarity: 'UNCOMMON', category: 'WEB', power: 10, stealth: 8, successBonus: 12, lore: 'Steal authenticated sessions.' },
  { id: 'zd_013', name: 'Bluetooth Sniffer', rarity: 'UNCOMMON', category: 'MOBILE', power: 6, stealth: 15, successBonus: 5, lore: 'Passive BLE interception.' },
  { id: 'zd_014', name: 'API Key Extractor', rarity: 'UNCOMMON', category: 'WEB', power: 7, stealth: 10, successBonus: 15, lore: 'Scrapes hardcoded secrets.' },
  { id: 'zd_015', name: 'RAT Builder', rarity: 'UNCOMMON', category: 'KERNEL', power: 15, stealth: 3, successBonus: 8, lore: 'Custom RAT compiler.' },
  { id: 'zd_016', name: 'SMB Relay', rarity: 'UNCOMMON', category: 'NETWORK', power: 11, stealth: 7, successBonus: 11, lore: 'Relay NTLM authentication.' },
  { id: 'zd_020', name: 'Kernel Rootkit Alpha', rarity: 'RARE', category: 'KERNEL', power: 25, stealth: 20, successBonus: 15, lore: 'Ring-0 persistence.' },
  { id: 'zd_021', name: 'UEFI Implant', rarity: 'RARE', category: 'HARDWARE', power: 30, stealth: 25, successBonus: 10, lore: 'Survives OS reinstalls.' },
  { id: 'zd_022', name: 'OAuth Token Forge', rarity: 'RARE', category: 'CRYPTO', power: 18, stealth: 15, successBonus: 20, lore: 'Generate valid OAuth tokens.' },
  { id: 'zd_023', name: 'SS7 Interceptor', rarity: 'RARE', category: 'MOBILE', power: 22, stealth: 18, successBonus: 12, lore: 'Intercept SMS and calls.' },
  { id: 'zd_024', name: 'Container Escape', rarity: 'RARE', category: 'KERNEL', power: 20, stealth: 12, successBonus: 18, lore: 'Break out of Docker.' },
  { id: 'zd_025', name: 'Golden Ticket Forge', rarity: 'RARE', category: 'CRYPTO', power: 28, stealth: 10, successBonus: 22, lore: 'Kerberos TGT forgery.' },
  { id: 'zd_030', name: 'iOS Zero-Click', rarity: 'EPIC', category: 'MOBILE', power: 45, stealth: 30, successBonus: 25, lore: 'NSO Group special.' },
  { id: 'zd_031', name: 'Stuxnet Variant', rarity: 'EPIC', category: 'HARDWARE', power: 50, stealth: 25, successBonus: 20, lore: 'ICS destroyer.' },
  { id: 'zd_032', name: 'AD Certificate Forge', rarity: 'EPIC', category: 'CRYPTO', power: 40, stealth: 20, successBonus: 30, lore: 'Golden certificate attack.' },
  { id: 'zd_033', name: 'Hypervisor Escape', rarity: 'EPIC', category: 'KERNEL', power: 55, stealth: 15, successBonus: 25, lore: 'VM to hypervisor breakout.' },
  { id: 'zd_034', name: 'Baseband RCE', rarity: 'EPIC', category: 'MOBILE', power: 48, stealth: 28, successBonus: 22, lore: 'Over-the-air compromise.' },
  { id: 'zd_040', name: 'EternalBlue Prime', rarity: 'LEGENDARY', category: 'NETWORK', power: 70, stealth: 10, successBonus: 40, lore: 'The original NSA SMB exploit.' },
  { id: 'zd_041', name: 'Heartbleed Redux', rarity: 'LEGENDARY', category: 'CRYPTO', power: 65, stealth: 35, successBonus: 35, lore: 'OpenSSL memory leak.' },
  { id: 'zd_042', name: 'Pegasus Lite', rarity: 'LEGENDARY', category: 'MOBILE', power: 75, stealth: 40, successBonus: 30, lore: 'NSO spyware stripped down.' },
  { id: 'zd_043', name: 'Log4Shell Persistent', rarity: 'LEGENDARY', category: 'WEB', power: 60, stealth: 25, successBonus: 45, lore: 'The gift that keeps giving.' },
  { id: 'zd_044', name: 'Spectre Prime', rarity: 'LEGENDARY', category: 'HARDWARE', power: 55, stealth: 50, successBonus: 25, lore: 'CPU side-channel attack.' },
  { id: 'zd_050', name: 'NSA QUANTUM', rarity: 'MYTHIC', category: 'NETWORK', power: 100, stealth: 60, successBonus: 50, lore: 'Man-on-the-side injection. Nation-state tier.' },
  { id: 'zd_051', name: 'Unit 8200 Phoenix', rarity: 'MYTHIC', category: 'KERNEL', power: 95, stealth: 70, successBonus: 45, lore: 'Israeli cyber command masterpiece.' },
  { id: 'zd_052', name: 'GRU Sandworm', rarity: 'MYTHIC', category: 'HARDWARE', power: 90, stealth: 50, successBonus: 55, lore: 'NotPetyas bigger brother.' },
  { id: 'zd_053', name: 'APT-X Genesis', rarity: 'MYTHIC', category: 'CRYPTO', power: 85, stealth: 80, successBonus: 40, lore: 'Quantum-resistant cipher break.' },
  { id: 'zd_054', name: 'The Equation', rarity: 'MYTHIC', category: 'HARDWARE', power: 100, stealth: 90, successBonus: 50, lore: 'NSAs crown jewel. HDD firmware implant.' },
];

export const RIVAL_ARCHETYPES = {
  SCRIPT_KIDDIE: { name: 'Script Kiddie', repRange: [0, 50], skillMod: 0.5, personality: 'Overconfident but inexperienced.', btcRange: [500, 5000], zdSlots: [1, 3] },
  GREY_HAT: { name: 'Grey Hat', repRange: [30, 150], skillMod: 0.8, personality: 'Flexible morals. Will trade info.', btcRange: [3000, 25000], zdSlots: [2, 5] },
  BLACK_HAT: { name: 'Black Hat', repRange: [100, 400], skillMod: 1.0, personality: 'Pure profit motive. Aggressive.', btcRange: [10000, 100000], zdSlots: [3, 7] },
  APT_OPERATOR: { name: 'APT Operator', repRange: [300, 800], skillMod: 1.3, personality: 'State-sponsored discipline.', btcRange: [50000, 500000], zdSlots: [5, 10] },
  LEGEND: { name: 'Legend', repRange: [600, 1500], skillMod: 1.8, personality: 'Mythical status. Definitely exists.', btcRange: [200000, 2000000], zdSlots: [8, 15] },
};

export const DESTRUCTION_BOUNTY = {
  SCRIPT_KIDDIE: 5000,
  GREY_HAT: 25000,
  BLACK_HAT: 80000,
  APT_OPERATOR: 250000,
  LEGEND: 1000000,
};

const HANDLE_PREFIXES = ['Zero', 'Null', 'Void', 'Ghost', 'Phantom', 'Shadow', 'Dark', 'Acid', 'Crash', 'Lord', 'Neo', 'Cyber', 'Razor', 'Viper', 'Toxic', 'Chaos', 'Flux', 'Glitch', 'Byte', 'Root', 'Sudo', 'Daemon', 'Kernel', 'Stack'];
const HANDLE_SUFFIXES = ['Phr34k', 'H4x0r', 'C0de', 'Burn', 'Storm', 'Strike', 'Blade', 'Wolf', 'Hawk', 'Reaper', 'Wraith', 'Specter', 'Breaker', 'Slayer', 'Master', 'Ninja', 'Dragon', 'Phoenix', 'Daemon', 'Virus', 'X', '404'];

const leetTransform = (str) => {
  const map = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7' };
  return str.split('').map(c => Math.random() > 0.6 ? (map[c.toLowerCase()] || c) : c).join('');
};

export function generateHandle() {
  const usePrefix = Math.random() > 0.3;
  const useSuffix = Math.random() > 0.3;
  let handle = '';
  if (usePrefix) handle += HANDLE_PREFIXES[Math.floor(Math.random() * HANDLE_PREFIXES.length)];
  if (useSuffix) handle += HANDLE_SUFFIXES[Math.floor(Math.random() * HANDLE_SUFFIXES.length)];
  if (!handle) handle = HANDLE_PREFIXES[Math.floor(Math.random() * HANDLE_PREFIXES.length)] + Math.floor(Math.random() * 999);
  return Math.random() > 0.5 ? leetTransform(handle) : handle;
}

function generateRivalIP() {
  const prefixes = ['185.', '193.', '91.', '45.', '194.', '212.', '178.', '95.'];
  return prefixes[Math.floor(Math.random() * prefixes.length)] + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
}

export function rollForZeroDay(luckMod = 1.0) {
  const roll = Math.random();
  let cumulative = 0;
  let selectedRarity = 'COMMON';
  for (const [rarity, data] of Object.entries(RARITY_TIERS)) {
    cumulative += data.dropRate * Math.min(luckMod, 2.0);
    if (roll < cumulative) { selectedRarity = rarity; break; }
  }
  const candidates = ZERO_DAY_DATABASE.filter(zd => zd.rarity === selectedRarity);
  if (candidates.length === 0) return null;
  return { ...candidates[Math.floor(Math.random() * candidates.length)], obtained: Date.now() };
}

function generateRivalZeroDays(archetype) {
  const [minSlots, maxSlots] = archetype.zdSlots;
  const numZDs = minSlots + Math.floor(Math.random() * (maxSlots - minSlots + 1));
  const collection = [];
  for (let i = 0; i < numZDs; i++) {
    const zd = rollForZeroDay(archetype.skillMod);
    if (zd) collection.push(zd);
  }
  return collection;
}

export function generateRival(playerRep = 100) {
  const archetypeKeys = Object.keys(RIVAL_ARCHETYPES);
  const eligible = archetypeKeys.filter(key => {
    const [minRep, maxRep] = RIVAL_ARCHETYPES[key].repRange;
    return playerRep >= minRep * 0.5 && playerRep <= maxRep * 1.5;
  });
  const selectedKey = eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : 'SCRIPT_KIDDIE';
  const archetype = RIVAL_ARCHETYPES[selectedKey];
  const [minBtc, maxBtc] = archetype.btcRange;
  const [minRep, maxRep] = archetype.repRange;
  return {
    id: 'rival_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
    handle: generateHandle(),
    archetype: selectedKey,
    archetypeName: archetype.name,
    ip: generateRivalIP(),
    rep: minRep + Math.floor(Math.random() * (maxRep - minRep)),
    btc: minBtc + Math.floor(Math.random() * (maxBtc - minBtc)),
    skillMod: archetype.skillMod,
    personality: archetype.personality,
    zeroDays: generateRivalZeroDays(archetype),
    status: 'active',
    lastSeen: Date.now(),
    attackCount: 0,
    defeatCount: 0,
    relationship: 0,
    security: Math.floor(50 + archetype.skillMod * 30 + Math.random() * 20),
    vulnerability: ['hydra', 'sqlmap', 'msfconsole', 'curl'][Math.floor(Math.random() * 4)],
  };
}

// ============================================================================
// RIVAL NODE GENERATION — Creates a real world node from rival data
// ============================================================================

export function generateRivalNode(rival) {
  const secTier = rival.security >= 81 ? 'high'
    : rival.security >= 66 ? 'high' : 'mid';

  const exploitMap = {
    hydra:      { port: 22,   svc: 'ssh' },
    sqlmap:     { port: 80,   svc: 'http' },
    msfconsole: { port: 445,  svc: 'smb' },
    curl:       { port: 8080, svc: 'http-alt' },
  };
  const vuln = exploitMap[rival.vulnerability] || exploitMap.hydra;

  // --- Rival filesystem: stash as lootable files ---
  const files = {
    '/': ['stash/', 'wallet/', 'ops/', 'logs/'],
    '/stash': [],
    '/wallet': ['cold_storage.dat'],
    '/ops': ['zero_day_vault.enc', 'botnet_config.json', 'target_list.txt'],
    '/logs': ['auth.log', 'irc_history.log'],
  };
  const contents = {
    '/wallet/cold_storage.dat': `[WALLET] ${rival.handle}'s cold storage. ₿${rival.btc.toLocaleString()} in BTC.`,
    '/ops/zero_day_vault.enc': rival.zeroDays.length > 0
      ? `[ENCRYPTED] ${rival.zeroDays.length} zero-day exploits detected. Exfil to extract.`
      : `[ENCRYPTED] Vault is empty.`,
    '/ops/botnet_config.json': `[CONFIG] Botnet C2 panel. ${Math.floor(rival.skillMod * 20)} active nodes.`,
    '/ops/target_list.txt': `[PENDING_GENERATION]`,
    '/logs/auth.log': `[PENDING_GENERATION]`,
    '/logs/irc_history.log': `[PENDING_GENERATION]`,
  };

  // Map stash items to exfiltrable files
  const stashFileMap = {
    cc_dumps:  'cc_dumps.db',
    ssn_fullz: 'fullz_archive.csv',
    botnets:   'botnet_access_keys.pgp',
    exploits:  'exploit_kits.tar.gz',
    zerodays:  'weaponized_0days.bin',
  };
  Object.entries(rival.stash || {}).forEach(([key, qty]) => {
    if (qty > 0 && stashFileMap[key]) {
      const fileName = stashFileMap[key];
      files['/stash'].push(fileName);
      contents[`/stash/${fileName}`] = `[HASH] ${qty}x ${key}. Value: ₿${(qty * 500).toLocaleString()}`;
    }
  });
  if (files['/stash'].length === 0) {
    files['/stash'].push('.empty');
    contents['/stash/.empty'] = 'Stash is clean. Nothing here.';
  }

  return {
    name: `${rival.handle}'s C2 Server`,
    sec: secTier,
    port: vuln.port,
    svc: vuln.svc,
    exp: rival.vulnerability,
    val: rival.btc,
    isHoneypot: false,
    x: `${Math.floor(Math.random() * 85 + 7)}%`,
    y: `${Math.floor(Math.random() * 55 + 10)}%`,
    files,
    contents,
    org: {
      orgName: `${rival.handle}'s C2 Server`,
      type: 'criminal',
      industry: 'Underground',
      employees: [
        { name: rival.handle, email: `${rival.handle.toLowerCase()}@${rival.ip}`, role: rival.archetypeName },
      ],
    },
    blueTeam: {
      alertLevel: Math.floor(rival.security / 3),
      patchedVulns: [],
      changedPasswords: [],
      activeHunting: rival.skillMod >= 1.3,
      lastIncident: null,
    },
    commsGenerated: false,
    slackChannelGenerated: false,
    // --- RIVAL FLAGS ---
    isRivalNode: true,
    rivalHandle: rival.handle,
    rivalId: rival.id,
  };
}

// ============================================================================

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function attemptRivalHack(rival, playerStats, playerZeroDays = [], options = {}) {
  const raidFactor = clamp(options.raidFactor ?? 1, 0.2, 1.2);
  const rivalStash = options.rivalStash || {};
  const baseSuccess = 50;
  let playerBonus = (playerStats.rep || 0) / 20;
  playerBonus += (playerStats.heat || 0) > 50 ? -10 : 0;
  playerZeroDays.forEach(zd => { playerBonus += (zd.successBonus || 0) / 3; });
  let rivalDefense = rival.security / 2 + rival.skillMod * 10;
  // Tool matching: right exploit = +25%, wrong = -25%, unspecified = 0
  const toolBonus = (options.toolMatch === true) ? 25 : (options.toolMatch === false) ? -25 : 0;
  const successChance = Math.min(95, Math.max(5, baseSuccess + playerBonus - rivalDefense + toolBonus));
  const roll = Math.random() * 100;
  const success = roll < successChance;
  let loot = null;
  if (success) {
    const stashKeys = Object.keys(rivalStash).filter(k => (rivalStash[k] || 0) > 0);
    let stash = null;
    if (stashKeys.length > 0 && Math.random() < 0.55) {
      const key = stashKeys[Math.floor(Math.random() * stashKeys.length)];
      const available = rivalStash[key] || 0;
      const pct = 0.08 + Math.random() * 0.12;
      const scaled = Math.floor(available * pct * raidFactor);
      const cap = Math.max(2, Math.floor(6 + ((playerStats.rep || 0) / 300)));
      const amount = Math.max(1, Math.min(available, scaled, cap));
      if (amount > 0) stash = { key, amount };
    }
    loot = {
      btc: Math.floor(rival.btc * (0.08 + Math.random() * 0.18) * raidFactor),
      rep: Math.floor(rival.rep * 0.1),
      zeroDay: Math.random() < 0.25 && rival.zeroDays.length > 0 ? rival.zeroDays[Math.floor(Math.random() * rival.zeroDays.length)] : null,
      stash,
    };
  }
  return { success, successChance, roll, loot, toolMatch: options.toolMatch ?? null };
}

export function rivalAttacksPlayer(rival, playerStats) {
  const attackChance = 0.08 + (rival.skillMod * 0.06) - (rival.relationship / 600);
  if (Math.random() > attackChance) return null;
  const rivalPower = rival.skillMod * 50 + rival.rep / 10;
  const playerDefense = (playerStats.rep || 0) / 5 + ((playerStats.proxyCount || 0) * 10);
  const successChance = Math.min(75, Math.max(10, 50 + rivalPower - playerDefense));
  const success = Math.random() * 100 < successChance;
  let damage = null;
  if (success) {
    const stash = playerStats.stash || {};
    const stashKeys = Object.keys(stash).filter(k => (stash[k] || 0) > 0);
    const useStashLane = stashKeys.length > 0 && Math.random() < 0.5;
    let stashLost = null;
    if (useStashLane) {
      const key = stashKeys[Math.floor(Math.random() * stashKeys.length)];
      const available = stash[key] || 0;
      const pct = 0.04 + Math.random() * 0.08;
      const scaled = Math.floor(available * pct);
      const cap = Math.max(1, 1 + Math.floor(rival.skillMod * 2));
      const amount = Math.max(1, Math.min(available, scaled, cap));
      if (amount > 0) stashLost = { key, amount };
    }
    damage = {
      btcLost: useStashLane ? 0 : Math.floor((playerStats.btc || 0) * (0.03 + Math.random() * 0.09)),
      heatGain: 5 + Math.floor(Math.random() * 15),
      zdStolen: Math.random() < 0.1,
      stashLost,
    };
  }
  return { rival, success, damage };
}

export function checkRivalSpawn(playerRep, existingRivals = []) {
  const maxRivals = Math.min(10, 3 + Math.floor(playerRep / 200));
  if (existingRivals.length >= maxRivals) return null;
  if (Math.random() > 0.12) return null;
  return generateRival(playerRep);
}

export function checkZeroDayDrop(nodeSecLevel, playerLuck = 1.0) {
  const secMult = { low: 0.03, mid: 0.08, high: 0.15, elite: 0.25 }[nodeSecLevel] || 0.05;
  if (Math.random() > secMult) return null;
  return rollForZeroDay(playerLuck * (1 + (secMult * 2)));
}
