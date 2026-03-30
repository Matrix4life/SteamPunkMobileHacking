import { generateDirectorText } from './aiAdapter';

// ==========================================
// 3. AI AGENTS (FIXER, EMPLOYEES, BLUE TEAM)
// ==========================================

const invokeBlueTeamAI = async (apiKey, playerCommand, nodeName, currentTrace, currentHeat) => {
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

const ORG_TEMPLATES = {
  low: [
    { type: 'startup', names: ['NovaTech Solutions', 'BrightPath Digital', 'Apex Micro', 'CloudNine Labs', 'DataPulse Inc'] },
    { type: 'smallbiz', names: ['Greenfield Consulting', 'Metro Legal Group', 'Sunrise Healthcare', 'Pinnacle Realty', 'Harbor Financial'] },
    // --- ADDED CIVILIAN TARGETS ---
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

const FIRST_NAMES = ['James','Sarah','Mike','Elena','David','Lisa','Robert','Anna','Kevin','Maria','Tom','Rachel','Chris','Diana','Alex','Nina','Steve','Julia','Mark','Yuki'];
const LAST_NAMES = ['Chen','Williams','Petrov','Garcia','Kim','Mueller','Okafor','Tanaka','Singh','Anderson','Reeves','Costa','Nakamura','Walsh','Ibrahim','Novak','Park','Foster','Dubois','Sharma'];
const ROLES = {
  low: ['IT Support', 'Junior Dev', 'Office Manager', 'Intern', 'Receptionist'],
  mid: ['Sysadmin', 'Network Engineer', 'DBA', 'Security Analyst', 'DevOps Lead', 'VP Engineering'],
  high: ['CISO', 'Director of Operations', 'Senior Analyst', 'Incident Commander', 'Threat Hunter'],
  elite: ['Station Chief', 'Signals Officer', 'Crypto Analyst', 'Black Ops Coordinator']
};

const generateEmployee = (tier, index) => {
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

const generateOrgNarrative = (tier) => {
  const templates = ORG_TEMPLATES[tier] || ORG_TEMPLATES.mid;
  const template = templates[Math.floor(Math.random() * templates.length)];
  let orgName = template.names[Math.floor(Math.random() * template.names.length)];
  
  // Personal PCs usually only have 1 or 2 users (Owner and maybe a Guest/Family member)
  let employeeCount = tier === 'low' ? 3 : tier === 'mid' ? 5 : tier === 'high' ? 4 : 3;
  if (template.type === 'personal') employeeCount = Math.floor(Math.random() * 2) + 1; 
  
  const employees = Array.from({ length: employeeCount }, (_, i) => {
    const emp = generateEmployee(tier, i);
    // Assign personal roles instead of corporate titles
    if (template.type === 'personal') emp.role = i === 0 ? 'Admin / Owner' : 'Guest User';
    return emp;
  });
  
  // Dynamically name the PC after the owner! (e.g., "David's MacBook Pro")
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
const FILE_SYSTEM_THEMES = {
  personal: {
    dirs: ['documents', 'pictures', 'downloads', 'desktop', 'private'],
    files: ['passwords.txt', 'tax_return_2025.pdf', 'browser_history.sqlite', 'seed_phrase.txt', 'bank_statements.pdf', 'blackmail_material.zip']
  },
  startup: {
    dirs: ['src', 'devops', 'investors', 'aws'],
    files: ['api_keys.env', 'db_seed.sql', 'series_a_pitch.pdf', 'user_metrics.csv', 'docker-compose.yml', 'aws_billing.xlsx']
  },
  smallbiz: {
    dirs: ['accounting', 'hr', 'clients', 'legal'],
    files: ['payroll_2026.xlsx', 'tax_returns.pdf', 'client_list.csv', 'lawsuit_settlement.docx', 'vendor_contracts.zip']
  },
  corporation: {
    dirs: ['rd', 'board', 'finance', 'patents'],
    files: ['q4_earnings_unreleased.pdf', 'layoff_list.xlsx', 'patent_draft_994.docx', 'offshore_routing.csv', 'merger_ndas.zip', 'source_code_master.zip']
  },
  government: {
    dirs: ['public_works', 'internal_affairs', 'tax_records', 'surveillance'],
    files: ['voter_registry.sql', 'subpoena_targets.docx', 'city_camera_feeds.mp4', 'budget_deficit.xlsx', 'informant_list.csv']
  },
  military: {
    dirs: ['intel', 'drone_ops', 'sigint', 'personnel'],
    files: ['target_package_bravo.enc', 'sat_recon_raw.ts', 'troop_manifest.csv', 'roe_directives.pdf', 'black_budget.xlsx']
  },
  financial: {
    dirs: ['vault', 'swift_routing', 'audits', 'aml'],
    files: ['swift_keys.pgp', 'vip_offshore_accounts.sql', 'wire_transfers_pending.csv', 'aml_flagged.xlsx', 'crypto_cold_wallet.dat']
  },
  classified: {
    dirs: ['umb_alpha', 'stellar', 'prism_nodes', 'zero_days'],
    files: ['nsa_rootkit_src.zip', 'foreign_asset_list.enc', 'project_chimera.pdf', 'weaponized_payload_v2.bin', 'blackmail_cache.tar.gz']
  }
};

const generateOrgFileSystem = (org, tier, layout) => {
  // 1. Pick the theme based on the organization type generated earlier
  const theme = FILE_SYSTEM_THEMES[org.type] || FILE_SYSTEM_THEMES.corporation;
  
  // 2. Randomly select 2-3 directories from the theme
  const shuffledDirs = theme.dirs.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2);
  
  let filesObj = { '/': ['mail/', 'tmp/'] };
  let contents = {};
  
  // Add the chosen directories to root
  shuffledDirs.forEach(d => filesObj['/'].push(`${d}/`));

  // 3. Populate directories with themed files
  shuffledDirs.forEach(dir => {
    const dirPath = `/${dir}`;
    filesObj[dirPath] = [];
    
    // Put 1-3 random themed files in this directory
    const shuffledFiles = theme.files.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
    
    shuffledFiles.forEach(file => {
      filesObj[dirPath].push(file);
      const fullPath = `${dirPath}/${file}`;
      
      // Determine if the file is locked based on security tier
      const isLocked = (tier === 'high' || tier === 'elite') ? '[LOCKED] ' : '';
      
      // Give hashes their specific content tag so John the Ripper works
      if (file.endsWith('.sql') || file.endsWith('.env') || file.endsWith('.pgp') || file.endsWith('.sqlite')) {
        contents[fullPath] = `${isLocked}[HASH] SHA-512 System Hashes: df98a2b1c...`;
      } else {
        contents[fullPath] = `${isLocked}[PENDING_GENERATION]`;
      }
    });
  });

  // 4. Always generate employee mail files
  const mailFiles = [];
  org.employees.forEach((emp, idx) => {
    const filename = `msg_${String(idx + 1).padStart(3, '0')}.eml`;
    mailFiles.push(filename);
    contents[`/mail/${filename}`] = '[LORE_PENDING]';
  });
  filesObj['/mail'] = mailFiles;

  // 5. Always generate standard tmp files
  filesObj['/tmp'] = ['.bash_history', 'syslog.tmp'];
  contents['/tmp/.bash_history'] = '[LORE_PENDING]';
  contents['/tmp/syslog.tmp'] = '[LORE_PENDING]';

  // 6. Randomly sprinkle game consumables across all available directories
  const allDirs = Object.keys(filesObj);
  const randomDir = () => allDirs[Math.floor(Math.random() * allDirs.length)];
  
  if (Math.random() < 0.20) filesObj[randomDir()].push('decoy.bin');
  if (Math.random() < 0.15) filesObj[randomDir()].push('burner.ovpn');
  
  if (tier === 'high' || tier === 'elite') {
    if (Math.random() < 0.15) filesObj[randomDir()].push('0day_poc.sh');
  }
  if (tier === 'low' || tier === 'mid') {
    if (Math.random() < 0.25) filesObj[randomDir()].push('wallet.dat');
  }

  return { files: filesObj, contents };
};

const generateInterceptedComms = async (targetIP, nodeData, apiKey) => {
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

const generateAIContract = async (targetIP, nodeData, currentRep, arg4, arg5) => {
  // Safely handle arguments (in case the world map isn't passed correctly yet)
  const world = typeof arg4 === 'object' && arg4 !== null ? arg4 : {};
  const apiKey = typeof arg4 === 'string' ? arg4 : arg5;

  // 1. Roll the Sandbox Probability (1-100)
  const prob = Math.floor(Math.random() * 100) + 1;

  // 2. Set Difficulty Parameters based on Probability
  let timeLimit, heatCap, minReward, maxReward, minRep, maxRep, numTargets;

  if (prob <= 9) { // 💀 Insane (Tier 4)
    numTargets = Math.floor(Math.random() * 2) + 3; // 3 to 4 objectives
    timeLimit = 180; heatCap = 35;
    minReward = 50000; maxReward = 150000; minRep = 100; maxRep = 250;
  } else if (prob <= 49) { // 🔴 Hard (Tier 3)
    numTargets = Math.floor(Math.random() * 2) + 2; // 2 to 3 objectives
    timeLimit = 240; heatCap = 45;
    minReward = 15000; maxReward = 55000; minRep = 50; maxRep = 120;
  } else if (prob <= 74) { // 🟡 Medium (Tier 2)
    numTargets = Math.floor(Math.random() * 2) + 1; // 1 to 2 objectives
    timeLimit = 300; heatCap = 75;
    minReward = 4000; maxReward = 18000; minRep = 20; maxRep = 55;
  } else { // 🟢 Easy (Tier 1)
    numTargets = 1;
    timeLimit = 600; heatCap = 90;
    minReward = 1000; maxReward = 4500; minRep = 10; maxRep = 25;
  }

  const reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
  const repReward = Math.floor(Math.random() * (maxRep - minRep + 1)) + minRep;

  // 3. Select Target Nodes from the World Map
  // Filter out 'local', hidden nodes, and our starting node
  const availableIPs = Object.keys(world).filter(ip => ip !== 'local' && ip !== targetIP && !world[ip].isHidden);
  // Shuffle available IPs
  const shuffledIPs = availableIPs.sort(() => 0.5 - Math.random());
  // Combine our starting node with extra nodes (if available on the map)
  const selectedIPs = [targetIP, ...shuffledIPs].slice(0, numTargets);

  // 4. Generate the Objectives List
  const objectives = [];
  const actionTypes = ['exfil', 'destroy', 'ransom'];

  for (let i = 0; i < numTargets; i++) {
    // If we run out of unique IPs, cycle back (giving 1 node multiple tasks)
    const ip = selectedIPs[i % selectedIPs.length];
    const node = ip === targetIP ? nodeData : world[ip];
    const type = actionTypes[Math.floor(Math.random() * actionTypes.length)];

    let targetFile = null;
    if (type === 'exfil') {
      let allFiles = [];
      if (node && node.files) {
        Object.keys(node.files).forEach(dir => {
          node.files[dir].forEach(f => {
            if (!f.endsWith('/') && f !== '.bash_history' && !f.endsWith('.tmp') && !f.endsWith('.eml')) {
              allFiles.push(f);
            }
          });
        });
      }
      targetFile = allFiles.length > 0 ? allFiles[Math.floor(Math.random() * allFiles.length)] : 'proprietary_data.zip';
    }

    objectives.push({
      ip: ip,
      name: node?.org?.orgName || "Unknown Node",
      type: type,
      targetFile: targetFile
    });
  }

  const fallbackContract = {
    probability: prob,
    objectives: objectives,
    desc: `[ENCRYPTED REROUTE] Client requires a multi-stage operation. See objective checklist for details. Scrub your tracks.`,
    timeLimit, reward, repReward, heatCap,
    forbidden_tools: [],
    isAmbush: prob <= 20 && Math.random() < 0.2 // Ambush more likely on Hard/Insane
  };

  // 5. Ask the AI Director to write the flavor text based on the objectives
  const prompt = `You are a Darknet Fixer in a hacking simulator. Write a contract description.
  The success probability is ${prob}%. (If low, make it sound dangerous/elite. If high, make it sound routine).
  Objectives required:
  ${objectives.map((o, i) => `${i+1}. ${o.type.toUpperCase()} on ${o.name} (${o.ip})${o.type === 'exfil' ? ` -> Target File: ${o.targetFile}` : ''}`).join('\n')}

  Return ONLY raw JSON in this exact format. No markdown, no explanations:
  {
    "desc": "2 sentences of immersive darknet flavor text explaining WHO hired the player and WHY they want these specific actions done."
  }`;

  try {
    let aiText = await generateDirectorText(prompt, "");
    aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return { ...fallbackContract, desc: parsedData.desc || fallbackContract.desc };
    } else {
      return fallbackContract;
    }
  } catch (e) {
    return fallbackContract;
  }
};

export {
  invokeBlueTeamAI,
  ORG_TEMPLATES,
  FIRST_NAMES,
  LAST_NAMES,
  ROLES,
  generateEmployee,
  generateOrgNarrative,
  generateOrgFileSystem,
  generateAIContract,
  generateInterceptedComms,
};
