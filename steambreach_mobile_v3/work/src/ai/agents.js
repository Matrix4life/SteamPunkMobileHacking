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
  const orgName = template.names[Math.floor(Math.random() * template.names.length)];
  
  const employeeCount = tier === 'low' ? 3 : tier === 'mid' ? 5 : tier === 'high' ? 4 : 3;
  const employees = Array.from({ length: employeeCount }, (_, i) => generateEmployee(tier, i));
  
  const secrets = [];
  if (employees.length >= 2) {
    const e1 = employees[0], e2 = employees[1];
    secrets.push(`${e1.name} recently complained to HR about ${e2.name}'s access privileges.`);
    secrets.push(`${e2.name} has been storing credentials in a plaintext file on the shared drive.`);
  }
  if (employees.length >= 3) {
    secrets.push(`${employees[2].name} is interviewing at a competitor and has been exfiltrating client lists.`);
  }
  
  return { orgName, type: template.type, employees, secrets };
};

const generateOrgFileSystem = (org, tier, layout) => {
  let filesObj = { '/': [`${layout.dirs[0]}/`, 'mail/', 'tmp/'] };
  let contents = {};
  let buildPath = '';

  for (let i = 0; i < layout.dirs.length; i++) {
    const isLast = i === layout.dirs.length - 1;
    const dirName = layout.dirs[i];
    const nextContent = isLast ? [layout.file] : [`${layout.dirs[i + 1]}/`];
    buildPath += `/${dirName}`;
    filesObj[buildPath] = nextContent;
  }

  const mailFiles = [];
  org.employees.forEach((emp, idx) => {
    const filename = `msg_${String(idx + 1).padStart(3, '0')}.eml`;
    mailFiles.push(filename);
    contents[`/mail/${filename}`] = '[LORE_PENDING]';
  });
  filesObj['/mail'] = mailFiles;

  filesObj['/tmp'] = ['.bash_history', 'notes.tmp'];
  contents['/tmp/.bash_history'] = '[LORE_PENDING]';
  contents['/tmp/notes.tmp'] = '[LORE_PENDING]';

  const fullFilePath = `${buildPath}/${layout.file}`;
  let fileContent = (tier === 'high' || tier === 'elite') ? '[LOCKED] [PENDING_GENERATION]' : '[PENDING_GENERATION]';
  if (layout.file.endsWith('.bak') || layout.file.endsWith('.hashes')) {
    fileContent = (tier === 'high' || tier === 'elite') ? '[LOCKED] [HASH] SHA-512 System Hashes: df98a2b1c...' : '[HASH] NTLM User Hashes: 8f2b3c...';
  }
  contents[fullFilePath] = fileContent;

  const dirs = Object.keys(filesObj);
  const randomDir = () => dirs[Math.floor(Math.random() * dirs.length)];
  
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

const generateAIContract = async (targetIP, nodeData, currentRep, apiKey) => {
  const orgName = nodeData?.org?.orgName || "Unknown Target";
  const secLevel = nodeData?.sec || "mid";
  const isHigh = secLevel === 'high' || secLevel === 'elite';

  const fallbackContract = {
    type: "exfil",
    desc: `[ENCRYPTED REROUTE] Client requires immediate extraction of proprietary data from ${orgName}. Get in, get the files, and scrub your tracks.`,
    timeLimit: isHigh ? 180 : 300,
    reward: isHigh ? 150000 : 50000,
    repReward: isHigh ? 50 : 20,
    heatCap: isHigh ? 40 : 80,
    forbidden_tools: [],
    isAmbush: Math.random() < 0.1
  };

  const prompt = `You are a Darknet Fixer in a hacking simulator. Generate a contract for a player targeting ${orgName} (Security: ${secLevel.toUpperCase()}). Player Reputation: ${currentRep}.
  Return ONLY raw JSON in this exact format. No markdown, no explanation:
  {
    "type": "exfil",
    "desc": "2 sentences of immersive darknet flavor text explaining the job.",
    "timeLimit": 200,
    "reward": 50000,
    "repReward": 20,
    "heatCap": 50,
    "forbidden_tools": [], 
    "isAmbush": false 
  }`;

  try {
    let aiText = await generateDirectorText(prompt, "");
    
    aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return { ...fallbackContract, ...parsedData };
    } else {
      return fallbackContract;
    }
  } catch (e) {
    return fallbackContract;
  }
};

// ==========================================

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
