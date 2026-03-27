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
  // --- RECON & INITIAL ACCESS ---
  { cmd: 'nmap [ip]', desc: 'Scan network or specific target', category: 'RECON & ACCESS' },
  { cmd: 'hydra <ip>', desc: 'Brute-force SSH credentials', category: 'RECON & ACCESS' },
  { cmd: 'sqlmap <ip>', desc: 'SQL injection attack', category: 'RECON & ACCESS' },
  { cmd: 'msfconsole <ip>', desc: 'Exploit unpatched SMB', category: 'RECON & ACCESS' },
  { cmd: 'curl <ip>', desc: 'Exploit HTTP/LFI vulnerability', category: 'RECON & ACCESS' },
  { cmd: 'spearphish <e>', desc: 'Social engineer an employee', category: 'RECON & ACCESS' },

  // --- PRIVILEGE ESCALATION ---
  { cmd: 'pwnkit', desc: 'Privilege escalation to root', category: 'PRIVILEGE ESCALATION' },
  { cmd: 'ssh <user@ip> <pass>', desc: 'Log in using stolen credentials (0 trace)', category: 'PRIVILEGE ESCALATION' },
  { cmd: 'sendmail -to <u कक्ष> -attach <f>', desc: 'Spoof internal emails (requires shell)', category: 'PRIVILEGE ESCALATION' },

  // --- BOTNET & C2 CONTROL ---
  { cmd: 'ettercap', desc: 'ARP poison + sniff network comms', category: 'BOTNET & C2' },
  { cmd: 'sliver', desc: 'Deploy C2 botnet beacon (root)', category: 'BOTNET & C2' },
  { cmd: 'chisel', desc: 'Create SOCKS5 proxy tunnel (root)', category: 'BOTNET & C2' },
  { cmd: 'disconnect <ip>', desc: 'Remove proxy or botnet node', category: 'BOTNET & C2' },
  { cmd: 'hping3 <ip>', desc: 'Botnet SYN flood DDoS attack', category: 'BOTNET & C2' },
  { cmd: 'mimikatz <ip>', desc: 'Dump LSASS creds from botnet node', category: 'BOTNET & C2' },
  { cmd: 'stash <file>', desc: 'Stage exfil through botnet', category: 'BOTNET & C2' },
  
  // --- PAYLOADS & MALWARE ---
  { cmd: 'msfvenom <arg>', desc: 'Deploy viral payloads (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'eternalblue <arg>', desc: 'Mass SMBv1 propagation (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'reptile <arg>', desc: 'Install stealth kernel rootkit (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'xmrig <arg>', desc: 'Deploy cryptominer for passive XMR (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'shred <arg>', desc: 'Destroy target file system (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'openssl <arg>', desc: 'Deploy ransomware payload (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'crontab <arg>', desc: 'Schedule logic bombs (root)', category: 'PAYLOADS & MALWARE' },
  { cmd: 'wipe', desc: 'Scrub system logs (root)', category: 'PAYLOADS & MALWARE' },

  // --- EXFILTRATION & CRACKING ---
  { cmd: 'exfil <file>', desc: 'Extract financial assets', category: 'DATA & CRACKING' },
  { cmd: 'rclone', desc: 'Mass exfiltration of corporate data', category: 'DATA & CRACKING' },
  { cmd: 'download <file>', desc: 'Save remote file locally', category: 'DATA & CRACKING' },
  { cmd: 'hashcat <file>', desc: 'Crack hashes (-d for botnet pool)', category: 'DATA & CRACKING' },
  { cmd: 'john <file>', desc: 'CPU-optimized local password cracker', category: 'DATA & CRACKING' },
  { cmd: 'fence intel', desc: 'Sell exfiltrated data on the Darknet', category: 'DATA & CRACKING' },

  // --- ECONOMY & PROGRESSION ---
  { cmd: 'use <item>', desc: 'Consume a hidden item (decoy, burner, 0day)', category: 'ECONOMY & ITEMS' },
  { cmd: 'contracts', desc: 'View AI fixer contracts board', category: 'ECONOMY & ITEMS' },
  { cmd: 'market', desc: 'Open Black Market Trading UI', category: 'ECONOMY & ITEMS' },
  { cmd: 'shop', desc: 'Access darknet software market', category: 'ECONOMY & ITEMS' },
  { cmd: 'hardware', desc: 'Open hardware marketplace — buy/sell/build your rig', category: 'ECONOMY & ITEMS' },
  { cmd: 'rig', desc: 'Alias for hardware marketplace', category: 'ECONOMY & ITEMS' },
  
  // --- SYSTEM & NAVIGATION ---
  { cmd: 'travel <region>', desc: 'Route gateway to new global subnet', category: 'SYSTEM & NAV' },
  { cmd: 'status', desc: 'View operator threat assessment & inventory', category: 'SYSTEM & NAV' },
  { cmd: 'ls / cd / pwd', desc: 'Navigate file systems', category: 'SYSTEM & NAV' },
  { cmd: 'cat <file>', desc: 'Read file contents', category: 'SYSTEM & NAV' },
  { cmd: 'clear', desc: 'Clear terminal output', category: 'SYSTEM & NAV' },
  { cmd: 'save', desc: 'Save current progress', category: 'SYSTEM & NAV' },
  { cmd: 'menu', desc: 'Return to main menu', category: 'SYSTEM & NAV' }
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
