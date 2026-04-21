type Props = {
  credits: number;
  rawData: number;
  onSellAll: () => void;
};

export default function MarketPanel({ credits, rawData, onSellAll }: Props) {
  return (
    <div className="rounded-2xl border border-cyan-900/40 bg-black/40 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
        Black Market
      </h3>

      <div className="space-y-2 text-sm">
        <div className="text-white">Credits: {credits.toFixed(0)}</div>
        <div className="text-white">Raw data: {rawData.toFixed(1)}</div>
        <div className="text-zinc-400">Rate: 8 credits / data</div>
      </div>

      <button
        disabled={rawData < 1}
        onClick={onSellAll}
        className="mt-4 rounded-lg border border-fuchsia-500/40 px-3 py-2 text-sm text-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sell All Data
      </button>
    </div>
  );
}
