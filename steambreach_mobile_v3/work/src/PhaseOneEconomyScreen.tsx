import { useState } from "react";
import { usePhaseOneStore } from "./game/economy/phase1Store";
import VirusPanel from "./game/components/VirusPanel";
import NodePanel from "./game/components/NodePanel";
import MarketPanel from "./game/components/MarketPanel";

export default function PhaseOneEconomyScreen() {
  const { save, actions } = usePhaseOneStore();
  const [selectedVirusId, setSelectedVirusId] = useState<string | null>(null);

  const activeVirusId = selectedVirusId ?? save.viruses[0]?.id ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold tracking-[0.12em] text-cyan-300">
          STEAMBREACH // PHASE 1 ECON LOOP
        </h1>

        <div className="grid gap-4 lg:grid-cols-3">
          <VirusPanel
            viruses={save.viruses}
            selectedVirusId={activeVirusId}
            onSelectVirus={setSelectedVirusId}
          />

          <NodePanel
            nodes={save.nodes}
            selectedVirusId={activeVirusId}
            onInfect={(nodeId) => {
              if (!activeVirusId) return;
              actions.infectNodeWithVirus(nodeId, activeVirusId);
            }}
            onCollect={actions.collectNode}
          />

          <MarketPanel
            credits={save.player.credits}
            rawData={save.player.rawData}
            onSellAll={() => actions.sellData(Math.floor(save.player.rawData))}
          />
        </div>
      </div>
    </div>
  );
}
