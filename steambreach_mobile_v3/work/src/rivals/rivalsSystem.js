
// ============================================================================
// STEAMBREACH: RIVALS, FACTIONS & ZERO-DAY COLLECTIBLES SYSTEM
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

export const RIVAL_FACTIONS = {
  BLACK_SUN: {
    name: 'BLACK SUN',
    icon: '☠️',
    style: 'Chaos',
    desc: 'Loud saboteurs and ransomware brokers.',
    hostilityBias: 10,
    marketMod: 1.05,
  },
  SYNAPSE: {
    name: 'SYNAPSE',
    icon: '🧠',
    style: 'Elite AI',
    desc: 'Adaptive operators who learn your habits.',
    hostilityBias: 0,
    marketMod: 1.0,
  },
  GOLD_MARKET: {
    name: 'GOLD MARKET',
    icon: '💰',
    style: 'Profit',
    desc: 'Cartel brokers who price everything.',
    hostilityBias: -5,
    marketMod: 1.1,
  },
  GHOSTLINE: {
    name: 'GHOSTLINE',
    icon: '🕵️',
    style: 'Stealth',
    desc: 'Ghost-tier trackers and proxy hunters.',
    hostilityBias: 5,
    marketMod: 0.98,
  },
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

export const RIVAL_TRAITS = [
  'Adaptive Firewall',
  'Packet Ghost',
  'Proxy Butcher',
  'Ransom Broker',
  'Counter-Forensics',
  'Honeytrap Artist',
  'Silent Worm',
  'Credential Leech',
  'Darknet Diplomat',
  'AI Predictor',
];

const HANDLE_PREFIXES = ['Zero', 'Null', 'Void', 'Ghost', 'Phantom', 'Shadow', 'Dark', 'Acid', 'Crash', 'Lord', 'Neo', 'Cyber', 'Razor', 'Viper', 'Toxic', 'Chaos', 'Flux', 'Glitch', 'Byte', 'Root', 'Sudo', 'Daemon', 'Kernel', 'Stack'];
const HANDLE_SUFFIXES = ['Phr34k', 'H4x0r', 'C0de', 'Burn', 'Storm', 'Strike', 'Blade', 'Wolf', 'Hawk', 'Reaper', 'Wraith', 'Specter', 'Breaker', 'Slayer', 'Master', 'Ninja', 'Dragon', 'Phoenix', 'Daemon', 'Virus', 'X', '404'];

const leetTransform = (str) => {
  const map = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7' };
  return str.split('').map(c => Math.random() > 0.6 ? (map[c.toLowerCase()] || c) : c).join('');
};

const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function generateHandle() {
  const usePrefix = Math.random() > 0.3;
  const useSuffix = Math.random() > 0.3;
  let handle = '';
  if (usePrefix) handle += pick(HANDLE_PREFIXES);
  if (useSuffix) handle += pick(HANDLE_SUFFIXES);
  if (!handle) handle = pick(HANDLE_PREFIXES) + Math.floor(Math.random() * 999);
  return Math.random() > 0.5 ? leetTransform(handle) : handle;
}

function generateRivalIP() {
  const prefixes = ['185.', '193.', '91.', '45.', '194.', '212.', '178.', '95.'];
  return `${pick(prefixes)}${rand(0, 255)}.${rand(0, 255)}.${rand(0, 255)}`;
}

function getFactionKey() {
  const keys = Object.keys(RIVAL_FACTIONS);
  const roll = Math.random();
  if (roll < 0.28) return 'BLACK_SUN';
  if (roll < 0.52) return 'GHOSTLINE';
  if (roll < 0.76) return 'GOLD_MARKET';
  return 'SYNAPSE';
}

function getInitialTraits(archetypeKey, factionKey) {
  const base = [];
  if (factionKey === 'SYNAPSE') base.push('AI Predictor');
  if (factionKey === 'GHOSTLINE') base.push('Packet Ghost');
  if (factionKey === 'BLACK_SUN') base.push('Ransom Broker');
  if (factionKey === 'GOLD_MARKET') base.push('Darknet Diplomat');
  if (archetypeKey === 'APT_OPERATOR' || archetypeKey === 'LEGEND') base.push('Counter-Forensics');
  return [...new Set(base)].slice(0, 3);
}

function getTitle(rival) {
  if ((rival.defeatCount || 0) >= 3) return 'The One Who Remembers';
  if ((rival.attackCount || 0) >= 3) return 'Hunter of Wallets';
  if ((rival.relationship || 0) <= -60) return 'Your Nemesis';
  if ((rival.relationship || 0) >= 40) return 'Trusted Ghost';
  if ((rival.rep || 0) >= 700) return 'Legend of the Grid';
  return 'Underground Operator';
}

export function getPlayerBountyTier(playerRep = 0, heat = 0, hostileRivals = 0) {
  const pressure = heat + (playerRep * 0.08) + (hostileRivals * 8);
  if (pressure >= 140) return { tier: 'MANHUNT', amount: 250000, hunters: 3 };
  if (pressure >= 105) return { tier: 'CRITICAL', amount: 120000, hunters: 2 };
  if (pressure >= 70) return { tier: 'HOT', amount: 45000, hunters: 1 };
  if (pressure >= 40) return { tier: 'WARM', amount: 10000, hunters: 1 };
  return { tier: 'COLD', amount: 0, hunters: 0 };
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
  return { ...pick(candidates), obtained: Date.now() };
}

function generateRivalZeroDays(archetype) {
  const [minSlots, maxSlots] = archetype.zdSlots;
  const numZDs = rand(minSlots, maxSlots);
  const collection = [];
  for (let i = 0; i < numZDs; i++) {
    const zd = rollForZeroDay(archetype.skillMod);
    if (zd) collection.push(zd);
  }
  return collection;
}

export function generateRival(playerRep = 100) {
  const archetypeKeys = Object.keys(RIVAL_ARCHETYPES);
  const eligible = archetypeKeys.filter((key) => {
    const [minRep, maxRep] = RIVAL_ARCHETYPES[key].repRange;
    return playerRep >= minRep * 0.5 && playerRep <= maxRep * 1.5;
  });
  const selectedKey = eligible.length > 0 ? pick(eligible) : 'SCRIPT_KIDDIE';
  const archetype = RIVAL_ARCHETYPES[selectedKey];
  const [minBtc, maxBtc] = archetype.btcRange;
  const [minRep, maxRep] = archetype.repRange;
  const factionKey = getFactionKey();
  const faction = RIVAL_FACTIONS[factionKey];
  const rival = {
    id: 'rival_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
    handle: generateHandle(),
    archetype: selectedKey,
    archetypeName: archetype.name,
    faction: factionKey,
    factionName: faction.name,
    factionIcon: faction.icon,
    ip: generateRivalIP(),
    rep: rand(minRep, maxRep),
    btc: rand(minBtc, maxBtc),
    skillMod: archetype.skillMod,
    personality: archetype.personality,
    zeroDays: generateRivalZeroDays(archetype),
    status: 'active',
    lastSeen: Date.now(),
    attackCount: 0,
    defeatCount: 0,
    relationship: 0,
    vendetta: 0,
    security: Math.floor(50 + archetype.skillMod * 30 + Math.random() * 20),
    vulnerability: ['hydra', 'sqlmap', 'msfconsole', 'curl'][Math.floor(Math.random() * 4)],
    traits: getInitialTraits(selectedKey, factionKey),
    huntProgress: rand(0, 15),
    allyCostPct: factionKey === 'GOLD_MARKET' ? 0.12 : 0.1,
    title: 'Underground Operator',
    bounty: Math.floor(rand(2000, 12000) * faction.marketMod),
    memory: [],
  };
  rival.title = getTitle(rival);
  return rival;
}

export function evolveRival(rival, trigger = 'raid') {
  const next = { ...rival };
  next.memory = [...(next.memory || [])].slice(-5);
  if (trigger === 'raid') {
    next.vendetta = Math.min(100, (next.vendetta || 0) + 18);
    next.huntProgress = Math.min(100, (next.huntProgress || 0) + 12);
    next.security = Math.min(99, (next.security || 0) + 4);
    next.relationship = Math.max(-100, (next.relationship || 0) - 12);
    if (Math.random() < 0.35) next.vulnerability = pick(['hydra', 'sqlmap', 'msfconsole', 'curl'].filter((v) => v !== next.vulnerability));
    if (Math.random() < 0.25 && (next.traits || []).length < 4) next.traits = [...new Set([...(next.traits || []), pick(RIVAL_TRAITS)])];
    next.memory.push('You raided their vault.');
  }
  if (trigger === 'taunt') {
    next.vendetta = Math.min(100, (next.vendetta || 0) + 10);
    next.huntProgress = Math.min(100, (next.huntProgress || 0) + 16);
    next.relationship = Math.max(-100, (next.relationship || 0) - 20);
    next.memory.push('You taunted them publicly.');
  }
  if (trigger === 'ally') {
    next.status = 'friendly';
    next.relationship = Math.min(100, Math.max(25, (next.relationship || 0) + 35));
    next.vendetta = Math.max(0, (next.vendetta || 0) - 20);
    next.huntProgress = Math.max(0, (next.huntProgress || 0) - 20);
    next.memory.push('You brokered an alliance.');
  }
  if (trigger === 'betray') {
    next.status = 'hostile';
    next.relationship = -80;
    next.vendetta = Math.min(100, (next.vendetta || 0) + 35);
    next.huntProgress = Math.min(100, (next.huntProgress || 0) + 30);
    next.memory.push('You betrayed the pact.');
  }
  if ((next.relationship || 0) <= -30 && next.status !== 'destroyed') next.status = 'hostile';
  if ((next.relationship || 0) >= 25 && next.status !== 'destroyed') next.status = 'friendly';
  next.title = getTitle(next);
  return next;
}

export function attemptRivalHack(rival, playerStats, playerZeroDays = []) {
  const baseSuccess = 50;
  let playerBonus = (playerStats.rep || 0) / 20;
  playerBonus += (playerStats.heat || 0) > 50 ? -10 : 0;
  playerBonus += Math.min(10, ((playerStats.proxyCount || 0) * 2));
  playerZeroDays.forEach((zd) => { playerBonus += (zd.successBonus || 0) / 3; });

  let rivalDefense = rival.security / 2 + rival.skillMod * 10;
  if ((rival.traits || []).includes('Adaptive Firewall')) rivalDefense += 8;
  if ((rival.traits || []).includes('Counter-Forensics')) rivalDefense += 4;
  if (rival.status === 'compromised') rivalDefense -= 10;

  const successChance = Math.min(95, Math.max(5, baseSuccess + playerBonus - rivalDefense));
  const roll = Math.random() * 100;
  const success = roll < successChance;
  let loot = null;
  if (success) {
    loot = {
      btc: Math.floor(rival.btc * (0.1 + Math.random() * 0.3)),
      rep: Math.floor(rival.rep * 0.1),
      zeroDay: Math.random() < 0.25 && rival.zeroDays.length > 0 ? pick(rival.zeroDays) : null,
    };
  }
  return { success, successChance, roll, loot };
}

export function rivalAttacksPlayer(rival, playerStats) {
  const hostileBias = rival.status === 'hostile' ? 0.08 : rival.status === 'friendly' ? -0.06 : 0;
  const vendettaBias = (rival.vendetta || 0) / 500;
  const huntBias = (rival.huntProgress || 0) / 700;
  const attackChance = 0.08 + (rival.skillMod * 0.06) - (rival.relationship / 600) + hostileBias + vendettaBias + huntBias;
  if (Math.random() > attackChance) return null;

  const rivalPower = rival.skillMod * 50 + rival.rep / 10 + (rival.vendetta || 0) / 3;
  const playerDefense = (playerStats.rep || 0) / 5 + ((playerStats.proxyCount || 0) * 10);
  const successChance = Math.min(75, Math.max(10, 50 + rivalPower - playerDefense));
  const success = Math.random() * 100 < successChance;
  let damage = null;
  if (success) {
    damage = {
      btcLost: Math.floor((playerStats.btc || 0) * (0.03 + Math.random() * 0.12)),
      heatGain: 5 + Math.floor(Math.random() * 15),
      zdStolen: Math.random() < 0.1,
      proxyBurn: Math.random() < 0.18,
    };
  }
  return { rival, success, damage, successChance };
}

export function checkRivalSpawn(playerRep, existingRivals = []) {
  const maxRivals = Math.min(12, 3 + Math.floor(playerRep / 180));
  if (existingRivals.length >= maxRivals) return null;
  if (Math.random() > 0.12) return null;
  return generateRival(playerRep);
}

export function checkZeroDayDrop(nodeSecLevel, playerLuck = 1.0) {
  const secMult = { low: 0.03, mid: 0.08, high: 0.15, elite: 0.25 }[nodeSecLevel] || 0.05;
  if (Math.random() > secMult) return null;
  return rollForZeroDay(playerLuck * (1 + (secMult * 2)));
}

export function processRivalWorldTick(rivals = [], playerStats = {}) {
  const events = [];
  const updated = rivals.map((r) => {
    if (r.status === 'destroyed') return r;
    let next = { ...r };
    next.lastSeen = Date.now();
    next.huntProgress = Math.min(100, Math.max(0, (next.huntProgress || 0) + (next.status === 'hostile' ? rand(3, 10) : rand(-2, 4))));
    next.vendetta = Math.min(100, Math.max(0, (next.vendetta || 0) + (next.status === 'hostile' ? rand(1, 4) : rand(-2, 1))));
    if (Math.random() < 0.12 && next.status !== 'friendly') {
      next.btc += rand(200, 4000);
    }
    if (Math.random() < 0.08 && (next.traits || []).length < 4) {
      next.traits = [...new Set([...(next.traits || []), pick(RIVAL_TRAITS)])].slice(0, 4);
      events.push({ type: 'evolved', message: `${next.factionIcon} ${next.handle} evolved: ${next.traits[next.traits.length - 1]}` });
    }
    next.title = getTitle(next);
    return next;
  });

  if (updated.length >= 2 && Math.random() < 0.18) {
    const aIdx = rand(0, updated.length - 1);
    let bIdx = rand(0, updated.length - 1);
    while (bIdx === aIdx) bIdx = rand(0, updated.length - 1);
    const a = updated[aIdx];
    const b = updated[bIdx];
    if (a.status !== 'destroyed' && b.status !== 'destroyed') {
      const winnerIdx = Math.random() < 0.5 ? aIdx : bIdx;
      const loserIdx = winnerIdx === aIdx ? bIdx : aIdx;
      const winner = { ...updated[winnerIdx] };
      const loser = { ...updated[loserIdx] };
      const stolen = Math.floor((loser.btc || 0) * 0.12);
      winner.btc += stolen;
      winner.rep += 8;
      winner.relationship = Math.max(-100, (winner.relationship || 0) - 4);
      loser.btc = Math.max(0, loser.btc - stolen);
      loser.security = Math.max(20, (loser.security || 0) - 5);
      loser.status = loser.security <= 25 ? 'compromised' : loser.status;
      winner.title = getTitle(winner);
      loser.title = getTitle(loser);
      updated[winnerIdx] = winner;
      updated[loserIdx] = loser;
      events.push({
        type: 'war',
        message: `[GLOBAL EVENT] ${winner.factionIcon} ${winner.handle} hit ${loser.handle} and stole ₿${stolen.toLocaleString()}.`,
      });
    }
  }

  const bounty = getPlayerBountyTier(
    playerStats.rep || 0,
    playerStats.heat || 0,
    updated.filter((r) => r.status === 'hostile').length,
  );

  return { rivals: updated, events, bounty };
}
