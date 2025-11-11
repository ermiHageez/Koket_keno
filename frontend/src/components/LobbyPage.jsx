// Lobby page UI component
import React from "react";

export default function LobbyPage(props) {
  const { playerId, stake, players, seconds, board, picks, togglePick, isReady, handleStartGame, renderCard, audioPack, audioOn, setAudioPack, setAudioOn, autoMark, setAutoMark, autoAlgoMark, setAutoAlgoMark } = props;
  return (
    <div className="min-h-full bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-slate-300 text-sm">ID: <span className="font-mono">{(playerId || "").slice(0,8)}</span></div>
            <div className="flex gap-4 text-sm">
              <span>Stake: <b>{Number(stake).toFixed(2)}</b></span>
              <span>Players: <b>{players}</b></span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="text-2xl font-bold">Select Your Boards</div>
            <div className="px-4 py-2 rounded bg-slate-700 font-mono text-lg">{String(seconds).padStart(2,'0')}s</div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-6">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-300">Audio:</span>
              <select className="bg-slate-700 text-slate-100 rounded px-2 py-1" value={audioPack} onChange={(e) => setAudioPack(e.target.value)}>
                <option value="amharic">Amharic</option>
                <option value="modern-amharic">Modern Amharic</option>
              </select>
              <input type="checkbox" checked={audioOn} onChange={(e) => setAudioOn(e.target.checked)} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={autoMark} onChange={(e) => setAutoMark(e.target.checked)} />
              <span className="text-slate-300">Auto mark (me)</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={autoAlgoMark} onChange={(e) => setAutoAlgoMark(e.target.checked)} />
              <span className="text-slate-300">Auto algorithm mark</span>
            </label>
          </div>

          <div className="grid grid-cols-10 gap-2 mb-6">
            {board.map((n) => {
              const isPicked = picks.includes(n);
              const disabled = false;
              return (
                <button
                  key={n}
                  onClick={() => togglePick(n)}
                  disabled={disabled}
                  className={["aspect-square rounded text-xs md:text-sm flex items-center justify-center border font-semibold", isPicked ? "bg-amber-500 border-amber-400 text-black" : "bg-slate-700 border-slate-600", disabled ? "opacity-60 cursor-not-allowed" : "hover:brightness-110"].join(" ")}
                >
                  {n}
                </button>
              );
            })}
          </div>

          {picks.length > 0 && (
            <div className="mb-6">
              <div className="text-slate-300 mb-4">Your Selected Boards ({picks.length}/2):</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {picks.map((boardId) => (
                  <div key={boardId} className="bg-slate-700 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-2">Board {boardId}</div>
                    {renderCard(boardId, false)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-slate-300">Selected: {picks.length}/2 boards</div>
            <button onClick={handleStartGame} disabled={picks.length === 0 || isReady} className={`px-6 py-3 rounded-lg font-bold text-lg ${picks.length > 0 && !isReady ? 'bg-green-500 hover:bg-green-600 text-black' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
              {isReady ? "Ready!" : "Start Game"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
