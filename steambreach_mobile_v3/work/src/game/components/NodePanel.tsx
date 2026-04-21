import type { NetworkNode } from "../economy/phase1Types";

type Props = {
  nodes: NetworkNode[];
  selectedVirusId: string | null;
  onInfect: (nodeId: string) => void;
  onCollect: (nodeId: string) => void;
};

export default function NodePanel({
  nodes,
  selectedVirusId,
  onInfect,
  onCollect,
}: Props) {
  return (
    <div className="rounded-2xl border border-cyan-900/40 bg-black/40 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
        Network Nodes
      </h3>

      <div className="space-y-3">
        {nodes.map((node) => (
          <div key={node.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-white">{node.label}</div>
                <div className="mt-1 text-xs text-zinc-400">
                  sec {node.securityLevel} · data value {node.dataValue} · {node.owner}
                </div>
              </div>

              <div
                className={`rounded-full px-2 py-1 text-xs ${
                  node.status === "infected"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-zinc-500/15 text-zinc-300"
                }`}
              >
                {node.status}
              </div>
            </div>

            <div className="mt-3 text-sm text-cyan-200">
              Stored data: {node.storedData.toFixed(1)}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                disabled={!selectedVirusId || node.status !== "idle"}
                onClick={() => onInfect(node.id)}
                className="rounded-lg border border-cyan-500/40 px-3 py-2 text-sm text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Infect
              </button>

              <button
                disabled={node.storedData <= 0}
                onClick={() => onCollect(node.id)}
                className="rounded-lg border border-emerald-500/40 px-3 py-2 text-sm text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Collect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
