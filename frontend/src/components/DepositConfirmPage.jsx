import React from "react";

export default function DepositConfirmPage({ info, depositAmount, setDepositAmount, depositMessage, setDepositMessage, depositTimerSec, startTimer, onSubmit, ocrLoading, setCurrentPage }) {
  return (
    <div className="min-h-full bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-4">
        <div className="text-2xl font-bold">Confirm payment</div>
        <div>
          <div className="text-slate-300 text-sm mb-2">Deposit account</div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-lg font-mono">{info.account}</div>
            <div className="text-sm text-slate-400 mt-1">{info.name}</div>
          </div>
        </div>
        <div className="space-y-3">
          <input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Amount" className="w-full bg-slate-800 rounded-xl p-3 border border-slate-700 outline-none" />
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 rounded bg-emerald-600 text-black font-semibold" onClick={startTimer}>Start 3:00 Timer</button>
            <div className="font-mono text-slate-300">{depositTimerSec > 0 ? `${Math.floor(depositTimerSec / 60)}:${String(depositTimerSec % 60).padStart(2, "0")}` : "Not started"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-slate-300">Paste deposit confirmation message</div>
            <textarea value={depositMessage} onChange={(e) => setDepositMessage(e.target.value)} placeholder="Paste SMS/message that confirms the transfer" rows={6} className="w-full bg-slate-800 rounded-xl p-3 border border-slate-700 outline-none text-sm" />
            <div className="text-xs text-slate-400">You can paste the provider confirmation message or SMS text here (no screenshot required).</div>
          </div>
          <button className="w-full py-3 rounded-xl bg-emerald-600 text-black font-bold disabled:opacity-60" disabled={!depositAmount || !depositMessage || ocrLoading} onClick={onSubmit}>
            {ocrLoading ? "Verifying…" : "Submit Deposit"}
          </button>
        </div>
        <div className="mt-6">
          <div className="text-xl font-semibold mb-2">How to deposit</div>
          <div className="bg-slate-800 rounded-xl p-4 text-slate-300 text-sm">Send the amount to the account above using your selected platform, then paste the confirmation SMS here and submit.</div>
        </div>
        <div>
          <button className="px-4 py-2 bg-slate-800 rounded" onClick={() => setCurrentPage("depositSelect")}>Back</button>
        </div>
      </div>
    </div>
  );
}
