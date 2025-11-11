import React from "react";

export default function GamePage(props) {
  const {
    playerId,
    stake,
    players,
    seconds,
    phase,
    callCountdown,
    lastCalled,
    audioPack,
    audioOn,
    playCallSound,
    called,
    renderCallerGrid,
    picks,
    renderCard,
    autoAlgoMark,
    canBingo,
    onPressBingo,
  } = props;

  return (
    <div className="min-h-full bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-300 text-sm">
              ID: <span className="font-mono">{(playerId || "").slice(0, 8)}</span>
            </div>
            <div className="flex gap-3 text-sm">
              <span>
                Stake: <b>{Number(stake).toFixed(2)}</b>
              </span>
              <span>
                Players: <b>{players}</b>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">Live Game</div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded bg-slate-700 font-mono" title="Time until next game start">
                {String(seconds).padStart(2, "0")}s
              </div>
              {phase === "calling" && (
                <div className="px-3 py-1 rounded bg-emerald-700 font-mono" title="Next call in">
                  {String(callCountdown).padStart(2, "0")}s
                </div>
              )}
            </div>
          </div>

          {phase === "calling" && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl md:text-5xl font-black tracking-wide">
                {lastCalled
                  ? `${lastCalled <= 15 ? "B" : lastCalled <= 30 ? "I" : lastCalled <= 45 ? "N" : lastCalled <= 60 ? "G" : "O"}-${lastCalled}`
                  : "Waiting..."}
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-slate-300">Audio:</span>
                  <select className="bg-slate-700 text-slate-100 rounded px-2 py-1" value={audioPack} onChange={() => {}}>
                    <option value="amharic">Amharic</option>
                    <option value="modern-amharic">Modern Amharic</option>
                  </select>
                  <input type="checkbox" checked={audioOn} onChange={() => {}} />
                  <button
                    className="ml-2 px-2 py-1 rounded bg-slate-700 hover:brightness-110"
                    onClick={() => (lastCalled ? playCallSound(lastCalled) : undefined)}
                  >
                    Test
                  </button>
                </label>
              </div>
            </div>
          )}

          <div className="text-slate-300 mb-2">Caller:</div>
          <div className="mb-6">{renderCallerGrid()}</div>

          <button
            onClick={onPressBingo}
            disabled={autoAlgoMark ? false : !canBingo}
            className={`w-full py-3 rounded text-lg font-bold ${
              autoAlgoMark || canBingo ? "bg-fuchsia-500 hover:brightness-110 text-black" : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            BINGO!
          </button>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-slate-300 mb-4">Your Boards:</div>
          <div className="flex flex-col gap-6">
            {picks.map((boardId) => (
              <div key={boardId} className="text-center">
                <div className="text-sm text-slate-400 mb-2">Board {boardId}</div>
                {renderCard(boardId, true)}
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-slate-400">Click on called numbers to mark them. FREE is always marked.</div>
        </div>
      </div>
    </div>
  );
}
