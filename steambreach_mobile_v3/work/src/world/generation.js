// Split from UpdatedPeople.jsx

import { generateOrgNarrative, generateOrgFileSystem } from '../ai/agents';
import { pickWeightedTier } from '../ai/director';

const generateNewTarget = (forcedTier = null, parentIP = null, directorMods = null, parentNode = null) => {
  const octet = () => Math.floor(Math.random() * 255);
  const ip = `${octet()}.${octet()}.${octet()}.${octet()}`;
  const tiers = ['low', 'mid', 'high'];
  const sec = forcedTier || (directorMods ? pickWeightedTier(directorMods.tierWeights) : tiers[Math.floor(Math.random() * tiers.length)]);
  const activeSec = sec === 'elite' ? 'high' : sec;

  // --- NEW: CLUSTERING MATH ---
  let nodeX, nodeY;
  if (parentNode && parentNode.x && parentNode.y) {
    const px = parseFloat(parentNode.x);
    const py = parseFloat(parentNode.y);
    // Spawn within a tight 8% radius of the parent node
    nodeX = `${Math.max(5, Math.min(95, px + (Math.random() * 16 - 8)))}%`;
    nodeY = `${Math.max(5, Math.min(85, py + (Math.random() * 16 - 8)))}%`;
  } else {
    // Normal random spawn
    nodeX = `${Math.floor(Math.random() * 85 + 7)}%`;
    nodeY = `${Math.floor(Math.random() * 55 + 10)}%`;
  }

  const layouts = {
    low: [
      { dirs: ['home', 'user', 'desktop'], file: 'wallet.txt' },
      { dirs: ['temp', 'downloads', 'cache'], file: 'session.bin' },
      { dirs: ['public', 'shares', 'docs'], file: 'emails.txt' }
    ],
    mid: [
      { dirs: ['var', 'backups', 'daily'], file: 'archive.zip' },
      { dirs: ['opt', 'server', 'db'], file: 'db_dump.sql' },
      { dirs: ['var', 'log', 'system'], file: 'admin_notes.log' },
      { dirs: ['etc', 'shadow', 'hashes'], file: 'passwd.bak' }
    ],
    high: [
      { dirs: ['sys', 'core', 'vault'], file: 'assets.db' },
      { dirs: ['etc', 'shadow', 'hashes'], file: 'sys.hashes' },
      { dirs: ['mnt', 'secure', 'comms'], file: 'incident_report.msg' }
    ],
    elite: [
      { dirs: ['shadow', 'mainframe', 'core'], file: 'blackbox.db' },
      { dirs: ['kernel', 'zero', 'ring'], file: 'classified_briefing.txt' },
      { dirs: ['etc', 'security', 'vault'], file: 'root.hashes' }
    ]
  };

  const tierLayouts = layouts[sec] || layouts['high'];
  const layout = tierLayouts[Math.floor(Math.random() * tierLayouts.length)];

  let val = 0;
  if (sec === 'elite') val = Math.floor(Math.random() * 100000 + 150000);
  else if (sec === 'high') val = Math.floor(Math.random() * 50000 + 50000);
  else if (sec === 'mid') val = Math.floor(Math.random() * 20000 + 10000);
  else val = Math.floor(Math.random() * 4000 + 1000);

  const org = generateOrgNarrative(sec);
  const { files, contents } = generateOrgFileSystem(org, sec, layout);

  const exploits = [
    { port: 22, svc: 'ssh', exp: 'hydra' },
    { port: 80, svc: 'http', exp: 'sqlmap' },
    { port: 445, svc: 'smb', exp: 'msfconsole' },
    { port: 8080, svc: 'http-alt', exp: 'curl' }
  ];
  const vuln = exploits[Math.floor(Math.random() * exploits.length)];

  const blueTeam = { alertLevel: 0, patchedVulns: [], changedPasswords: [], activeHunting: false, lastIncident: null };

  return {
    ip,
    data: {
      name: org.orgName, sec: activeSec, isHidden: sec === 'elite',
      port: vuln.port, svc: vuln.svc, exp: vuln.exp,
      isHoneypot: Math.random() < (directorMods?.honeypotChance || 0.15),
      val, x: `${Math.floor(Math.random() * 85 + 7)}%`, y: `${Math.floor(Math.random() * 55 + 10)}%`,
      parentIP, files, contents, org, blueTeam, commsGenerated: false, slackChannelGenerated: false,
    }
  };
};

const DEFAULT_WORLD = {
  local: {
    files: { '/': ['home/'], '/home': ['operator/'], '/home/operator': ['readme.txt', 'contracts/'], '/home/operator/contracts': [] },
    contents: { '/home/operator/readme.txt': `HEXOVERRIDE OPERATOR TERMINAL v3.0\n────────────────────────────────────\nSTART: Run 'nmap' to discover your first target.\nUse [TAB] to open the Command Reference Manual at any time.` }
  }
};

// ==========================================
// 7. UI COMPONENTS

export {
  generateNewTarget,
  DEFAULT_WORLD,
};
