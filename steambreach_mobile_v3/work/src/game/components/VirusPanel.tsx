import type { Virus } from "../economy/phase1Types";

type Props = {
  viruses: Virus[];
  selectedVirusId: string | null;
  onSelectVirus: (virusId: string) => void;
};

export default function VirusPanel({
  viruses,
  selectedVirusId,
  onSelectVirus,
}: Props) {
  return (
    <div className="rounded-2xl border border-cyan-900/40 bg-black/40 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
        Virus Loadout
      </h3>

      <div className="space-y-2">
        {viruses.map((virus) => (
          <button
            key={virus.id}
            onClick={() => onSelectVirus(virus.id)}
            className={`w-full rounded-xl border p-3 text-left transition ${
              selectedVirusId === virus.id
                ? "border-cyan-400 bg-cyan-500/10"
                : "border-white/10 bg-white/5 hover:border-cyan-800"
            }`}
          >
            <div className="font-medium text-white">{virus.name}</div>
            <div className="mt-1 text-xs text-zinc-400">
              {virus.type} · power {virus.power} · stealth {virus.stealth}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
