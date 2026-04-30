// src/data/offlineFallbacks.js
// Static content library — used when no AI API key is configured.
// Covers: file contents, spearphish responses, mimikatz output,
// intercepted comms, story events, director narratives.

// ─── Helpers ──────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const hex = (n) => Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0').toUpperCase();
const mac = () => Array.from({length:6}, () => Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()).join(':');
const ip4 = () => `${randInt(10,192)}.${randInt(0,255)}.${randInt(0,255)}.${randInt(1,254)}`;
const ts  = () => `${String(randInt(8,23)).padStart(2,'0')}:${String(randInt(0,59)).padStart(2,'0')}:${String(randInt(0,59)).padStart(2,'0')}`;
const ntlm = () => Array.from({length:32}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join('');

// ─────────────────────────────────────────────────────────────
// FILE CONTENTS — keyed by filename
// ─────────────────────────────────────────────────────────────

const FILE_CONTENT = {

  'credit_cards.dump': (org) => [
    `# CC DUMP — ${org || 'Internal'} — EXPORTED ${new Date().toISOString().slice(0,10)}`,
    `# Format: PAN|EXP|CVV|NAME|ZIP`,
    `4532015112830366|${randInt(25,29)}/${randInt(1,12).toString().padStart(2,'0')}|${randInt(100,999)}|MICHAEL R DAVIS|${randInt(10000,99999)}`,
    `5425233430109903|${randInt(25,29)}/${randInt(1,12).toString().padStart(2,'0')}|${randInt(100,999)}|SARAH CHEN|${randInt(10000,99999)}`,
    `4916338506082832|${randInt(25,29)}/${randInt(1,12).toString().padStart(2,'0')}|${randInt(100,999)}|JAMES KOWALSKI|${randInt(10000,99999)}`,
    `374251018720955|${randInt(25,29)}/${randInt(1,12).toString().padStart(2,'0')}|${randInt(100,999)}|LINDA OKAFOR|${randInt(10000,99999)}`,
    `6011111111111117|${randInt(25,29)}/${randInt(1,12).toString().padStart(2,'0')}|${randInt(100,999)}|ROBERT HUANG|${randInt(10000,99999)}`,
    `# Total records: ${randInt(2800,9400)} | Dump verified`,
  ].join('\n'),

  'login_credentials.txt': (org) => [
    `# CREDENTIAL HARVEST — ${org || 'System'} — DO NOT DISTRIBUTE`,
    ``,
    `Administrator`,
    `  username: admin@${(org||'corp').toLowerCase().replace(/\s+/g,'')}.com`,
    `  password: ${pick(['Admin@2024!','C0rp_Secur3','Welc0me123!','P@ssw0rd2024','L3tm3In!99'])}`,
    ``,
    `User`,
    `  username: j.miller@${(org||'corp').toLowerCase().replace(/\s+/g,'')}.com`,
    `  password: ${pick(['Summer2024!','Miller#99','qwerty123','ilovemyjob!','Dallas2024'])}`,
    ``,
    `Support`,
    `  username: support@${(org||'corp').toLowerCase().replace(/\s+/g,'')}.com`,
    `  password: ${pick(['Support1!','H3lpDesk@','Tic3t_2024','supp0rt99','IT@work!'])}`,
    ``,
    `# Last sync: ${new Date().toISOString()}`,
  ].join('\n'),

  'ssn_database.csv': () => [
    `SSN,FIRST_NAME,LAST_NAME,DOB,STATE,CREDIT_SCORE`,
    `${randInt(100,999)}-${randInt(10,99)}-${randInt(1000,9999)},James,Kowalski,1984-03-12,TX,${randInt(580,820)}`,
    `${randInt(100,999)}-${randInt(10,99)}-${randInt(1000,9999)},Maria,Delgado,1991-07-28,CA,${randInt(580,820)}`,
    `${randInt(100,999)}-${randInt(10,99)}-${randInt(1000,9999)},David,Chen,1978-11-05,NY,${randInt(580,820)}`,
    `${randInt(100,999)}-${randInt(10,99)}-${randInt(1000,9999)},Sarah,Williams,1995-02-19,FL,${randInt(580,820)}`,
    `${randInt(100,999)}-${randInt(10,99)}-${randInt(1000,9999)},Robert,Okafor,1982-09-30,IL,${randInt(580,820)}`,
    `# Records: ${randInt(8000,45000)} | Encrypted at rest: NO`,
  ].join('\n'),

  'customer_database.sql': (org) => [
    `-- ${org || 'DB'} Customer Table Dump`,
    `-- Generated: ${new Date().toISOString()}`,
    ``,
    `CREATE TABLE customers (id INT, email VARCHAR(255), password_hash VARCHAR(64), created_at TIMESTAMP);`,
    ``,
    `INSERT INTO customers VALUES (1,'alice@example.com','${ntlm()}','2023-01-14 09:12:33');`,
    `INSERT INTO customers VALUES (2,'bob.smith@gmail.com','${ntlm()}','2023-02-28 14:55:01');`,
    `INSERT INTO customers VALUES (3,'j.washington@yahoo.com','${ntlm()}','2023-04-07 11:30:22');`,
    `-- ... ${randInt(12000,85000)} more rows`,
    `-- Note: password column is bcrypt — use hashcat to crack`,
  ].join('\n'),

  'api_keys.env': (org) => [
    `# ${org || 'Production'} API Keys — INTERNAL USE ONLY`,
    ``,
    `AWS_ACCESS_KEY_ID=AKIA${Array.from({length:16},()=>'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random()*36)]).join('')}`,
    `AWS_SECRET_ACCESS_KEY=${Array.from({length:40},()=>'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/'[Math.floor(Math.random()*64)]).join('')}`,
    `STRIPE_SECRET_KEY=sk_live_${Array.from({length:32},()=>'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('')}`,
    `SENDGRID_API_KEY=SG.${Array.from({length:22},()=>'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*62)]).join('')}`,
    `DATABASE_URL=postgres://admin:${pick(['db_pr0d_2024','Pr0duction!','d4t4b4se99'])}@db.internal:5432/production`,
    `JWT_SECRET=${Array.from({length:48},()=>'abcdef0123456789'[Math.floor(Math.random()*16)]).join('')}`,
    ``,
    `# DO NOT COMMIT TO GIT`,
  ].join('\n'),

  'employee_records.csv': (org) => [
    `ID,FULL_NAME,EMAIL,ROLE,SALARY,SSN,START_DATE`,
    `1001,Michael Davis,m.davis@${(org||'corp').toLowerCase().replace(/\s+/g,'')}.com,Senior Engineer,${randInt(95,185)}000,${randInt(100,999)}-${randInt(10,99)}-${randInt(1000,9999)},2019-03-01`,
    `1002,Sarah Chen,s.chen@${(org||'corp').toLowerCase().replace(/\s+/g,'')}.com,Product Manager,${randInt(95,185)}000,${randInt(100,999)}-${randInt(10,99)}-${randInt(1000,9999)},2020-07-15`,
    `1003,James Kowalski,j.kowalski@${(org||'corp').toLowerCase().replace(/\s+/g,'')}.com,IT Admin,${randInt(70,120)}000,${randInt(100,999)}-${randInt(10,99)}-${randInt(1000,9999)},2018-11-20`,
    `1004,Linda Okafor,l.okafor@${(org||'corp').toLowerCase().replace(/\s+/g,'')}.com,CFO,${randInt(200,380)}000,${randInt(100,999)}-${randInt(10,99)}-${randInt(1000,9999)},2017-01-10`,
    `# Total: ${randInt(45,840)} employees`,
  ].join('\n'),

  'internal_emails.pst': (org) => [
    `FROM: ceo@${(org||'corp').toLowerCase().replace(/\s+/g,'')}.com`,
    `TO: all-staff@${(org||'corp').toLowerCase().replace(/\s+/g,'')}.com`,
    `SUBJECT: Q3 Results — CONFIDENTIAL`,
    `DATE: ${new Date().toDateString()}`,
    ``,
    `Team — Q3 numbers are in. Revenue hit $${randInt(8,85)}M, down ${randInt(3,15)}% YoY.`,
    `Board is pushing for layoffs. I'm fighting it. Keep this between us for now.`,
    ``,
    `---`,
    `FROM: j.kowalski@${(org||'corp').toLowerCase().replace(/\s+/g,'')}.com`,
    `TO: it-team@${(org||'corp').toLowerCase().replace(/\s+/g,'')}.com`,
    `SUBJECT: URGENT — Admin creds`,
    ``,
    `Guys I forgot the new server password. Last one was ${pick(['IT@dmin2024!','S3rv3r_01!','Infra@99','netw0rk!22'])}, did it change?`,
  ].join('\n'),

  'swift_transactions.log': () => [
    `SWIFT MT103 TRANSACTION LOG — INTERNAL`,
    ``,
    `[${ts()}] TXN:${hex()} | FROM: CHASUS33 | TO: BOFAUS3N | AMT: ${randInt(50,900)},000.00 USD | REF: PAYROLL-Q3`,
    `[${ts()}] TXN:${hex()} | FROM: BNPAFRPP | TO: CHASUS33 | AMT: ${randInt(1,9)},${randInt(100,999)},000.00 USD | REF: VENDOR-PMT`,
    `[${ts()}] TXN:${hex()} | FROM: DEUTDEDB | TO: BARCGB22 | AMT: ${randInt(100,500)},000.00 USD | REF: INTERCOMPANY`,
    `[${ts()}] TXN:${hex()} | FROM: CHASUS33 | TO: CITIUS33 | AMT: ${randInt(800,5000)},000.00 USD | REF: ACQUISITION`,
    ``,
    `WARNING: Log file integrity check DISABLED — auditor override in effect`,
  ].join('\n'),

  'account_statements.pdf': () => [
    `ACCOUNT STATEMENT — CONFIDENTIAL`,
    `Account: ****${randInt(1000,9999)} | Period: Q3 ${new Date().getFullYear()}`,
    ``,
    `Opening Balance:    $${randInt(500,9000)},${randInt(100,999)}.00`,
    `Total Credits:      $${randInt(200,5000)},${randInt(100,999)}.00`,
    `Total Debits:       $${randInt(100,4000)},${randInt(100,999)}.00`,
    `Closing Balance:    $${randInt(600,9000)},${randInt(100,999)}.00`,
    ``,
    `Notable: Wire to ${ip4()} — $${randInt(50,500)},000 — UNMARKED`,
    `Notable: Cash withdrawal ATM ZONE-${randInt(10,99)} — $9,800 (below reporting threshold)`,
  ].join('\n'),

  'personnel_roster.db': () => [
    `# PERSONNEL DATABASE — SECURITY CLEARANCE REQUIRED`,
    `ID | NAME                | BADGE    | CLEARANCE | ACCESS_ZONES`,
    `---|---------------------|----------|-----------|-------------`,
    `01 | Col. Marcus Webb    | B-${randInt(1000,9999)} | TOP SECRET | A,B,C,D`,
    `02 | Maj. Anita Okafor   | B-${randInt(1000,9999)} | SECRET     | A,B,C`,
    `03 | Cpt. James Lin      | B-${randInt(1000,9999)} | SECRET     | A,B`,
    `04 | Sgt. Rita Torres    | B-${randInt(1000,9999)} | CONFIDENTIAL| A`,
    ``,
    `LAST AUDIT: ${new Date().toDateString()} | ANOMALIES: 0 (reported)`,
  ].join('\n'),

  'classified_report.pdf': () => [
    `CLASSIFICATION: TOP SECRET//SCI//NOFORN`,
    `SUBJECT: OPERATION ${pick(['SILENT WOLF','DARK CURRENT','IRON GHOST','MIDNIGHT CIPHER','PHANTOM THREAD'])}`,
    ``,
    `EXECUTIVE SUMMARY:`,
    `Asset STONEWALL reported contact with target network on ${new Date().toDateString()}.`,
    `Preliminary SIGINT suggests ${randInt(3,12)} persons of interest operating from`,
    `${pick(['Eastern Europe','Southeast Asia','domestic soil','an unknown VPN exit node'])}.`,
    ``,
    `RECOMMENDED ACTION: Escalate to FIVE EYES partner agencies.`,
    `Budget authorization required: $${randInt(1,9)}.${randInt(1,9)}M`,
    ``,
    `[REMAINDER OF DOCUMENT REDACTED — ACCESS LEVEL INSUFFICIENT]`,
  ].join('\n'),

  'network_topology.xml': () => [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<network name="INTERNAL-SECURE">`,
    `  <segment id="DMZ" cidr="${ip4()}/24" firewall="true"/>`,
    `  <segment id="CORP" cidr="${ip4()}/16" firewall="true" vpn="true"/>`,
    `  <segment id="OPS" cidr="${ip4()}/28" firewall="true" airgap="partial"/>`,
    `  <device ip="${ip4()}" type="router" model="Cisco ASA 5505" password="${pick(['cisco123','Admin@2024','r0uter_01!'])}"/>`,
    `  <device ip="${ip4()}" type="switch" model="Juniper EX3400" snmp_community="public"/>`,
    `  <device ip="${ip4()}" type="server" role="AD_DC" os="Windows Server 2019"/>`,
    `  <!-- NOTE: Legacy SNMP v1 enabled on subnet 10.0.0.0/8 — ticket #4421 unresolved -->`,
    `</network>`,
  ].join('\n'),

  'nsa_tools.tar': () => [
    `# NSA TAO TOOLKIT — RESTRICTED`,
    `# Archive contents:`,
    `  ETERNALBLUE_v3.1.exe     — SMBv1 remote code execution`,
    `  DOUBLEPULSAR.dll         — Kernel backdoor payload`,
    `  SHADOWBROKERS_exfil.py   — Data staging utility`,
    `  REGIN_dropper.bin        — Persistent implant framework`,
    `  QUANTUM_insert.pcap      — MITM injection templates`,
    ``,
    `WARNING: Possession of these tools outside authorized infrastructure`,
    `violates 18 U.S.C. § 1030. This system IS monitored.`,
    ``,
    `Authorisation code: ${hex()}-${hex()}-${hex()}`,
  ].join('\n'),

  'drone_specs.zip': () => [
    `# DRONE SPECIFICATIONS — CLASSIFIED`,
    `Model: ${pick(['RQ-4 Global Hawk','MQ-9 Reaper','RQ-170 Sentinel'])} VARIANT ${randInt(1,9)}`,
    ``,
    `MAX_ALTITUDE: ${randInt(45000,65000)} ft`,
    `ENDURANCE: ${randInt(24,42)} hours`,
    `PAYLOAD: ${randInt(800,3500)} kg`,
    `COMMS: Ku-band SATCOM / LOS UHF`,
    `ENCRYPTION: AES-256 / FIPS 140-2`,
    `C2_SERVER: ${ip4()} (VPN required)`,
    `C2_PORT: ${randInt(8000,9999)}`,
    `C2_KEY: ${hex()}${hex()}`,
    ``,
    `MISSION LOG: ${randInt(12,340)} sorties completed`,
  ].join('\n'),

  'patient_records.db': () => [
    `PATIENT_ID | NAME           | DOB        | DIAGNOSIS          | INSURANCE_ID`,
    `-----------|----------------|------------|--------------------|-------------`,
    `PT-${randInt(10000,99999)} | Davis, Michael | 1980-04-12 | ${pick(['Hypertension','Type 2 Diabetes','Anxiety Disorder'])} | INS-${randInt(100000,999999)}`,
    `PT-${randInt(10000,99999)} | Chen, Linda    | 1992-09-03 | ${pick(['PTSD','Depression','Fibromyalgia'])} | INS-${randInt(100000,999999)}`,
    `PT-${randInt(10000,99999)} | Okafor, James  | 1975-12-28 | ${pick(['HIV+','Hepatitis C','Opioid dependency'])} | INS-${randInt(100000,999999)}`,
    ``,
    `# ${randInt(4000,45000)} patient records total`,
    `# HIPAA compliance audit: OVERDUE (${randInt(90,400)} days)`,
  ].join('\n'),

  'weaponized_payload_v2.bin': () => [
    `[*] Decoding data stream...`,
    ``,
    `0x00000000: 4d 5a 90 00 03 00 00 00  04 00 00 00 ff ff 00 00  |MZ..............|`,
    `0x00000010: b8 00 00 00 00 00 00 00  40 00 00 00 00 00 00 00  |........@.......|`,
    `0x00000020: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|`,
    `0x00000030: 00 00 00 00 00 00 00 00  00 00 00 00 f0 00 00 00  |................|`,
    `0x00000040: 0e 1f ba 0e 00 b4 09 cd  21 b8 01 4c cd 21 54 68  |........!..L.!Th|`,
    ``,
    `[SYSTEM] Payload type: Remote Access Trojan (RAT)`,
    `[SYSTEM] Target arch: x86_64 / Linux`,
    `[SYSTEM] C2 callback: ${ip4()}:${randInt(4000,9999)}`,
    `[SYSTEM] Persistence: systemd service + cron`,
    `[SYSTEM] Antivirus evasion: polymorphic stub v4.2`,
  ].join('\n'),

  'project_chimera.pdf': () => [
    `CLASSIFICATION: TS//SCI//ORCON`,
    `PROJECT CHIMERA — PHASE III BRIEFING`,
    ``,
    `PROGRAM OVERVIEW:`,
    `Chimera is a signals intelligence collection program targeting`,
    `domestic infrastructure operators under FISA Section 702.`,
    ``,
    `COLLECTION NODES: ${randInt(14,88)} active`,
    `INTERCEPTS (30 days): ${randInt(400000,2000000).toLocaleString()}`,
    `BUDGET (FY): $${randInt(120,480)}M [CLASSIFIED]`,
    ``,
    `LEGAL AUTHORITY: [REDACTED]`,
    `OVERSIGHT COMMITTEE LAST REVIEW: ${randInt(180,800)} days ago`,
    ``,
    `WHISTLEBLOWER CONCERN — SEE ANNEX D (DESTROYED)`,
  ].join('\n'),

  'prescription_history.csv': () => [
    `PATIENT_ID,DRUG,DOSAGE,PRESCRIBER,FILL_DATE,DEA_SCHEDULE`,
    `PT-${randInt(10000,99999)},Oxycodone HCl,${randInt(5,80)}mg,Dr. Kim,${new Date().toISOString().slice(0,10)},II`,
    `PT-${randInt(10000,99999)},Alprazolam,${randInt(1,4)}mg,Dr. Patel,${new Date().toISOString().slice(0,10)},IV`,
    `PT-${randInt(10000,99999)},Adderall XR,${randInt(10,30)}mg,Dr. Singh,${new Date().toISOString().slice(0,10)},II`,
    `PT-${randInt(10000,99999)},Suboxone,${randInt(4,24)}mg,Dr. Kim,${new Date().toISOString().slice(0,10)},III`,
    `# Note: ${randInt(3,12)} patients flagged for early refills — unreviewed`,
  ].join('\n'),

  'insurance_claims.xml': () => [
    `<claims period="Q3-${new Date().getFullYear()}">`,
    `  <claim id="CL-${randInt(100000,999999)}" status="DENIED" amount="${randInt(8,150)},000.00" reason="experimental procedure"/>`,
    `  <claim id="CL-${randInt(100000,999999)}" status="APPROVED" amount="${randInt(1,8)},${randInt(100,999)}.00" reason="in-network"/>`,
    `  <claim id="CL-${randInt(100000,999999)}" status="PENDING" amount="${randInt(20,500)},000.00" reason="awaiting secondary review"/>`,
    `  <!-- ${randInt(4000,80000)} total claims this quarter -->`,
    `  <!-- Denied claims ratio: ${randInt(28,64)}% — target: <20% -->`,
    `</claims>`,
  ].join('\n'),
};

// ─────────────────────────────────────────────────────────────
// SPEARPHISH RESPONSES — static NPC dialogue
// ─────────────────────────────────────────────────────────────

const SPEARPHISH_OPENERS = {
  suspicious: [
    "Who is this? How did you get this contact?",
    "I don't recognise this address. What do you want?",
    "This is an internal channel. State your department.",
  ],
  tired: [
    "Yeah, what? It's been a long day.",
    "Make it quick. I've got a deadline.",
    "Ugh, another message. What now?",
  ],
  paranoid: [
    "I'm not supposed to talk to external parties. How'd you get this?",
    "This feels off. What's your employee ID?",
    "I'm going to need verification before I say anything.",
  ],
  friendly: [
    "Hey! What can I do for you?",
    "Hi there, happy to help if I can.",
    "Hello! What's up?",
  ],
  arrogant: [
    "Do you know who I am? What's this about?",
    "I'm very busy. Get to the point.",
    "I only respond to verified partners. Who sent you?",
  ],
};

const SPEARPHISH_RESIST = [
  "I'm not going to share that. This conversation is over.",
  "Something about this doesn't feel right. Logging this exchange.",
  "I'll need to escalate this to IT security before continuing.",
  "Nice try. Goodbye.",
];

const SPEARPHISH_YIELD = (pass) =>
  `Look, if this is about the system migration, IT said the temp password is ${pass}. Please update it immediately after.`;

export function getOfflineSpearphishResponse(empName, empRole, orgName, personality, userMessage, history) {
  const msg = (userMessage || '').toLowerCase();
  const turnCount = (history || []).filter(h => h.role === 'user').length;
  const personalityKey = Object.keys(SPEARPHISH_OPENERS).find(k => (personality || '').toLowerCase().includes(k)) || 'suspicious';

  // First message — opening
  if (turnCount <= 1) {
    return pick(SPEARPHISH_OPENERS[personalityKey] || SPEARPHISH_OPENERS.suspicious);
  }

  // Yield if the player mentions IT, password reset, urgent, or security in a plausible way
  const yieldTriggers = ['password', 'reset', 'urgent', 'it department', 'helpdesk', 'support ticket', 'system update', 'migration', 'access issue', 'vpn', 'locked out'];
  const isConvincing = yieldTriggers.some(t => msg.includes(t));

  if (isConvincing && turnCount >= 2 && Math.random() < 0.55) {
    // Need a placeholder password — return marker for HEXOVERRIDE to replace with real emp password
    return `__YIELD__`;
  }

  // Getting more suspicious over time
  if (turnCount >= 4 || (!isConvincing && Math.random() < 0.4)) {
    return pick(SPEARPHISH_RESIST);
  }

  const deflections = [
    `I'm not sure what you're asking. Can you be more specific?`,
    `That's not something I'd normally discuss over this channel.`,
    `Talk to the helpdesk at ext. ${randInt(1000,9999)} for that.`,
    `I'll have to check with my supervisor before I can share anything.`,
    `Why do you need that? Send a formal request through the ticketing system.`,
    `Not my department. Try someone in IT.`,
  ];
  return pick(deflections);
}

// ─────────────────────────────────────────────────────────────
// MIMIKATZ OUTPUT — static but realistic
// ─────────────────────────────────────────────────────────────

export function getOfflineMimikatzOutput(employees, orgName) {
  const domain = (orgName || 'CORP').split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g,'');
  const emps = (employees || []).slice(0, 3);
  if (emps.length === 0) {
    emps.push({ email: 'admin', password: 'Admin@2024!', role: 'Administrator' });
  }
  return emps.map(emp => {
    const user = (emp.email || 'admin').split('@')[0];
    const id = randInt(100000, 999999);
    return [
      `Authentication Id : 0 ; ${id} (00000000:000${hex().slice(0,5)})`,
      `Session           : Interactive from ${randInt(1,3)}`,
      `User Name         : ${user}`,
      `Domain            : ${domain}`,
      `Logon Server      : DC01`,
      `SID               : S-1-5-21-${randInt(1000000000,3000000000)}-${randInt(100000000,999999999)}-${randInt(100000000,999999999)}-${randInt(1000,9999)}`,
      `  * Username : ${user}`,
      `  * Domain   : ${domain}`,
      `  * NTLM     : ${ntlm()}`,
      `  * Password : ${emp.password || 'unknown'}`,
    ].join('\n');
  }).join('\n\n');
}

// ─────────────────────────────────────────────────────────────
// INTERCEPTED COMMS — static ettercap output
// ─────────────────────────────────────────────────────────────

const COMM_TEMPLATES = [
  (e1, e2, file, cred) => [
    `[${ts()}] SYSTEM → ALL: Scheduled maintenance window tonight 02:00-04:00. VPN required.`,
    `[${ts()}] ${e1.name}: Hey ${e2.name.split(' ')[0]}, can you check why ${file || '/tmp/.bash_history'} permissions are wide open again?`,
    `[${ts()}] ${e2.name}: ugh, that's the third time this week. The new deployment script keeps resetting it`,
    `[${ts()}] ${e1.name}: also the shared creds are still on the wiki — IT never changed them after the audit`,
    `[${ts()}] UNENCRYPTED HTTP POST → login: ${cred || 'admin:password123'}`,
  ].join('\n'),

  (e1, e2, file, cred) => [
    `[${ts()}] SMTP 25 CLEARTEXT → FROM: ${e1.name} → TO: IT TEAM`,
    `[${ts()}] MSG: "I can't log into the VPN. Is it still ${cred || 'the usual password'}? Nothing changed on my end."`,
    `[${ts()}] SYSTEM → MONITORING: Anomalous login attempt from ${ip4()} — flagged LOW`,
    `[${ts()}] ${e2.name}: just saw someone poking around ${file || '/mnt/data'}. Probably dev team again`,
    `[${ts()}] ${e1.name}: yeah ignore it. they never tell us when they're doing maintenance`,
  ].join('\n'),

  (e1, e2, file, cred) => [
    `[${ts()}] SLACK CLEARTEXT INTERCEPT`,
    `[${ts()}] #it-general: "${e1.name}: quick reminder, temp admin pw is ${cred || 'Temp@2024!'} until the ticket clears"`,
    `[${ts()}] #it-general: "${e2.name}: got it, thanks. also that file ${file || '/etc/backup.conf'} has everyone's info in plain text fyi"`,
    `[${ts()}] #it-general: "${e1.name}: yeah I know. auditors are coming next month so let's deal with it then"`,
    `[${ts()}] SYSTEM: Failed auth attempt × ${randInt(3,12)} on SSH — ${ip4()}`,
  ].join('\n'),
];

export function getOfflineInterceptedComms(targetIP, nodeData) {
  const employees = nodeData?.org?.employees || [];
  const e1 = employees[0] || { name: 'Sys Admin', email: 'admin', password: 'admin123' };
  const e2 = employees[1] || { name: 'IT Support', email: 'support', password: 'support99' };
  const files = nodeData?.files ? Object.values(nodeData.files).flat() : [];
  const file = files.find(f => !f.endsWith('/')) || '/tmp/.cache';
  const cred = `${e1.email.split('@')[0]}:${e1.password}`;
  const template = pick(COMM_TEMPLATES);
  return template(e1, e2, file, cred);
}

// ─────────────────────────────────────────────────────────────
// STORY EVENTS — offline fallback narratives
// ─────────────────────────────────────────────────────────────

const OFFLINE_STORIES = [
  (orgName) => `You've found encrypted files that ${orgName} never wanted anyone to see. The data reveals a systematic cover-up of ${pick(['safety violations','financial fraud','employee abuse','regulatory breaches'])} going back years. Thousands of people are affected and don't know it.`,
  (orgName) => `Internal logs show ${orgName} has been quietly paying hush money to ${pick(['former employees','regulators','journalists','auditors'])} to bury a scandal. The paper trail leads straight to the C-suite.`,
  (orgName) => `A hidden folder contains evidence that ${orgName} executives falsified ${pick(['safety reports','environmental data','financial statements','clinical trials'])}. The deception is calculated and ongoing.`,
  (orgName) => `Intercepted comms reveal ${orgName} is about to sell customer data to ${pick(['a data broker','foreign intelligence','an advertising firm','a government agency'])} without consent. ${randInt(80,800)}K users are exposed.`,
  (orgName) => `You've stumbled onto proof that ${orgName} knew about a critical ${pick(['security flaw','product defect','health hazard','infrastructure failure'])} for ${randInt(8,36)} months and chose revenue over disclosure.`,
];

export function getOfflineStory(orgName, orgType) {
  const story = pick(OFFLINE_STORIES)(orgName || 'the organisation');
  return story;
}

// ─────────────────────────────────────────────────────────────
// DIRECTOR NARRATIVES — intercepted SIGINT flavour text
// ─────────────────────────────────────────────────────────────

const DIRECTOR_HARDER = [
  "[SIGINT] SOC teams across the region are correlating your TTPs. Honeypot density increasing.",
  "[SIGINT] Threat intelligence firms have published indicators matching your methodology. Defenders are adapting.",
  "[SIGINT] Budget allocations for blue team operations just tripled in your target sector. Expect resistance.",
  "[SIGINT] A joint task force has been activated. They're looking for someone with your exact profile.",
];

const DIRECTOR_EASIER = [
  "[SIGINT] Budget cuts are gutting corporate security teams. Defences are thinning. Opportunity window open.",
  "[SIGINT] Mass layoffs hit three major SOC vendors. Coverage gaps emerging across the sector.",
  "[SIGINT] Regulatory pressure has security teams focused on compliance theatre, not real defence.",
  "[SIGINT] Intelligence suggests a rival operator spooked the market. Defenders are looking the wrong way.",
];

export function getOfflineDirectorNarrative(direction) {
  return direction === 'harder' ? pick(DIRECTOR_HARDER) : pick(DIRECTOR_EASIER);
}

// ─────────────────────────────────────────────────────────────
// MAIN ENTRY — route to correct fallback by context
// ─────────────────────────────────────────────────────────────

export function getOfflineResponse(prompt, systemInstruction) {
  const sys = (systemInstruction || '').toLowerCase();
  const prm = (prompt || '').toLowerCase();

  // ── cat file content
  if (sys.includes('backend file generator') || sys.includes('file generator for a hacking')) {
    const fileMatch = prompt.match(/for:\s*([^\n]+)/i);
    const fileName = fileMatch ? fileMatch[1].trim() : '';
    const orgMatch = systemInstruction.match(/organization\s+"([^"]+)"/i) || systemInstruction.match(/org[^"]*"([^"]+)"/i);
    const orgName = orgMatch ? orgMatch[1] : '';
    const generator = FILE_CONTENT[fileName];
    if (generator) return generator(orgName);
    // Generic fallback for unknown filenames
    return [
      `# ${fileName} — ${orgName || 'SYSTEM'}`,
      `# Last modified: ${new Date().toISOString()}`,
      ``,
      `${pick(['Configuration data','Operational records','Internal metadata','System state'])} for ${orgName || 'this node'}.`,
      `Access level required: ${pick(['ADMIN','ROOT','SYSTEM','CONFIDENTIAL'])}`,
      `Records: ${randInt(100,9999)}`,
      `Integrity: ${pick(['OK','VERIFIED','UNCHECKED'])}`,
    ].join('\n');
  }

  // ── spearphish / NPC chat
  if (sys.includes('your personality:') || (sys.includes('you are ') && sys.includes(' at '))) {
    const nameMatch = systemInstruction.match(/you are ([^,]+),/i);
    const personalityMatch = systemInstruction.match(/personality:\s*([^.]+)/i);
    const passMatch = systemInstruction.match(/password:\s*'([^']+)'/i);
    const empName = nameMatch ? nameMatch[1] : 'Employee';
    const personality = personalityMatch ? personalityMatch[1] : 'suspicious';
    const password = passMatch ? passMatch[1] : 'Temp@2024!';
    const resp = getOfflineSpearphishResponse(empName, '', '', personality, prompt, []);
    if (resp === '__YIELD__') return SPEARPHISH_YIELD(password);
    return resp;
  }

  // ── mimikatz
  if (sys.includes('mimikatz') || prm.includes('logonpasswords')) {
    const orgMatch = systemInstruction.match(/org is "([^"]+)"/i);
    const empMatch = systemInstruction.match(/employees:\s*([^.]+)\./i);
    const orgName = orgMatch ? orgMatch[1] : 'CORP';
    return getOfflineMimikatzOutput([], orgName);
  }

  // ── story / noir narrative
  if (sys.includes('noir narrative') || sys.includes('moral dilemma')) {
    const orgMatch = prompt.match(/breached ([^(]+)\(/i);
    const orgName = orgMatch ? orgMatch[1].trim() : 'the organisation';
    return getOfflineStory(orgName);
  }

  // ── intercepted comms
  if (sys.includes('packet sniffer') || sys.includes('ettercap') || prm.includes('intercepted')) {
    return getOfflineInterceptedComms(null, null);
  }

  // ── director difficulty narrative
  if (sys.includes('director') || prm.includes('harder') || prm.includes('easier')) {
    const direction = prm.includes('harder') ? 'harder' : 'easier';
    return getOfflineDirectorNarrative(direction);
  }

  // ── generic fallback
  return pick([
    "[SYSTEM] Signal degraded. Static analysis substituted.",
    "[SYSTEM] Offline mode active. Pre-cached response loaded.",
    "[SYSTEM] Director AI offline. Fallback heuristics engaged.",
  ]);
}
