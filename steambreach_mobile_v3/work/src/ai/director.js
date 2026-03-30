// Split from UpdatedPeople.jsx
import { generateDirectorText } from './aiAdapter';

const DEFAULT_DIRECTOR = {
  metrics: {
    commandCount: 0, failedCommands: 0, exploitsLanded: 0, exploitsFailed: 0,
    rootsObtained: 0, nodesLooted: 0, timesTraced: 0, timesHoneypotted: 0,
    contractsCompleted: 0, contractsFailed: 0, moneyEarned: 0,
    sessionStartTime: Date.now(), lastEvalTime: Date.now(),
    commandTimestamps: [], exploitTimestamps: [], rootTimestamps: [],
  },
  skillScore: 0,
  modifiers: {
    proxyCapBonus: 0, traceSpeedMult: 1.0, honeypotChance: 0.15,
    tierWeights: { low: 0.33, mid: 0.34, high: 0.33 },
    blueTeamMult: 1.0, contractTimeMult: 1.0, hintCooldown: 0,
  },
  narrativeQueue: [], lastNarrativeTime: 0,
};

const evaluatePlayerSkill = (metrics) => {
  let score = 0;
  const totalTime = (Date.now() - metrics.sessionStartTime) / 60000;
  if (totalTime < 1) return 0;

  const cpm = metrics.commandCount / Math.max(totalTime, 1);
  if (cpm > 8) score += 20; else if (cpm > 4) score += 10; else if (cpm < 1.5) score -= 15;

  const failRate = metrics.failedCommands / Math.max(metrics.commandCount, 1);
  if (failRate < 0.05) score += 15; else if (failRate < 0.15) score += 5; else if (failRate > 0.35) score -= 20;

  if (metrics.exploitTimestamps.length >= 2 && metrics.rootTimestamps.length >= 1) {
    const recentExploits = metrics.exploitTimestamps.slice(-3);
    const recentRoots = metrics.rootTimestamps.slice(-3);
    const avgExploitToRoot = recentRoots.reduce((sum, rt) => {
      const matchingExploit = recentExploits.filter(et => et < rt).pop();
      return sum + (matchingExploit ? (rt - matchingExploit) / 1000 : 60);
    }, 0) / Math.max(recentRoots.length, 1);

    if (avgExploitToRoot < 15) score += 20; else if (avgExploitToRoot < 30) score += 10; else if (avgExploitToRoot > 120) score -= 15;
  }

  const moneyPerMin = metrics.moneyEarned / Math.max(totalTime, 1);
  if (moneyPerMin > 2000) score += 15; else if (moneyPerMin > 500) score += 5; else if (moneyPerMin < 50 && totalTime > 5) score -= 10;

  if (metrics.timesTraced > 3) score -= 10;
  if (metrics.timesHoneypotted > 2) score -= 10;
  if (metrics.timesTraced === 0 && metrics.nodesLooted > 3) score += 15;

  if (metrics.contractsCompleted > 0) score += metrics.contractsCompleted * 8;
  if (metrics.contractsFailed > metrics.contractsCompleted) score -= 10;

  return Math.max(-100, Math.min(100, score));
};

const computeDifficultyModifiers = (skillScore, inventory) => {
  const mods = { ...DEFAULT_DIRECTOR.modifiers };

  if (skillScore >= 40) {
    mods.proxyCapBonus = -1; mods.traceSpeedMult = 1.3; mods.honeypotChance = 0.25;
    mods.tierWeights = { low: 0.15, mid: 0.35, high: 0.50 }; mods.blueTeamMult = 1.5; mods.contractTimeMult = 0.75;
  } else if (skillScore >= 15) {
    mods.proxyCapBonus = 0; mods.traceSpeedMult = 1.1; mods.honeypotChance = 0.18;
    mods.tierWeights = { low: 0.25, mid: 0.40, high: 0.35 }; mods.blueTeamMult = 1.2; mods.contractTimeMult = 0.9;
  } else if (skillScore >= -15) {
    mods.proxyCapBonus = 0; mods.traceSpeedMult = 1.0; mods.honeypotChance = 0.15;
    mods.tierWeights = { low: 0.33, mid: 0.34, high: 0.33 }; mods.blueTeamMult = 1.0; mods.contractTimeMult = 1.0;
  } else if (skillScore >= -40) {
    mods.proxyCapBonus = 1; mods.traceSpeedMult = 0.8; mods.honeypotChance = 0.08;
    mods.tierWeights = { low: 0.55, mid: 0.35, high: 0.10 }; mods.blueTeamMult = 0.7; mods.contractTimeMult = 1.3;
  } else {
    mods.proxyCapBonus = 2; mods.traceSpeedMult = 0.6; mods.honeypotChance = 0.03;
    mods.tierWeights = { low: 0.70, mid: 0.25, high: 0.05 }; mods.blueTeamMult = 0.5; mods.contractTimeMult = 1.5;
  }
  return mods;
};

const getRewardMult = (mode) => {
  if (mode === 'operator') return 4;
  if (mode === 'field') return 2;
  return 1;
};

const getMaxProxySlots = (inventory, directorModifiers) => {
  let base = 2;
  if (inventory.includes('Overclock')) base = 3;
  if (inventory.includes('TorRelay')) base = 4;
  return Math.max(1, base + (directorModifiers?.proxyCapBonus || 0));
};

const pickWeightedTier = (weights) => {
  const roll = Math.random();
  if (roll < weights.low) return 'low';
  if (roll < weights.low + weights.mid) return 'mid';
  return 'high';
};

const generateDirectorNarrative = async (direction, skillScore) => {
  const tightening = [
    "[SIGINT] Encrypted chatter detected — global SOC teams are sharing IOCs from recent breaches.",
    "[SIGINT] Threat intel feeds updating. Corporate blue teams are on high alert across the sector.",
    "[SIGINT] Law enforcement cooperation detected. Attribution efforts intensifying.",
    "[SIGINT] New IDS signatures deployed across multiple target networks.",
    "[SIGINT] Dark web forums report increased honeypot deployment by federal agencies.",
  ];
  const easing = [
    "[SIGINT] Major ransomware attack elsewhere is drawing SOC attention. Sector defenses weakened.",
    "[SIGINT] Budget cuts reported across corporate security teams. Response times increasing.",
    "[SIGINT] A fixer left you a dead drop with network intel. Check your targets.",
    "[SIGINT] Insider reports: several orgs delayed their security patches this cycle.",
    "[SIGINT] Global incident response teams are overwhelmed. Detection rates dropping.",
  ];
  const pool = direction === 'harder' ? tightening : easing;
  return pool[Math.floor(Math.random() * pool.length)];
};

// ==========================================
// 6. DYNAMIC STORY ENGINE

export const generateStoryEvent = async (currentAlignment) => {
  const system = `You are the Story Director for STEAMBREACH, a gritty, M-rated cyberpunk hacking simulator.
The player just intercepted a highly sensitive communication on a random server.
Generate a short, dark, high-stakes scenario (e.g., cartel hit list, corporate assassination order, illegal organ harvesting ring, whistleblower needing protection, human trafficking intel, arms deal coordinates).
The scenario MUST have two clear paths: one heroic, one ruthless.
Return ONLY valid raw JSON in this exact format. No markdown, no conversational text:
{
  "story": "The intercepted raw message text (2-3 sentences max, gritty and urgent).",
  "good_action": "Short description of the heroic/moral choice",
  "evil_action": "Short description of the ruthless/profitable choice",
  "good_payout": 5000,
  "evil_payout": 25000,
  "good_align": 20,
  "evil_align": -20,
  "heat_cost": 5
}`;

  const prompt = `Generate a new darknet interception. Player's current moral alignment is ${currentAlignment} (-100 is pure evil, 100 is pure good). Tailor the scenario darkness to their alignment — darker scenarios for evil players, more whistleblower/rescue scenarios for good players.`;

  try {
    let text = await generateDirectorText(prompt, system);
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("[STORY] Generation failed", e);
  }
  return null;
};

export {
  DEFAULT_DIRECTOR,
  evaluatePlayerSkill,
  computeDifficultyModifiers,
  getRewardMult,
  getMaxProxySlots,
  pickWeightedTier,
  generateDirectorNarrative,
};
