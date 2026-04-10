// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC WIFI GENERATION SYSTEM
// Procedural networks, per-region flavors, world integration, wardriving
// ═══════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────────────
// REGION-SPECIFIC NETWORK TEMPLATES
// ───────────────────────────────────────────────────────────────────────────

export const REGION_WIFI_TEMPLATES = {
  'us-gov': {
    prefixes: [
      'DOD-SECURE', 'PENTAGON', 'NSA-VISITOR', 'FBI-FIELD', 'CIA-OPS',
      'USAF-BASE', 'NAVY-PIER', 'DHS-SECURE', 'SECRET-SERVICE', 'ATF-MOBILE',
      'LANGLEY', 'QUANTICO', 'FORT-MEADE', 'AREA51-GUEST', 'NORAD'
    ],
    suffixes: ['', '-SECURE', '-CLASSIFIED', '-GUEST', '-5G', '-TACTICAL'],
    encryptionWeights: { WPA3: 0.5, WPA2: 0.4, WEP: 0.05, OPEN: 0.05 },
    signalRange: [-35, -75],
    civilianNets: ['Starbucks_WiFi', 'McDonalds_Free', 'DC_Metro_Public', 'Smithsonian_Guest'],
  },
  
  'ru-darknet': {
    prefixes: [
      'КАФЕ', 'РЕСТОРАН', 'ГОСТИНИЦА', 'БАНК', 'ОФИС',
      'Darkside', 'Shadow_Net', 'BlackMarket', 'Syndicate', 'Bratva',
      'CyberVor', 'Kremlin_Guest', 'FSB_Secure', 'GRU_Tactical', 'Oligarch'
    ],
    suffixes: ['', '_Free', '_VIP', '_Secure', '_Hidden', '_5G'],
    encryptionWeights: { WPA2: 0.5, WEP: 0.25, OPEN: 0.2, WPA3: 0.05 },
    signalRange: [-40, -85],
    civilianNets: ['Moscow_Metro', 'Yandex_Guest', 'VK_Office', 'Telegram_HQ'],
  },
  
  'cn-financial': {
    prefixes: [
      'PBOC-INTERNAL', 'ICBC-TRADING', 'ALIBABA', 'TENCENT', 'HUAWEI',
      'BYTEDANCE', 'SHANGHAI-EXCHANGE', 'SHENZHEN-TECH', 'BAIDU', 'JD-LOGISTICS',
      'CITIC-BANK', 'PING-AN', 'CHINA-MOBILE', 'STATE-GRID', 'SINOPEC'
    ],
    suffixes: ['', '-5G', '-INTERNAL', '-GUEST', '-TRADING', '-SECURE'],
    encryptionWeights: { WPA3: 0.4, WPA2: 0.5, WEP: 0.05, OPEN: 0.05 },
    signalRange: [-30, -70],
    civilianNets: ['WeChat_Public', 'Didi_Driver', 'Meituan_Rider', 'ChinaRail_WiFi'],
  },
  
  'eu-central': {
    prefixes: [
      'DEUTSCHE-BANK', 'SIEMENS', 'BMW-CORP', 'AIRBUS', 'NESTLE',
      'NOVARTIS', 'UBS-SECURE', 'CREDIT-SUISSE', 'ECB-INTERNAL', 'EUROPOL',
      'NHS-TRUST', 'OXFORD-UNI', 'CERN-GUEST', 'ESA-OPS', 'NATO-SHAPE'
    ],
    suffixes: ['', '-Corporate', '-Guest', '-5G', '-Secure', '-Staff'],
    encryptionWeights: { WPA2: 0.55, WPA3: 0.3, WEP: 0.1, OPEN: 0.05 },
    signalRange: [-35, -80],
    civilianNets: ['Eurostar_WiFi', 'Lufthansa_Lounge', 'DB_Bahn', 'NHS_Patient'],
  },
};

// ───────────────────────────────────────────────────────────────────────────
// ENCRYPTION DIFFICULTY MAPPING
// ───────────────────────────────────────────────────────────────────────────

export const ENCRYPTION_DIFFICULTY = {
  OPEN: { 
    crackTime: 0, 
    wordlistRequired: false, 
    label: 'OPEN',
    color: '#a9dc76',
    desc: 'No security — direct connect'
  },
  WEP: { 
    crackTime: 5000, 
    wordlistRequired: false, 
    label: 'WEP',
    color: '#ffd866',
    desc: 'Weak encryption — aircrack-ng cracks instantly'
  },
  WPA2: { 
    crackTime: 15000, 
    wordlistRequired: true, 
    label: 'WPA2',
    color: '#fc9867',
    desc: 'Standard encryption — requires handshake + wordlist'
  },
  WPA3: { 
    crackTime: null, 
    wordlistRequired: true, 
    label: 'WPA3-SAE',
    color: '#ff6188',
    desc: 'Modern encryption — cannot crack, need insider credentials'
  },
};

// ───────────────────────────────────────────────────────────────────────────
// BSSID (MAC ADDRESS) GENERATION
// ───────────────────────────────────────────────────────────────────────────

const OUI_PREFIXES = [
  'A4:CF:12', '00:1A:2B', 'F8:E4:3B', 'DC:A6:32', '88:71:B1',
  '7C:D1:C3', 'B4:F1:DA', 'E8:6F:38', '48:2C:6A', '94:B8:6D',
  'CC:46:D6', '3C:5A:B4', 'F0:18:98', 'A0:99:9B', '60:F4:45'
];

export const generateBSSID = (seed = null) => {
  const oui = OUI_PREFIXES[Math.floor(Math.random() * OUI_PREFIXES.length)];
  const suffix = Array.from({ length: 3 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
  ).join(':');
  return `${oui}:${suffix}`;
};

// ───────────────────────────────────────────────────────────────────────────
// PASSWORD GENERATION
// ───────────────────────────────────────────────────────────────────────────

const PASSWORD_PATTERNS = {
  weak: [
    'password123', 'admin123', 'welcome1', 'letmein', '123456789',
    'qwerty123', 'abc123', 'password1', 'iloveyou', 'sunshine'
  ],
  medium: [
    'Summer2024!', 'Company123$', 'Welcome@2024', 'Secure#Pass1',
    'Corp0rate!', 'Network99$', 'Admin@dmin1', 'P@ssw0rd!23'
  ],
  strong: [
    'xK9#mP2$vL5@nQ8', 'Tr0ub4dor&3#Horse', '7Hy*Jk2!pL9@mN',
    'C0rp_S3cur3_2024!', 'N3tw0rk#Acc3ss!99'
  ],
};

export const generatePassword = (securityLevel = 'medium') => {
  const pool = PASSWORD_PATTERNS[securityLevel] || PASSWORD_PATTERNS.medium;
  return pool[Math.floor(Math.random() * pool.length)];
};

// ───────────────────────────────────────────────────────────────────────────
// CLIENT DEVICE GENERATION
// ───────────────────────────────────────────────────────────────────────────

const CLIENT_DEVICES = {
  highValue: [
    'iPhone 15 Pro (CEO)', 'MacBook Pro (CFO)', 'ThinkPad X1 (CISO)',
    'Surface Pro (VP Sales)', 'iPad Pro (Board Member)', 'Galaxy S24 (CTO)'
  ],
  standard: [
    'iPhone 14', 'MacBook Air', 'ThinkPad', 'Dell Latitude', 'HP EliteBook',
    'Surface Laptop', 'Galaxy S23', 'Pixel 8', 'iPad Air', 'Chromebook'
  ],
  iot: [
    'Security Cam #1', 'Smart Thermostat', 'Badge Reader', 'IP Phone',
    'Printer (HP)', 'Smart TV', 'Conference Room Display', 'Access Point'
  ],
};

export const generateClients = (networkType = 'corporate', count = null) => {
  const numClients = count || Math.floor(Math.random() * 8) + 2;
  const clients = [];
  
  // High-value targets for corporate networks
  if (networkType === 'corporate' && Math.random() < 0.7) {
    const hvDevice = CLIENT_DEVICES.highValue[Math.floor(Math.random() * CLIENT_DEVICES.highValue.length)];
    clients.push({
      mac: generateBSSID(),
      device: hvDevice,
      signal: -30 - Math.floor(Math.random() * 15),
      frames: Math.floor(Math.random() * 3000) + 500,
      highValue: true,
    });
  }
  
  // Standard devices
  const remaining = numClients - clients.length;
  for (let i = 0; i < remaining; i++) {
    const pool = Math.random() < 0.3 ? CLIENT_DEVICES.iot : CLIENT_DEVICES.standard;
    clients.push({
      mac: generateBSSID(),
      device: pool[Math.floor(Math.random() * pool.length)],
      signal: -35 - Math.floor(Math.random() * 40),
      frames: Math.floor(Math.random() * 2000) + 100,
      highValue: false,
    });
  }
  
  return clients;
};

// ───────────────────────────────────────────────────────────────────────────
// GENERATE WIFI NETWORK FROM WORLD NODE
// ───────────────────────────────────────────────────────────────────────────

export const generateNetworkFromOrg = (orgData, nodeIP, region, directorModifiers = {}) => {
  const template = REGION_WIFI_TEMPLATES[region] || REGION_WIFI_TEMPLATES['us-gov'];
  const orgName = orgData.orgName || 'UNKNOWN';
  
  // Generate SSID from org name
  const suffix = template.suffixes[Math.floor(Math.random() * template.suffixes.length)];
  const cleanName = orgName.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20).toUpperCase();
  const essid = `${cleanName}${suffix}`;
  
  // Select encryption based on director difficulty
  let encryption = 'WPA2';
  if (directorModifiers.wifiDifficulty === 'easy') {
    encryption = Math.random() < 0.4 ? 'WEP' : (Math.random() < 0.3 ? 'OPEN' : 'WPA2');
  } else if (directorModifiers.wifiDifficulty === 'hard') {
    encryption = Math.random() < 0.3 ? 'WPA3' : 'WPA2';
  } else if (directorModifiers.wifiDifficulty === 'extreme') {
    encryption = Math.random() < 0.6 ? 'WPA3' : 'WPA2';
  }
  
  // Generate signal based on "distance"
  const [minSig, maxSig] = template.signalRange;
  const signal = minSig + Math.floor(Math.random() * (maxSig - minSig));
  
  // Channel selection
  const channels = [1, 6, 11, 36, 40, 44, 48, 149, 153, 157, 161];
  const channel = channels[Math.floor(Math.random() * channels.length)];
  
  return {
    essid,
    bssid: generateBSSID(),
    channel,
    signal,
    enc: encryption,
    encDetails: ENCRYPTION_DIFFICULTY[encryption],
    clients: generateClients('corporate'),
    linkedNodeIP: nodeIP,
    linkedOrg: orgName,
    target: true,
    discovered: false,
    breached: false,
    password: encryption !== 'OPEN' ? generatePassword(encryption === 'WEP' ? 'weak' : 'medium') : null,
    internalNodes: [
      { ip: `${nodeIP.split('.').slice(0, 3).join('.')}.20`, type: 'File Server' },
      { ip: `${nodeIP.split('.').slice(0, 3).join('.')}.30`, type: 'Database' },
      { ip: `${nodeIP.split('.').slice(0, 3).join('.')}.50`, type: 'Domain Controller' },
    ],
  };
};

// ───────────────────────────────────────────────────────────────────────────
// GENERATE REGION-SPECIFIC AMBIENT NETWORKS
// ───────────────────────────────────────────────────────────────────────────

export const generateAmbientNetworks = (region, count = 5, directorModifiers = {}) => {
  const template = REGION_WIFI_TEMPLATES[region] || REGION_WIFI_TEMPLATES['us-gov'];
  const networks = [];
  
  // Generate target networks from prefixes
  const targetCount = Math.floor(count * 0.6);
  for (let i = 0; i < targetCount; i++) {
    const prefix = template.prefixes[Math.floor(Math.random() * template.prefixes.length)];
    const suffix = template.suffixes[Math.floor(Math.random() * template.suffixes.length)];
    
    // Weighted encryption selection
    const roll = Math.random();
    let cumulative = 0;
    let encryption = 'WPA2';
    for (const [enc, weight] of Object.entries(template.encryptionWeights)) {
      cumulative += weight;
      if (roll < cumulative) {
        encryption = enc;
        break;
      }
    }
    
    // Director difficulty override
    if (directorModifiers.wifiDifficulty === 'extreme' && encryption !== 'WPA3') {
      encryption = Math.random() < 0.5 ? 'WPA3' : encryption;
    }
    
    const [minSig, maxSig] = template.signalRange;
    const channels = [1, 6, 11, 36, 40, 44, 48];
    
    networks.push({
      essid: `${prefix}${suffix}`,
      bssid: generateBSSID(),
      channel: channels[Math.floor(Math.random() * channels.length)],
      signal: minSig + Math.floor(Math.random() * (maxSig - minSig)),
      enc: encryption,
      encDetails: ENCRYPTION_DIFFICULTY[encryption],
      clients: generateClients('corporate'),
      target: true,
      discovered: false,
      breached: false,
      password: encryption !== 'OPEN' ? generatePassword(encryption === 'WEP' ? 'weak' : 'medium') : null,
      linkedNodeIP: null, // Ambient - not linked to specific node
      linkedOrg: prefix,
    });
  }
  
  // Add civilian/noise networks
  const civilianCount = count - targetCount;
  for (let i = 0; i < civilianCount; i++) {
    const essid = template.civilianNets[Math.floor(Math.random() * template.civilianNets.length)];
    const encryption = Math.random() < 0.5 ? 'OPEN' : 'WPA2';
    
    networks.push({
      essid,
      bssid: generateBSSID(),
      channel: [1, 6, 11][Math.floor(Math.random() * 3)],
      signal: -50 - Math.floor(Math.random() * 35),
      enc: encryption,
      encDetails: ENCRYPTION_DIFFICULTY[encryption],
      clients: generateClients('civilian', Math.floor(Math.random() * 5) + 1),
      target: false,
      discovered: false,
      breached: false,
      password: encryption !== 'OPEN' ? generatePassword('weak') : null,
      linkedNodeIP: null,
      linkedOrg: null,
    });
  }
  
  return networks;
};

// ───────────────────────────────────────────────────────────────────────────
// WARDRIVING SYSTEM
// ───────────────────────────────────────────────────────────────────────────

export const WARDRIVE_CONFIG = {
  baseDiscoveryRate: 3000,      // ms between network discoveries
  vehicleMultipliers: {
    none: 2.0,                   // On foot - slower
    bicycle: 1.5,                // Bike
    car: 1.0,                    // Standard car
    van: 0.8,                    // Van with better antenna
    drone: 0.5,                  // Drone - fastest
  },
  antennaMultipliers: {
    stock: 1.0,
    yagi: 0.7,                   // Directional antenna
    parabolic: 0.5,              // Dish antenna
    cantenna: 0.8,               // DIY cantenna
  },
  heatPerNetwork: 0.5,           // Heat gained per discovered network
  maxNetworksPerRun: 20,         // Cap on networks per wardrive session
  detectionChance: {
    'us-gov': 0.15,              // Higher security in gov areas
    'ru-darknet': 0.05,          // Less organized security
    'cn-financial': 0.12,        // Moderate security
    'eu-central': 0.08,          // Standard security
  },
};

export const calculateWardriveSpeed = (vehicle = 'car', antenna = 'stock') => {
  const vMult = WARDRIVE_CONFIG.vehicleMultipliers[vehicle] || 1.0;
  const aMult = WARDRIVE_CONFIG.antennaMultipliers[antenna] || 1.0;
  return Math.floor(WARDRIVE_CONFIG.baseDiscoveryRate * vMult * aMult);
};

export const generateWardriveDiscovery = (region, existingNetworks = [], directorModifiers = {}) => {
  const template = REGION_WIFI_TEMPLATES[region] || REGION_WIFI_TEMPLATES['us-gov'];
  
  // 70% chance of new network, 30% chance of existing (stronger signal)
  if (existingNetworks.length > 0 && Math.random() < 0.3) {
    // Return existing network with updated signal (getting closer)
    const existing = existingNetworks[Math.floor(Math.random() * existingNetworks.length)];
    return {
      ...existing,
      signal: Math.min(existing.signal + Math.floor(Math.random() * 10) + 5, -25),
      isUpdate: true,
    };
  }
  
  // Generate new network
  const isTarget = Math.random() < 0.4;
  
  if (isTarget) {
    const prefix = template.prefixes[Math.floor(Math.random() * template.prefixes.length)];
    const suffix = template.suffixes[Math.floor(Math.random() * template.suffixes.length)];
    
    let encryption = 'WPA2';
    const roll = Math.random();
    let cumulative = 0;
    for (const [enc, weight] of Object.entries(template.encryptionWeights)) {
      cumulative += weight;
      if (roll < cumulative) {
        encryption = enc;
        break;
      }
    }
    
    return {
      essid: `${prefix}${suffix}`,
      bssid: generateBSSID(),
      channel: [1, 6, 11, 36, 44, 149][Math.floor(Math.random() * 6)],
      signal: -60 - Math.floor(Math.random() * 25),
      enc: encryption,
      encDetails: ENCRYPTION_DIFFICULTY[encryption],
      clients: generateClients('corporate'),
      target: true,
      discovered: true,
      breached: false,
      password: encryption !== 'OPEN' ? generatePassword(encryption === 'WEP' ? 'weak' : 'medium') : null,
      linkedNodeIP: null,
      linkedOrg: prefix,
      isNew: true,
    };
  } else {
    // Civilian network
    const essid = template.civilianNets[Math.floor(Math.random() * template.civilianNets.length)];
    const encryption = Math.random() < 0.6 ? 'OPEN' : 'WPA2';
    
    return {
      essid,
      bssid: generateBSSID(),
      channel: [1, 6, 11][Math.floor(Math.random() * 3)],
      signal: -55 - Math.floor(Math.random() * 30),
      enc: encryption,
      encDetails: ENCRYPTION_DIFFICULTY[encryption],
      clients: generateClients('civilian', Math.floor(Math.random() * 3) + 1),
      target: false,
      discovered: true,
      breached: false,
      password: encryption !== 'OPEN' ? generatePassword('weak') : null,
      linkedNodeIP: null,
      linkedOrg: null,
      isNew: true,
    };
  }
};

// ───────────────────────────────────────────────────────────────────────────
// SYNC WIFI NETWORKS WITH WORLD STATE
// ───────────────────────────────────────────────────────────────────────────

export const syncWifiWithWorld = (world, region, existingNetworks = [], directorModifiers = {}) => {
  const networks = [...existingNetworks];
  const existingLinkedIPs = new Set(networks.filter(n => n.linkedNodeIP).map(n => n.linkedNodeIP));
  
  // Generate WiFi for each org node not already covered
  Object.entries(world).forEach(([ip, node]) => {
    if (ip === 'local' || existingLinkedIPs.has(ip)) return;
    if (!node.data?.org?.orgName) return;
    
    // 70% chance an org has WiFi
    if (Math.random() < 0.7) {
      const newNet = generateNetworkFromOrg(node.data.org, ip, region, directorModifiers);
      networks.push(newNet);
    }
  });
  
  // Add some ambient networks if we don't have many
  if (networks.length < 8) {
    const ambient = generateAmbientNetworks(region, 8 - networks.length, directorModifiers);
    networks.push(...ambient);
  }
  
  return networks;
};

// ───────────────────────────────────────────────────────────────────────────
// EXPORTS
// ───────────────────────────────────────────────────────────────────────────

export default {
  REGION_WIFI_TEMPLATES,
  ENCRYPTION_DIFFICULTY,
  WARDRIVE_CONFIG,
  generateBSSID,
  generatePassword,
  generateClients,
  generateNetworkFromOrg,
  generateAmbientNetworks,
  generateWardriveDiscovery,
  calculateWardriveSpeed,
  syncWifiWithWorld,
};
