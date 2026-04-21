import { useEffect, useMemo, useState } from "react";
import type { PhaseOneSave, NetworkNode } from "./phase1Types";
import {
  createStarterVirus,
  infectNode,
  tickAll,
  collectNodeData,
  sellRawData,
} from "./phase1Logic";

const STORAGE_KEY = "steambreach-phase1";

function createStarterNodes(): NetworkNode[] {
  const now = Date.now();

  return [
    {
      id: "node-1",
      label: "Coffee Shop Router",
      securityLevel: 1,
      dataValue: 1,
      owner: "civilian",
      status: "idle",
      infectedByVirusId: null,
      infectedAt: null,
      lastTickAt: now,
      storedData: 0,
    },
    {
      id: "node-2",
      label: "Local Clinic Gateway",
      securityLevel: 2,
      dataValue: 2,
      owner: "corp",
      status: "idle",
      infectedByVirusId: null,
      infectedAt: null,
      lastTickAt: now,
      storedData: 0,
    },
    {
      id: "node-3",
      label: "Municipal Traffic Relay",
      securityLevel: 3,
      dataValue: 3,
      owner: "corp",
      status: "idle",
      infectedByVirusId: null,
      infectedAt: null,
      lastTickAt: now,
      storedData: 0,
    },
  ];
}

function createInitialSave(): PhaseOneSave {
  return {
    player: {
      credits: 100,
      rawData: 0,
    },
    viruses: [createStarterVirus()],
    nodes: createStarterNodes(),
  };
}

function loadSave(): PhaseOneSave {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialSave();
    return JSON.parse(raw) as PhaseOneSave;
  } catch {
    return createInitialSave();
  }
}

export function usePhaseOneStore() {
  const [save, setSave] = useState<PhaseOneSave>(() => loadSave());

  useEffect(() => {
    const id = window.setInterval(() => {
      setSave((prev) => tickAll(prev));
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  }, [save]);

  const actions = useMemo(
    () => ({
      infectNodeWithVirus(nodeId: string, virusId: string) {
        setSave((prev) => {
          const virus = prev.viruses.find((v) => v.id === virusId);
          if (!virus) return prev;

          return {
            ...prev,
            nodes: prev.nodes.map((node) =>
              node.id === nodeId ? infectNode(node, virus) : node
            ),
          };
        });
      },

      collectNode(nodeId: string) {
        setSave((prev) => collectNodeData(prev, nodeId));
      },

      sellData(amount: number) {
        setSave((prev) => sellRawData(prev, amount));
      },
    }),
    []
  );

  return { save, actions };
}
