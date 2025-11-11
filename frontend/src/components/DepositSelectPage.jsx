import React from "react";

export default function DepositSelectPage({ providers, setSelectedProvider, setCurrentPage }) {
  return (
    <div className="min-h-full bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-2xl font-bold mb-4">Select Payment Platform</div>
        <div className="bg-emerald-600/80 rounded-lg px-4 py-2 text-sm mb-3">Recommended</div>
        <div className="space-y-3">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProvider(p.id);
                setCurrentPage("depositConfirm");
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-4 flex items-center justify-between border border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{p.logo}</div>
                <div className="text-lg">{p.name}</div>
              </div>
              <div className="text-slate-400">›</div>
            </button>
          ))}
        </div>
        <div className="mt-6">
          <button className="px-4 py-2 bg-slate-800 rounded" onClick={() => setCurrentPage("welcome")}>Back</button>
        </div>
      </div>
    </div>
  );
}
