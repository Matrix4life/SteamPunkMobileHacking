import { generateDirectorText } from './aiAdapter';

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
    timeLimit = 180; heatCap = 35; minReward = 50000; maxReward = 150000;
    minRep = 100; maxRep = 250; riskLabel = 'EXTREME';
  } else if (prob <= 49) {
    numTargets = Math.floor(Math.random() * 2) + 2;
    timeLimit = 240; heatCap = 45; minReward = 15000; maxReward = 55000;
    minRep = 50; maxRep = 120; riskLabel = 'HIGH';
  } else if (prob <= 74) {
    numTargets = Math.floor(Math.random() * 2) + 1;
    timeLimit = 300; heatCap = 75; minReward = 4000; maxReward = 18000;
    minRep = 20; maxRep = 55; riskLabel = 'MODERATE';
  } else {
    numTargets = 1; timeLimit = 600; heatCap = 90; minReward = 1000; maxReward = 4500;
    minRep = 10; maxRep = 25; riskLabel = 'LOW';
  }

  const reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
  const repReward = Math.floor(Math.random() * (maxRep - minRep + 1)) + minRep;

  const availableIPs = Object.keys(world).filter(ip => ip !== 'local' && ip !== targetIP && world[ip] && !world[ip].isHidden);
  const shuffledIPs = [...availableIPs].sort(() => 0.5 - Math.random());
  const selectedIPs = [targetIP, ...shuffledIPs].slice(0, Math.min(numTargets, 1 + shuffledIPs.length));

  const objectives = selectedIPs.map(ip => {
    const node = ip === targetIP ? nodeData : world[ip];
    const type = ['exfil', 'destroy', 'ransom'][Math.floor(Math.random() * 3)];
    return {
      ip, type, name: node?.org?.orgName || 'Unknown Node',
      label: `${type.toUpperCase()} target at ${ip}`,
      targetFile: type === 'exfil' ? 'proprietary_data.zip' : null
    };
  });

  const fallbackContract = { 
    probability: prob, objectives, riskLabel, timeLimit, reward, repReward, heatCap, 
    desc: "Infiltration requested.", briefing: "A client requires action against these nodes.",
    targetProfile: `${nodeData?.org?.orgName || 'Unknown'} Network`, knownConditions: [], complication: "None."
  };

  const prompt = `Return ONLY raw JSON Mission dossier for: ${nodeData?.org?.orgName}. Shape: {"desc": string, "briefing": string, "client": string, "motive": string, "targetProfile": string, "knownConditions": string[], "complication": string}`;

  try {
    let aiText = await generateDirectorText(prompt, '');
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallbackContract;
    return { ...fallbackContract, ...JSON.parse(jsonMatch[0]) };
  } catch (e) { return fallbackContract; }
};

export const generateOrgNarrative = generateAIContract;
export const generateOrgFileSystem = (orgName) => ({ '/': ['home', 'var'], '/home/admin': ['passwords.txt'] });
export const generateInterceptedComms = async () => "Encrypted traffic detected.";
export const invokeBlueTeamAI = async () => "Blue Team alert level: NOMINAL.";
