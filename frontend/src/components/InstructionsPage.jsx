import React from "react";

export default function InstructionsPage({ setCurrentPage }) {
  return (
    <div className="min-h-full bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-800 rounded-xl p-6 space-y-4">
        <div className="text-2xl font-bold mb-2">How to play</div>
        <ol className="list-decimal space-y-2 ml-5 text-slate-200 text-sm">
          <li>Choose a bet house (10/20/50/100/200 Birr).</li>
          <li>Select up to 2 boards in the lobby.</li>
          <li>Press Start Game to enter the live game.</li>
          <li>During calling, mark called numbers on your boards or enable auto mark.</li>
          <li>Press BINGO only when a full row/column/diagonal is complete including the last call.</li>
        </ol>
        <div className="text-2xl font-bold mt-6">Deposits & Withdrawals</div>
        <p className="text-slate-200 text-sm">Use the Deposit button on the Welcome page. Withdrawal flow can be added similarly.</p>
        <div className="flex justify-end">
          <button className="px-4 py-2 rounded bg-slate-700" onClick={() => setCurrentPage("welcome")}>Back</button>
        </div>
      </div>
    </div>
  );
}
