import { generateDirectorText } from './aiAdapter';

// 1. YOUR FULL CONTRACT GENERATOR
export const generateAIContract = async (targetIP, nodeData, currentRep, arg4, arg5) => {
  const world = typeof arg4 === 'object' && arg4 !== null ? arg4 : {};
  const apiKey = typeof arg4 === 'string' ? arg4 : arg5;

  let minProb = 1;
  if (currentRep < 25) minProb = 75;
  else if (currentRep < 80) minProb = 50;
  else if (currentRep < 200) minProb = 10;

  const prob = Math.floor(Math.random() * (100 - minProb + 1)) + minProb;

  let timeLimit, heatCap, minReward, maxReward, minRep, maxRep, numTargets, riskLabel;

  if (prob <= 9) {
    numTargets = Math.floor(Math.random() * 2) + 3;
    timeLimit = 180;
    heatCap = 35;
    minReward = 50000;
    maxReward = 150000;
    minRep = 100;
    maxRep = 250;
    riskLabel = 'EXTREME';
  } else if (prob <= 49) {
    numTargets = Math.floor(Math.random() * 2) + 2;
    timeLimit = 240;
    heatCap = 45;
    minReward = 15000;
    maxReward = 55000;
    minRep = 50;
    maxRep = 120;
    riskLabel = 'HIGH';
  } else if (prob <= 74) {
    numTargets = Math.floor(Math.random() * 2) + 1;
    timeLimit = 300;
    heatCap = 75;
    minReward = 4000;
    maxReward = 18000;
    minRep = 20;
    maxRep = 55;
    riskLabel = 'MODERATE';
  } else {
    numTargets = 1;
    timeLimit = 600;
    heatCap = 90;
    minReward = 1000;
    maxReward = 4500;
    minRep = 10;
    maxRep = 25;
    riskLabel = 'LOW';
  }

  const reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
  const repReward = Math.floor(Math.random() * (maxRep - minRep + 1)) + minRep;

  const availableIPs = Object.keys(world).filter(
    (ip) => ip !== 'local' && ip !== targetIP && world[ip] && !world[ip].isHidden
  );
  const shuffledIPs = [...availableIPs].sort(() => 0.5 - Math.random());
  const actualNumTargets = Math.min(numTargets, 1 + shuffledIPs.length);
  const selectedIPs = [targetIP, ...shuffledIPs].slice(0, actualNumTargets);

  const actionTypes = ['exfil', 'destroy', 'ransom'];
  const objectives = [];

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
      targetFile =
        allFiles.length > 0
          ? allFiles[Math.floor(Math.random() * allFiles.length)]
          : 'proprietary_data.zip';
    }

    let label = '';
    let shortLabel = '';

    if (type === 'exfil') {
      label = `Extract sensitive data from ${node?.org?.orgName || 'target node'}`;
      shortLabel = `EXFIL data from ${ip}`;
    } else if (type === 'destroy') {
      label = `Destroy the target environment at ${node?.org?.orgName || 'target node'}`;
      shortLabel = `DESTROY host at ${ip}`;
    } else if (type === 'ransom') {
      label = `Deploy ransomware against ${node?.org?.orgName || 'target node'}`;
      shortLabel = `RANSOM host at ${ip}`;
    }

    objectives.push({
      ip,
      name: node?.org?.orgName || 'Unknown Node',
      type,
      targetFile,
      label,
      shortLabel,
      sec: node?.sec || 'mid',
      orgType: node?.org?.type || 'unknown',
      optional: false
    });
  }

  const primaryOrg = nodeData?.org?.orgName || 'Unknown Target';
  const primaryType = nodeData?.org?.type || 'unknown';
  const employeeCount = nodeData?.org?.employees?.length || 0;

  const clientPool = [
    'disgruntled insider',
    'rival contractor',
    'silent broker',
    'burned former employee',
    'fixer representing an unnamed buyer',
    'competitor with a private grievance'
  ];

  const motivePool = [
    'wants pressure applied without public attribution',
    'needs the target disrupted before an internal review',
    'is trying to erase leverage held by the target',
    'wants high-value data pulled before ownership changes hands',
    'needs the target embarrassed, weakened, or both',
    'is paying for damage, not spectacle'
  ];

  const conditionPool = [
    `${primaryOrg} has a ${primaryType}-class footprint with inconsistent internal hygiene`,
    employeeCount > 0
      ? `${employeeCount} employee identities have already been scraped from open sources`
      : `Employee visibility is limited, but surface metadata is still leaking`,
    nodeData?.sec === 'high' || nodeData?.sec === 'elite'
      ? `Target security posture is hardened and response time is expected to be fast`
      : `Target perimeter looks ordinary, but internal exposure may be easier than it appears`,
    `Fixer traffic suggests somebody else may be watching this target`,
    `Recent chatter implies the target is under internal strain and operational mistakes are likely`
  ];

  const complicationPool = [
    'Blue Team may respond aggressively if you get loud',
    'The client is withholding part of the story',
    'A second party may be tracking the same target',
    'Perimeter access may not be the weakest point',
    'Overexposure could burn this node for future use',
    'There is a non-zero chance of a setup'
  ];

  const client = clientPool[Math.floor(Math.random() * clientPool.length)];
  const motive = motivePool[Math.floor(Math.random() * motivePool.length)];
  const knownConditions = [...conditionPool].sort(() => 0.5 - Math.random()).slice(0, 2);
  const complication = complicationPool[Math.floor(Math.random() * complicationPool.length)];

  const fallbackContract = {
    probability: prob,
    objectives,
    desc: `[FIXER DOSSIER] ${client} says ${primaryOrg} is exposed. Payment clears only if the operation is completed clean enough to satisfy the buyer.`,
    briefing: `A ${client} has put ${primaryOrg} on the board. The buyer ${motive}. The target is not random, and the money says the damage needs to feel deliberate.`,
    client,
    motive,
    targetProfile: `${primaryOrg} • ${primaryType.toUpperCase()} • ${nodeData?.sec?.toUpperCase() || 'MID'} SECURITY`,
    knownConditions,
    complication,
    riskLabel,
    timeLimit,
    reward,
    repReward,
    heatCap,
    forbidden_tools: [],
    isAmbush: prob <= 20 && Math.random() < 0.2
  };

  const prompt = `You are a darknet fixer writing mission dossiers for a hacking game. Return ONLY JSON shape: { "desc": string, "briefing": string, "client": string, "motive": string, "targetProfile": string, "knownConditions": string[], "complication": string }`;

  try {
    let aiText = await generateDirectorText(prompt, '');
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallbackContract;
    const parsedData = JSON.parse(jsonMatch[0]);
    return { ...fallbackContract, ...parsedData };
  } catch (e) {
    return fallbackContract;
  }
};

// 2. REQUIRED BUILD FIXES
export const generateOrgNarrative = generateAIContract;

export const generateOrgFileSystem = (orgName) => {
  return { '/': ['home', 'var', 'etc'], '/home/admin': ['passwords.txt'] };
};

export const generateInterceptedComms = async () => "Packet stream encrypted.";

export const invokeBlueTeamAI = async () => "Blue Team hunting active.";
