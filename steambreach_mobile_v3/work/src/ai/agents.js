import { generateDirectorText } from './aiAdapter';

// ==========================================
// 3. AI AGENTS (FIXER, EMPLOYEES, BLUE TEAM)
// ==========================================

export const invokeBlueTeamAI = async (apiKey, playerCommand, nodeName, currentTrace, currentHeat) => {
  const prompt = `You are an elite, highly aggressive Cybersecurity SOC Analyst defending the network "${nodeName}". 
  An attacker (the player) has infiltrated your network. Their current Heat is ${currentHeat}% and you have traced them to ${currentTrace}%.
  They just attempted to run this command on your network: "${playerCommand}"
  
  Evaluate their command. Write a brutal, intimidating 1-2 sentence terminal message directly to the hacker. Let them know you see them, and mock their tools or their strategy. Do NOT break character. Do not use markdown. Start the message with: [SYSTEM_ADMIN]: `;

  try {
    const system = "You are a ruthless defensive AI in a cyberpunk hacking game. You represent the elite Blue Team. You are angry, cocky, and surgical. You want to terminate the player's connection.";
    return await generateDirectorText(prompt, system);
  } catch (e) {
    return `[SYSTEM_ADMIN]: I see your little '${playerCommand}' script. You're sloppy. I'm dropping your connection.`;
  }
};

export const ORG_TEMPLATES = {
  low: [
    { type: 'startup', names: ['NovaTech Solutions', 'BrightPath Digital', 'Apex Micro', 'CloudNine Labs', 'DataPulse Inc'] },
    { type: 'smallbiz', names: ['Greenfield Consulting', 'Metro Legal Group', 'Sunrise Healthcare', 'Pinnacle Realty', 'Harbor Financial'] },
    { type: 'personal', names: ['Desktop PC', 'Home Network', 'MacBook Pro', 'Public WiFi Client', 'Smart Home Hub'] } 
  ],
  mid: [
    { type: 'corporation', names: ['Meridian Systems Corp', 'Atlas Defense Group', 'Vanguard Biotech', 'Sentinel Networks', 'Ironclad Industries'] },
    { type: 'government', names: ['Regional Transit Authority', 'State Health Dept.', 'Municipal Water Board', 'County Records Office', 'Port Authority'] },
  ],
  high: [
    { type: 'military', names: ['NORTHCOM Relay Station', 'Naval Intelligence Archive', 'CYBERCOM Staging Node', 'DIA Regional Hub', 'NSA Collection Point'] },
    { type: 'financial', names: ['Goldman-Sterling Trust', 'Blackrock Vault Systems', 'Federal Reserve Node 7', 'SWIFT Relay Gateway', 'Deutsche Clearing House'] },
  ],
  elite: [
    { type: 'classified', names: ['ECHELON Substation', 'Project LOOKING GLASS', 'UMBRA Relay', 'STELLAR WIND Archive', 'PRISM Collection Node'] },
  ]
};

export const FIRST_NAMES = ['James','Sarah','Mike','Elena','David','Lisa','Robert','Anna','Kevin','Maria','Tom','Rachel','Chris','Diana','Alex','Nina','Steve','Julia','Mark','Yuki'];
export const LAST_NAMES = ['Chen','Williams','Petrov','Garcia','Kim','Mueller','Okafor','Tanaka','Singh','Anderson','Reeves','Costa','Nakamura','Walsh','Ibrahim','Novak','Park','Foster','Dubois','Sharma'];
export const ROLES = {
  low: ['IT Support', 'Junior Dev', 'Office Manager', 'Intern', 'Receptionist'],
  mid: ['Sysadmin', 'Network Engineer', 'DBA', 'Security Analyst', 'DevOps Lead', 'VP Engineering'],
  high: ['CISO', 'Director of Operations', 'Senior Analyst', 'Incident Commander', 'Threat Hunter'],
  elite: ['Station Chief', 'Signals Officer', 'Crypto Analyst', 'Black Ops Coordinator']
};

export const generateEmployee = (tier, index) => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const roles = ROLES[tier] || ROLES.mid;
  const role = roles[index % roles.length];
  const passStyles = ['Spring2026!', `${first.toLowerCase()}123`, 'P@ssw0rd', 'admin123', `${last.toLowerCase()}!${Math.floor(Math.random()*99)}`, 'Welcome1!', 'Changeme1'];
  
  const personalities = [
    "paranoid and suspicious, assumes everyone is a threat",
    "grumpy, exhausted, just wants to go home",
    "funny, easily distracted, prone to oversharing",
    "overly corporate, strict about rules, folds if you impersonate a C-level executive",
    "gullible and helpful, eager to please but slightly incompetent",
    "new hire, nervous, afraid of getting fired, follows any authority figure",
    "burnt-out veteran who doesn't care anymore, will give up info if you're persistent",
    "arrogant tech-bro, thinks he is smarter than everyone, will give up info if you challenge his ego or intelligence",
    "tech-illiterate older employee, deeply confused by computers, will do whatever IT tells them to do",
    "disgruntled worker who actively hates the company, will happily give up passwords if you promise it will cause chaos for management",
    "frantic multi-tasker, dealing with 5 emergencies at once, will blindly approve things just to get you to stop messaging them",
    "office gossip, completely ignores security if you offer them juicy rumors about other coworkers",
    "overly friendly, treats everyone like a best friend, easily manipulated by kindness and small talk",
    "chaotic intern, literally does not care about rules, will trade corporate secrets for a steam gift card or pizza",
    "hyper-vigilant cybersecurity student, needs a flawless, highly technical pretext to even engage with you"
  ];
  
  return {
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}`,
    role,
    password: passStyles[Math.floor(Math.random() * passStyles.length)],
    personality: personalities[Math.floor(Math.random() * personalities.length)]
  };
};

export const generateOrgNarrative = (tier) => {
  const templates = ORG_TEMPLATES[tier] || ORG_TEMPLATES.mid;
  const template = templates[Math.floor(Math.random() * templates.length)];
  let orgName = template.names[Math.floor(Math.random() * template.names.length)];
  
  let employeeCount = tier === 'low' ? 3 : tier === 'mid' ? 5 : tier === 'high' ? 4 : 3;
  if (template.type === 'personal') employeeCount = Math.floor(Math.random() * 2) + 1; 
  
  const employees = Array.from({ length: employeeCount }, (_, i) => {
    const emp = generateEmployee(tier, i);
    if (template.type === 'personal') emp.role = i === 0 ? 'Admin / Owner' : 'Guest User';
    return emp;
  });
  
  if (template.type === 'personal') {
    orgName = `${employees[0].name.split(' ')[0]}'s ${orgName}`;
  }
  
  const secrets = [];
  if (template.type === 'personal') {
    secrets.push(`[OSINT] Target appears to be an unencrypted civilian device.`);
  } else {
    if (employees.length >= 2) {
      const e1 = employees[0], e2 = employees[1];
      secrets.push(`${e1.name} recently complained to HR about ${e2.name}'s access privileges.`);
      secrets.push(`${e2.name} has been storing credentials in a plaintext file on the shared drive.`);
    }
    if (employees.length >= 3) {
      secrets.push(`${employees[2].name} is interviewing at a competitor and has been exfiltrating client lists.`);
    }
  }
  
  return { orgName, type: template.type, employees, secrets };
};

// 1. The Base OS (Applies to ALL computers)
const BASE_OS_SKELETON = {
  // 1. OS Profiles (Different roots for different machines)
const OS_PROFILES = {
  workstation: {
    dirs: ['home', 'home/user', 'home/user/.ssh', 'Applications', 'tmp', 'Library'],
    files: { 
      'home/user': ['.bashrc', 'notes.txt'], 
      'home/user/.ssh': ['id_rsa', 'known_hosts'], 
      'tmp': ['.bash_history'] 
    }
  },
  server: {
    dirs: ['etc', 'etc/ssh', 'var', 'var/log', 'tmp', 'root', 'bin'],
    files: { 
      'etc': ['passwd', 'shadow', 'fstab'], 
      'etc/ssh': ['sshd_config'], 
      'var/log': ['syslog', 'auth.log'], 
      'tmp': ['.bash_history', 'syslog.tmp'], 
      'root': ['deploy.sh'] 
    }
  },
  mainframe: {
    dirs: ['SYS', 'SYS/CONFIG', 'SECURE_LOGS', 'tmp', 'root', 'bin'],
    files: { 
      'SYS/CONFIG': ['routing.conf', 'firewall.rules'], 
      'SECURE_LOGS': ['access.log', 'auth_failures.log'], 
      'tmp': ['.bash_history'] 
    }
  }
};

// 2. The Org Themes (Where the juicy stuff goes, NO duplicate keys)
const FILE_SYSTEM_THEMES = {
  personal: {
    dirs: ['home/user/documents', 'home/user/pictures', 'home/user/downloads', 'home/user/desktop', 'home/user/private'],
    files: {
      'home/user/documents': ['tax_return_2025.pdf', 'bank_statements.pdf'],
      'home/user/private': ['passwords.txt', 'seed_phrase.txt', 'blackmail_material.zip'],
      'home/user/downloads': ['browser_history.sqlite']
    }
  },
  startup: {
    dirs: ['opt/app', 'var/www/html', 'opt/aws'],
    files: {
      'opt/app': ['server.js', '.env', 'docker-compose.yml', 'db_seed.sql'],
      'var/www/html': ['index.html', 'user_metrics.csv'],
      'opt/aws': ['api_keys.env', 'aws_billing.xlsx']
    }
  },
  smallbiz: {
    dirs: ['mnt/accounting', 'mnt/hr', 'mnt/clients', 'mnt/legal'],
    files: {
      'mnt/accounting': ['payroll_2026.xlsx', 'tax_returns.pdf'],
      'mnt/clients': ['client_list.csv'],
      'mnt/legal': ['lawsuit_settlement.docx', 'vendor_contracts.zip']
    }
  },
  corporation: {
    dirs: ['mnt/file-server', 'mnt/file-server/shared', 'mnt/rd', 'mnt/patents'],
    files: {
      'mnt/file-server': ['company_data.zip', 'offshore_routing.csv'],
      'mnt/file-server/shared': ['q4_earnings_unreleased.pdf', 'layoff_list.xlsx'],
      'mnt/patents': ['patent_draft_994.docx'],
      'mnt/rd': ['source_code_master.zip']
    }
  },
  government: {
    dirs: ['mnt/public_works', 'mnt/internal_affairs', 'mnt/surveillance'],
    files: {
      'mnt/public_works': ['voter_registry.sql', 'budget_deficit.xlsx'],
      'mnt/internal_affairs': ['subpoena_targets.docx', 'informant_list.csv'],
      'mnt/surveillance': ['city_camera_feeds.mp4']
    }
  },
  military: {
    dirs: ['mnt/intel', 'mnt/drone_ops', 'mnt/sigint'],
    files: {
      'mnt/intel': ['target_package_bravo.enc', 'black_budget.xlsx'],
      'mnt/sigint': ['sat_recon_raw.ts'],
      'mnt/drone_ops': ['roe_directives.pdf', 'troop_manifest.csv']
    }
  },
  financial: {
    dirs: ['mnt/db-server-backups', 'mnt/vault', 'mnt/aml'],
    files: {
      'mnt/db-server-backups': ['vip_offshore_accounts.sql', 'wire_transfers_pending.csv'],
      'mnt/vault': ['crypto_cold_wallet.dat', 'swift_keys.pgp'],
      'mnt/aml': ['aml_flagged.xlsx']
    }
  },
  classified: {
    dirs: ['opt/umb_alpha', 'opt/stellar', 'opt/zero_days'],
    files: {
      'opt/umb_alpha': ['nsa_rootkit_src.zip'],
      'opt/stellar': ['project_chimera.pdf', 'foreign_asset_list.enc'],
      'opt/zero_days': ['weaponized_payload_v2.bin', 'blackmail_cache.tar.gz']
    }
  }
};

export const generateOrgFileSystem = (org, tier, layout) => {
  const theme = FILE_SYSTEM_THEMES[org.type] || FILE_SYSTEM_THEMES.corporation;
  
  let filesObj = { '/': [] };
  let contents = {};

  // Helper: Build folders safely
  const buildDirs = (dirList) => {
    dirList.forEach(dir => {
      filesObj[`/${dir}`] = [];
      // Also ensure root knows about the top-level folders
      const topLevel = dir.split('/')[0];
      if (!filesObj['/'].includes(`${topLevel}/`)) {
        filesObj['/'].push(`${topLevel}/`);
      }
    });
  };

  // Helper: Place files & lock them if high tier
  const placeFiles = (fileMap) => {
    Object.keys(fileMap).forEach(folderName => {
      const targetDir = `/${folderName}`;
      const finalDir = filesObj[targetDir] ? targetDir : '/';
      
      // Pick 1 to 3 random files from the available list to keep it fresh
      const count = Math.floor(Math.random() * 3) + 1;
      const selectedFiles = [...fileMap[folderName]].sort(() => 0.5 - Math.random()).slice(0, count);
      
      selectedFiles.forEach(file => {
        filesObj[finalDir].push(file);
        const fullPath = `${finalDir}/${file}`;
        const isLocked = (tier === 'high' || tier === 'elite') ? '[LOCKED] ' : '';
        
        if (file.endsWith('.sql') || file.endsWith('.env') || file.endsWith('.pgp') || file.endsWith('.sqlite')) {
          contents[fullPath] = `${isLocked}[HASH] SHA-512 System Hashes: df98a2b1c...`;
        } else {
          contents[fullPath] = `${isLocked}[PENDING_GENERATION]`;
        }
      });
    });
  };
  
let osProfile;
  if (org.type === 'personal') {
    osProfile = OS_PROFILES.workstation;
  } else if (['government', 'military', 'classified'].includes(org.type)) {
    osProfile = OS_PROFILES.mainframe;
  } else {
    osProfile = OS_PROFILES.server;
  }
  
  // 1. Build the Base Linux OS
  buildDirs(BASE_OS_SKELETON.dirs);
  placeFiles(BASE_OS_SKELETON.files);

  // 2. Layer the unique Org Theme on top
  buildDirs(theme.dirs);
  placeFiles(theme.files);

  // 3. Inject Employee Emails
  const mailFiles = [];
  org.employees.forEach((emp, idx) => {
    const filename = `msg_${String(idx + 1).padStart(3, '0')}.eml`;
    mailFiles.push(filename);
    contents[`/mail/${filename}`] = '[LORE_PENDING]';
  });
  filesObj['/mail'] = mailFiles;

  // 4. Random Consumable Drops (Decoys, Burners, Wallets)
  const allDirs = Object.keys(filesObj).filter(d => d !== '/'); // Don't drop in root
  const randomDir = () => allDirs[Math.floor(Math.random() * allDirs.length)] || '/tmp';
  
  if (Math.random() < 0.20) filesObj[randomDir()].push('decoy.bin');
  if (Math.random() < 0.15) filesObj[randomDir()].push('burner.ovpn');
  if (tier === 'high' || tier === 'elite') {
    if (Math.random() < 0.15) filesObj[randomDir()].push('0day_poc.sh');
  }
  if (tier === 'low' || tier === 'mid') {
    if (Math.random() < 0.25) filesObj[randomDir()].push('wallet.dat');
  }

  // 5. STORY TRIGGER FILES (Contextual per org type)
  const STORY_FILES = {
    personal:    { file: 'deleted_messages.rec',       dir: '/home/user/private' },
    startup:     { file: 'founder_emails_leaked.mbox', dir: '/opt/aws' },
    smallbiz:    { file: 'blackmail_draft.eml',        dir: '/mnt/legal' },
    corporation: { file: 'whistleblower_report.enc',   dir: '/mnt/file-server/shared' },
    government:  { file: 'witness_relocation.db',      dir: '/mnt/internal_affairs' },
    military:    { file: 'friendly_fire_coverup.pdf',  dir: '/mnt/intel' },
    financial:   { file: 'cartel_routing_keys.pgp',    dir: '/mnt/aml' },
    classified:  { file: 'asset_termination_order.enc',dir: '/opt/umb_alpha' },
  };

  const storyTrigger = STORY_FILES[org.type] || STORY_FILES.corporation;
  const triggerDir = storyTrigger.dir;
  const targetDir = filesObj[triggerDir] ? triggerDir : '/tmp';
  
  if (!filesObj[targetDir].includes(storyTrigger.file)) {
    filesObj[targetDir].push(storyTrigger.file);
  }
  contents[`${targetDir}/${storyTrigger.file}`] = '[STORY_TRIGGER]';

  return { files: filesObj, contents };
};

export const generateInterceptedComms = async (targetIP, nodeData, apiKey) => {
  const orgName = nodeData?.org?.orgName || "Unknown Corp";
  const employees = nodeData?.org?.employees || [];
  
  const prompt = `You are an automated packet sniffer (ettercap) intercepting unencrypted internal traffic at ${orgName} (${targetIP}).
  The following employees are active: ${employees.map(e => `${e.name} (${e.role})`).join(', ')}.
  
  Generate a snippet of 3-4 intercepted communications. 
  Include:
  - One internal automated system log (e.g., backup started).
  - One or two brief chat messages or emails between the employees listed above.
  - One "leak" or "clue" (e.g., mentioning a password style, a sensitive file path, or a coworker's bad security habits).
  
  Format it like a raw terminal dump. Use timestamps like [HH:mm:ss]. 
  Do NOT use markdown. Do NOT explain the output.`;

  try {
    return await generateDirectorText(prompt, "");
  } catch (e) {
    return `[14:02:11] SRC: ${targetIP} -> DST: 10.0.0.1 [TCP] PUSH, ACK\n[14:02:12] UNENCRYPTED SMTP TRAFFIC DETECTED\n[14:02:15] DATA: "Hey, did you change the root pass? I can't get into the vault."`;
  }
};

export const generateAIContract = async (targetIP, nodeData, currentRep, arg4, arg5) => {
  const world = typeof arg4 === 'object' && arg4 !== null ? arg4 : {};
  const apiKey = typeof arg4 === 'string' ? arg4 : arg5;

  let minProb = 1;
  if (currentRep < 25) minProb = 75;
  else if (currentRep < 80) minProb = 50;
  else if (currentRep < 200) minProb = 10;

  const prob = Math.floor(Math.random() * (100 - minProb + 1)) + minProb;

  let timeLimit, heatCap, minRep, maxRep, numTargets, riskLabel;
  let rewardScalar, timePressureMult, heatRestrictionMult;

  if (prob <= 9) {
    numTargets = Math.floor(Math.random() * 2) + 3;
    timeLimit = 180;
    heatCap = 35;
    minRep = 100;
    maxRep = 250;
    riskLabel = 'EXTREME';
    rewardScalar = 1.12;
    timePressureMult = 1.35;
    heatRestrictionMult = 1.28;
  } else if (prob <= 49) {
    numTargets = Math.floor(Math.random() * 2) + 2;
    timeLimit = 240;
    heatCap = 45;
    minRep = 50;
    maxRep = 120;
    riskLabel = 'HIGH';
    rewardScalar = 0.95;
    timePressureMult = 1.22;
    heatRestrictionMult = 1.18;
  } else if (prob <= 74) {
    numTargets = Math.floor(Math.random() * 2) + 1;
    timeLimit = 300;
    heatCap = 75;
    minRep = 20;
    maxRep = 55;
    riskLabel = 'MODERATE';
    rewardScalar = 0.82;
    timePressureMult = 1.08;
    heatRestrictionMult = 1.05;
  } else {
    numTargets = 1;
    timeLimit = 600;
    heatCap = 90;
    minRep = 10;
    maxRep = 25;
    riskLabel = 'LOW';
    rewardScalar = 0.72;
    timePressureMult = 0.95;
    heatRestrictionMult = 0.98;
  }

  const getNodeValue = (node) => {
    if (node && typeof node.val === 'number' && node.val > 0) return node.val;
    const secBase = { low: 2500, mid: 9000, high: 30000, elite: 90000 };
    return secBase[node?.sec] || 2500;
  };

  const availableIPs = Object.keys(world).filter(
    (ip) => ip !== 'local' && ip !== targetIP && world[ip] && !world[ip].isHidden
  );
  const shuffledIPs = [...availableIPs].sort(() => 0.5 - Math.random());
  const actualNumTargets = Math.min(numTargets, 1 + shuffledIPs.length);
  const selectedIPs = [targetIP, ...shuffledIPs].slice(0, actualNumTargets);

  // 1. Add the new types to the pool
  const actionTypes = ['exfil', 'destroy', 'ransom', 'mine', 'sniff', 'breach'];
  
  // 2. Set the payout multipliers for the new jobs
  const actionValueMult = {
    exfil: 1.0,
    destroy: 1.18,
    ransom: 1.32,
    mine: 0.85,    // Mining is passive income, so upfront bounty is slightly lower
    sniff: 1.10,   // Espionage/Wiretapping pays well
    breach: 1.40,  // Mass rclone extraction is highly lucrative
  };

  const objectives = [];
  let totalObjectiveValue = 0;

  for (let i = 0; i < selectedIPs.length; i++) {
    const ip = selectedIPs[i];
    const node = ip === targetIP ? nodeData : world[ip];
    if (!node) continue;

    const type = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    let targetFile = null;

    if (type === 'exfil') {
      const allFiles = [];
      if (node.files && typeof node.files === 'object') {
        Object.keys(node.files).forEach((dir) => {
          const dirFiles = node.files[dir];
          if (Array.isArray(dirFiles)) {
            dirFiles.forEach((f) => {
              if (
                !f.endsWith('/') &&
                f !== '.bash_history' &&
                !f.endsWith('.tmp') &&
                !f.endsWith('.eml')
              ) {
                allFiles.push(f);
              }
            });
          }
        });
      }
      targetFile = allFiles.length > 0
        ? allFiles[Math.floor(Math.random() * allFiles.length)]
        : 'proprietary_data.zip';
    }

    // 3. Add the UI labels for the new jobs
    let label = '';
    if (type === 'exfil') label = `Exfiltrate ${targetFile || 'proprietary_data.zip'} from ${node?.org?.orgName || 'target node'}`;
    else if (type === 'destroy') label = `Destroy the target environment at ${node?.org?.orgName || 'target node'}`;
    else if (type === 'ransom') label = `Deploy ransomware against ${node?.org?.orgName || 'target node'}`;
    else if (type === 'mine') label = `Deploy xmrig cryptominer on ${node?.org?.orgName || 'target node'}`;
    else if (type === 'sniff') label = `Intercept internal comms (ettercap) at ${node?.org?.orgName || 'target node'}`;
    else if (type === 'breach') label = `Execute mass data breach (rclone) on ${node?.org?.orgName || 'target node'}`;

    const nodeValue = getNodeValue(node);
    const objectiveValue = Math.floor(nodeValue * (actionValueMult[type] || 1));

    objectives.push({
      ip,
      name: node?.org?.orgName || 'Unknown Node',
      type,
      targetFile,
      label,
      sec: node?.sec || 'mid',
      nodeValue,
      objectiveValue,
    });

    totalObjectiveValue += objectiveValue;
  }

  const objectiveCountMult = 0.92 + (objectives.length * 0.14);
  const rewardBase =
    totalObjectiveValue *
    rewardScalar *
    timePressureMult *
    heatRestrictionMult *
    objectiveCountMult;
  const rewardJitter = 0.92 + (Math.random() * 0.16);
  const reward = Math.max(1200, Math.floor(rewardBase * rewardJitter));

  const repBase = Math.max(
    minRep,
    Math.floor(
      (reward / 1200) *
      (prob <= 9 ? 1.5 : prob <= 49 ? 1.2 : prob <= 74 ? 0.9 : 0.6)
    )
  );
  const repReward = Math.min(maxRep, Math.max(minRep, repBase));

  const primaryOrg = nodeData?.org?.orgName || 'Unknown Target';
  const primaryType = nodeData?.org?.type || 'unknown';

  const clientPool = [
    'disgruntled insider',
    'rival contractor',
    'silent broker',
    'burned former employee',
    'fixer representing an unnamed buyer'
  ];
  const motivePool = [
    'wants pressure applied without public attribution',
    'needs the target disrupted before an internal review',
    'is trying to erase leverage held by the target',
    'is paying for damage, not spectacle'
  ];

  const client = clientPool[Math.floor(Math.random() * clientPool.length)];
  const motive = motivePool[Math.floor(Math.random() * motivePool.length)];

  const fallbackContract = {
    probability: prob,
    objectives,
    desc: `[FIXER DOSSIER] ${client} says ${primaryOrg} is exposed.`,
    briefing: `A ${client} has put ${primaryOrg} on the board. The buyer ${motive}. The target is not random, and the money says the damage needs to feel deliberate.`,
    client,
    motive,
    targetProfile: `${primaryOrg} • ${primaryType.toUpperCase()} • ${nodeData?.sec?.toUpperCase() || 'MID'} SECURITY`,
    knownConditions: [
      "Target perimeter looks ordinary, but internal exposure may be easier than it appears."
    ],
    complication: "Blue Team may respond aggressively if you get loud.",
    riskLabel,
    timeLimit,
    reward,
    repReward,
    heatCap,
    forbidden_tools: [],
    isAmbush: prob <= 20 && Math.random() < 0.2
  };

  const prompt = `You are a high-stakes darknet fixer. Write a premium mission dossier.

Context:
- Client Type: ${client}
- Direct Motive: ${motive}
- Primary Target: ${primaryOrg} (${primaryType})
- Security Tier: ${nodeData?.sec || 'mid'}
- Objectives: ${objectives.map((o, i) => `${i + 1}. ${o.label}`).join(', ')}

Rules:
1. Write with mystery and professional detachment.
2. The 'desc' should be a punchy one-sentence hook for the UI card.
3. The 'briefing' must be 2-4 sentences explaining the "why" without giving away the "how".
4. Do NOT include tool names or step-by-step instructions.

Return ONLY raw JSON:
{
  "desc": "string",
  "briefing": "string",
  "client": "${client}",
  "motive": "${motive}",
  "targetProfile": "string",
  "knownConditions": ["condition 1", "condition 2"],
  "complication": "string"
}`;

  try {
    let aiText = await generateDirectorText(prompt, '');
    aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return {
        ...fallbackContract,
        desc: parsedData.desc || fallbackContract.desc,
        briefing: parsedData.briefing || fallbackContract.briefing,
        client: parsedData.client || fallbackContract.client,
        motive: parsedData.motive || fallbackContract.motive,
        targetProfile: parsedData.targetProfile || fallbackContract.targetProfile,
        knownConditions: parsedData.knownConditions || fallbackContract.knownConditions,
        complication: parsedData.complication || fallbackContract.complication
      };
    } else {
      return fallbackContract;
    }
  } catch (e) {
    return fallbackContract;
  }
};
