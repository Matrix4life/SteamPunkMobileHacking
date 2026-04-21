export type VirusPayloadType = "data_siphon";

export type Virus = {
  id: string;
  name: string;
  type: VirusPayloadType;
  power: number;
  stealth: number;
  createdAt: number;
};

export type NodeStatus = "idle" | "infected";

export type NetworkNode = {
  id: string;
  label: string;
  securityLevel: number;
  dataValue: number;
  owner: "corp" | "civilian" | "faction";
  status: NodeStatus;
  infectedByVirusId: string | null;
  infectedAt: number | null;
  lastTickAt: number;
  storedData: number;
};

export type PlayerEconomy = {
  credits: number;
  rawData: number;
};

export type PhaseOneSave = {
  player: PlayerEconomy;
  viruses: Virus[];
  nodes: NetworkNode[];
};
