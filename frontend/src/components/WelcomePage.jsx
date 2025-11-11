import React from "react";

export default function WelcomePage({ balance, bonus, playerId, setStake, setCurrentPage, socket }) {
  return (
    <div className="min-h-full bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">Hello, Player!</div>
          <button
            className="px-4 py-2 rounded bg-amber-500 text-black font-semibold"
            onClick={() => setCurrentPage("depositSelect")}
          >
            + Deposit
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-rose-500/80 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="uppercase text-xs">Balance</div>
            <div className="text-3xl font-extrabold">{balance} Birr</div>
            <div className="mt-2 text-xs opacity-90">Bonus</div>
            <div className="text-lg font-bold">{bonus} Birr</div>
          </div>
          <div className="text-6xl font-black opacity-60">ETB</div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            className="px-4 py-3 rounded bg-slate-800 hover:bg-slate-700"
            onClick={() => setCurrentPage("instructions")}
          >
            Instructions
          </button>

          <button
            className="px-4 py-3 rounded bg-slate-800 hover:bg-slate-700"
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?ref=${playerId}`)}
          >
            Invite Friends (copy link)
          </button>
        </div>

        {/* Play Section */}
        <div className="text-xl font-semibold">Play</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Mini", amount: 10, tag: 15, color: "bg-sky-600" },
            { label: "Sweety", amount: 20, tag: 74, color: "bg-orange-500" },
            { label: "Standard", amount: 50, tag: 40, color: "bg-violet-600" },
            { label: "Grand", amount: 100, tag: 60, color: "bg-teal-600" },
          ].map((card) => (
            <div key={card.amount} className={`${card.color} rounded-xl p-5 flex flex-col gap-4`}>
              <div className="text-sm opacity-90">{card.label}</div>
              <div className="text-3xl font-extrabold">{card.amount} Birr</div>
              <div className="mt-auto flex items-center justify-between">
                <button
                  className="px-4 py-2 rounded bg-black/30 hover:bg-black/40"
                  onClick={() => {
                    setStake(card.amount);
                    socket?.emit("set_stake", card.amount);
                    setCurrentPage("lobby");
                  }}
                >
                  Play now
                </button>
                <div className="h-12 w-12 rounded-full bg-black/20 flex items-center justify-center text-xl font-black">{card.tag}</div>
              </div>
            </div>
          ))}

          {/* Elite Card */}
          <div className="bg-emerald-600 rounded-xl p-5 flex flex-col gap-4">
            <div className="text-sm opacity-90">Elite</div>
            <div className="text-3xl font-extrabold">200 Birr</div>
            <div className="mt-auto flex items-center justify-between">
              <button
                className="px-4 py-2 rounded bg-black/30 hover:bg-black/40"
                onClick={() => {
                  setStake(200);
                  socket?.emit("set_stake", 200);
                  setCurrentPage("lobby");
                }}
              >
                Play now
              </button>
              <div className="h-12 w-12 rounded-full bg-black/20 flex items-center justify-center text-xl font-black">75</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400">Version preview</div>
      </div>
    </div>
  );
}
