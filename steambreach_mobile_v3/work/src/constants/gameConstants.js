// Split from UpdatedPeople.jsx
const HOURLY_RATE = 500;

const COLORS = {
  bg: '#0a0a0f',
  bgPanel: '#111118',
  bgDark: '#08080c',
  text: '#fcfcfa',
  textDim: '#727072',
  primary: '#78dce8',
  primaryDim: '#4a8b96',
  secondary: '#a9dc76',
  danger: '#ff6188',
  warning: '#ffd866',
  ip: '#78dce8',
  file: '#fc9867',
  chat: '#ab9df2',
  mapNode: '#78dce8',
  infected: '#ab9df2',
  looted: '#ffd866',
  proxy: '#fc9867',
  elite: '#ff6188',
  border: '#2d2a2e',
  borderActive: '#403e41',
};

// ==========================================
// 2. MASTER COMMAND REGISTRY
// ==========================================
const COMMAND_REGISTRY = [
  // --- RECON & ACCESS ---
  { cmd: 'nmap', desc: 'Scan for new targets / open network map', category: 'RECON & ACCESS' },
  { cmd: 'nmap <ip>', desc: 'Scan specific target — shows vuln, employees, ports', category: 'RECON & ACCESS' },
  { cmd: 'ettercap', desc: 'ARP poison + sniff internal Slack/Teams comms (inside node, requires Deep Packet Inspector)', category: 'RECON & ACCESS' },
  { cmd: 'hydra <ip>', desc: 'Brute-force SSH credentials', category: 'RECON & ACCESS' },
  { cmd: 'sqlmap <ip>', desc: 'SQL injection attack', category: 'RECON & ACCESS' },
  { cmd: 'msfconsole <ip>', desc: 'Exploit unpatched SMB service', category: 'RECON & ACCESS' },
  { cmd: 'curl <ip>', desc: 'Exploit HTTP/LFI vulnerability', category: 'RECON & ACCESS' },
  { cmd: 'ssh <email@ip> <password>', desc: 'Authenticate with stolen credentials — bypasses IDS logging', category: 'PRIVILEGE ESCALATION' },

  // --- WIFI HACKING ---
  { cmd: 'iwconfig', desc: 'Show wireless interface status (monitor/managed mode)', category: 'WIFI HACKING' },
  { cmd: 'airmon-ng start wlan0', desc: 'Enable monitor mode — capture all wireless traffic', category: 'WIFI HACKING' },
  { cmd: 'airodump-ng wlan0mon', desc: 'Scan for WiFi networks in range', category: 'WIFI HACKING' },
  { cmd: 'airodump-ng <network>', desc: 'Target specific WiFi network by name', category: 'WIFI HACKING' },
  { cmd: 'airodump-ng --bssid <MAC> -c <CH> -w capture wlan0mon', desc: 'Focus capture on target network', category: 'WIFI HACKING' },
  { cmd: 'aireplay-ng --deauth 10 -a <BSSID> -c <CLIENT> wlan0mon', desc: 'Deauth attack — force WPA handshake capture', category: 'WIFI HACKING' },
  { cmd: 'aircrack-ng -w <wordlist> capture-01.cap', desc: 'Crack WPA/WPA2 password from captured handshake', category: 'WIFI HACKING' },
  { cmd: 'wifiphish <email>', desc: 'Social engineer WPA3 password from connected client', category: 'WIFI HACKING' },
  { cmd: 'nmcli dev wifi connect <SSID> password <pass>', desc: 'Connect to WiFi network with cracked password', category: 'WIFI HACKING' },
  { cmd: 'wireshark', desc: 'Analyze captured packets — find credentials and traffic', category: 'WIFI HACKING' },
  { cmd: 'wardrive', desc: 'Mobile WiFi scanning — discover networks while driving', category: 'WIFI HACKING' },
  { cmd: 'wifistatus', desc: 'Show current WiFi attack progress', category: 'WIFI HACKING' },

  // --- PRIVILEGE ESCALATION ---
  { cmd: 'pwnkit', desc: 'Escalate www-data → root via CVE-2021-4034. Trace +15%', category: 'PRIVILEGE ESCALATION' },
  { cmd: 'ssh <ip> <pass>', desc: 'Authenticate with stolen credentials — bypasses IDS logging', category: 'PRIVILEGE ESCALATION' },
  { cmd: 'sendmail -to <email> -attach <file>', desc: 'Spoof internal email to phish an employee (requires shell)', category: 'PRIVILEGE ESCALATION' },

  // --- BOTNET & C2 ---
  { cmd: 'sliver', desc: 'Deploy C2 botnet beacon (root) — ₿500/hr passive income per node', category: 'BOTNET & C2' },
  { cmd: 'chisel', desc: 'Create SOCKS5 proxy tunnel — slows trace (root)', category: 'BOTNET & C2' },
  { cmd: 'disconnect <ip>', desc: 'Remove proxy or botnet node, free proxy slot', category: 'BOTNET & C2' },
  { cmd: 'hping3 <ip>', desc: 'Botnet SYN flood DDoS — overwhelms target and lowers Blue Team alert level', category: 'BOTNET & C2' },
  { cmd: 'mimikatz <ip>', desc: 'Dump LSASS credentials from a botnet node', category: 'BOTNET & C2' },
  { cmd: 'stash <file>', desc: 'Route exfil through botnet node (+3% heat vs +10% direct)', category: 'BOTNET & C2' },

  // --- PAYLOADS & MALWARE ---
  { cmd: 'msfvenom <arg>', desc: 'Deploy viral payloads (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'eternalblue <arg>', desc: 'Mass SMBv1 propagation (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'reptile <arg>', desc: 'Install stealth kernel rootkit (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'xmrig <arg>', desc: 'Deploy cryptominer for passive XMR (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'shred <arg>', desc: 'Destroy target file system (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'openssl <arg>', desc: 'Deploy ransomware payload (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'crontab <arg>', desc: 'Schedule logic bombs (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'wipe', desc: 'Scrub system logs (root) — Heat -15%, Blue Team alert -30. One use per node.', category: 'PAYLOADS & MALWARE' },
  { cmd: 'findvirus', desc: 'Harvest malware signatures/modules from compromised host', category: 'PAYLOADS & MALWARE' },
  { cmd: 'craftvirus <type>', desc: 'Compile custom malware (worm/stealer/wiper/ransom)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'viruses', desc: 'List crafted malware payloads and trade value', category: 'PAYLOADS & MALWARE' },
  { cmd: 'usevirus <id>', desc: 'Deploy crafted virus on active target node', category: 'PAYLOADS & MALWARE' },

  // --- DATA & CRACKING ---
  { cmd: 'exfil <file>', desc: 'Extract financial assets. Trace +25%, Heat +10%', category: 'DATA & CRACKING' },
  { cmd: 'rclone', desc: 'Mass exfiltration of corporate data (HIGH/ELITE nodes, root required)', category: 'DATA & CRACKING' },
  { cmd: 'download <file>', desc: 'Save remote file locally for offline use', category: 'DATA & CRACKING' },
  { cmd: 'hashcat <file>', desc: 'Crack hashes (-d for distributed botnet pool)', category: 'DATA & CRACKING' },
  { cmd: 'john <file>', desc: 'CPU-optimized local password cracker. Download hash file first', category: 'DATA & CRACKING' },
  { cmd: 'fence intel', desc: 'Sell exfiltrated Corporate Intel on the Darknet', category: 'DATA & CRACKING' },

  // --- ECONOMY & ITEMS ---
  { cmd: 'use decoy', desc: 'Deploy a Trace Decoy — Trace −30% (find in target files)', category: 'ECONOMY & ITEMS' },
  { cmd: 'use burner', desc: 'Burn a Burner VPN — Heat −25% (find in target files)', category: 'ECONOMY & ITEMS' },
  { cmd: 'use 0day', desc: 'Instant root via Zero-Day — no logging (find in target files)', category: 'ECONOMY & ITEMS' },
  { cmd: 'contracts', desc: 'View AI fixer contracts board', category: 'ECONOMY & ITEMS' },
  { cmd: 'market', desc: 'Open unified Market Hub — commodities, software, hardware, rig management', category: 'ECONOMY & ITEMS' },
  { cmd: 'buy <item> <qty>', desc: 'Buy a commodity at current market price', category: 'ECONOMY & ITEMS' },
  { cmd: 'sell <item> <qty>', desc: 'Sell a commodity from your stash', category: 'ECONOMY & ITEMS' },
  { cmd: 'tradevirus <id>', desc: 'Trade crafted malware on darknet exchange for BTC', category: 'ECONOMY & ITEMS' },
  { cmd: 'shop / hardware / rig', desc: 'Legacy aliases → opens the unified Market Hub', category: 'ECONOMY & ITEMS' },

  // --- MORALITY ---
  { cmd: 'assist', desc: 'When prompted: quietly help a civilian — raises SIGNAL score', category: 'MORALITY' },
  { cmd: 'crashpc', desc: 'When prompted: brick a civilian machine — raises CHAOS score', category: 'MORALITY' },
  { cmd: 'salvage', desc: 'When prompted: recover a hidden power-up from a civilian node', category: 'MORALITY' },

  // --- STORY EVENTS ---
  { cmd: 'cat intercept.log', desc: 'Trigger an AI-generated moral dilemma on the current node', category: 'STORY EVENTS' },
  { cmd: 'resolve 1', desc: 'Take the heroic path — lower payout, raises SIGNAL', category: 'STORY EVENTS' },
  { cmd: 'resolve 2', desc: 'Take the ruthless path — higher payout, raises CHAOS', category: 'STORY EVENTS' },

  // --- SYSTEM & NAV ---
  { cmd: 'travel <region>', desc: 'Reroute gateway — us-gov, ru-darknet, cn-financial, eu-central', category: 'SYSTEM & NAV' },
  { cmd: 'status', desc: 'Operator report: wanted level, botnet, morality, inventory', category: 'SYSTEM & NAV' },
  { cmd: 'ls / cd / pwd', desc: 'Navigate remote file systems', category: 'SYSTEM & NAV' },
  { cmd: 'cat <file>', desc: 'Read file contents (AI-generated)', category: 'SYSTEM & NAV' },
  { cmd: 'exit', desc: 'Disconnect from current node before trace hits 100%', category: 'SYSTEM & NAV' },
  { cmd: 'clear', desc: 'Clear terminal output', category: 'SYSTEM & NAV' },
  { cmd: 'save', desc: 'Save current progress', category: 'SYSTEM & NAV' },
  { cmd: 'menu', desc: 'Auto-save and return to main menu', category: 'SYSTEM & NAV' },
];
const DEV_COMMANDS = [
  { cmd: 'sudo devmode', desc: 'Toggle Developer Godmode' },
  { cmd: 'dev.money <amt>', desc: 'Inject XMR' },
  { cmd: 'dev.item <id>', desc: 'Add shop item to inventory' },
  { cmd: 'dev.score <num>', desc: 'Override AI Director skill score' },
  { cmd: 'dev.reveal', desc: 'Remove fog of war from network map' }
];

const REGIONS = ['us-gov', 'ru-darknet', 'cn-financial', 'eu-central'];
const COMMODITIES = {
  cc_dumps: { name: 'CC Dumps', base: 20, vol: 15 },
  ssn_fullz: { name: 'SSN Fullz', base: 60, vol: 40 },
  botnets: { name: 'Botnet Access', base: 300, vol: 200 },
  exploits: { name: 'Exploit Kits', base: 1500, vol: 800 },
  zerodays: { name: 'Weaponized 0-Days', base: 25000, vol: 15000 },
};

const generateMarketPrices = () => {
  const prices = {};
  Object.keys(COMMODITIES).forEach(key => {
    const item = COMMODITIES[key];
    const variance = (Math.random() * item.vol * 2) - item.vol;
    prices[key] = Math.max(1, Math.floor(item.base + variance));
  });
  if (Math.random() < 0.2) {
    const keys = Object.keys(COMMODITIES);
    const crashedKey = keys[Math.floor(Math.random() * keys.length)];
    prices[crashedKey] = Math.floor(prices[crashedKey] * 0.2);
  } else if (Math.random() < 0.2) {
    const keys = Object.keys(COMMODITIES);
    const boomKey = keys[Math.floor(Math.random() * keys.length)];
    prices[boomKey] = Math.floor(prices[boomKey] * 2.5); 
  }
  return prices;
};

// ==========================================
// 3. AI AGENTS (FIXER, EMPLOYEES, BLUE TEAM)

export {
  HOURLY_RATE,
  COLORS,
  COMMAND_REGISTRY,
  DEV_COMMANDS,
  REGIONS,
  COMMODITIES,
  generateMarketPrices,
};
