import type { NetworkNode, Virus, PhaseOneSave } from "./phase1Types";

export function createStarterVirus(name = "WIDOW-1"): Virus {
  return {
    id: crypto.randomUUID(),
    name,
    type: "data_siphon",
    power: 1,
    stealth: 1,
    createdAt: Date.now(),
  };
}

export function infectNode(node: NetworkNode, virus: Virus): NetworkNode {
  if (node.status !== "idle") return node;

  const now = Date.now();

  return {
    ...node,
    status: "infected",
    infectedByVirusId: virus.id,
    infectedAt: now,
    lastTickAt: now,
  };
}

export function getNodeGenerationPerSecond(
  node: NetworkNode,
  virus: Virus | undefined
): number {
  if (!virus) return 0;
  if (node.status !== "infected") return 0;

  const baseRate = 0.5;
  const powerBonus = virus.power * 0.35;
  const nodeBonus = node.dataValue * 0.25;
  const securityPenalty = node.securityLevel * 0.1;

  return Math.max(0.1, baseRate + powerBonus + nodeBonus - securityPenalty);
}

export function tickNode(
  node: NetworkNode,
  virus: Virus | undefined,
  now = Date.now()
): NetworkNode {
  if (node.status !== "infected") return node;

  const elapsedSeconds = Math.max(0, (now - node.lastTickAt) / 1000);
  if (elapsedSeconds <= 0) return node;

  const generated = getNodeGenerationPerSecond(node, virus) * elapsedSeconds;

  return {
    ...node,
    lastTickAt: now,
    storedData: node.storedData + generated,
  };
}

export function tickAll(save: PhaseOneSave, now = Date.now()): PhaseOneSave {
  const virusMap = new Map(save.viruses.map((v) => [v.id, v]));

  return {
    ...save,
    nodes: save.nodes.map((node) =>
      tickNode(
        node,
        node.infectedByVirusId ? virusMap.get(node.infectedByVirusId) : undefined,
        now
      )
    ),
  };
}

export function collectNodeData(save: PhaseOneSave, nodeId: string): PhaseOneSave {
  const node = save.nodes.find((n) => n.id === nodeId);
  if (!node) return save;

  return {
    ...save,
    player: {
      ...save.player,
      rawData: save.player.rawData + node.storedData,
    },
    nodes: save.nodes.map((n) =>
      n.id === nodeId ? { ...n, storedData: 0 } : n
    ),
  };
}

export function sellRawData(
  save: PhaseOneSave,
  amount: number,
  pricePerUnit = 8
): PhaseOneSave {
  const safeAmount = Math.max(0, Math.min(amount, Math.floor(save.player.rawData)));
  if (safeAmount <= 0) return save;

  return {
    ...save,
    player: {
      credits: save.player.credits + safeAmount * pricePerUnit,
      rawData: save.player.rawData - safeAmount,
    },
  };
}
