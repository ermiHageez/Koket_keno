import React, { useEffect, useState, useContext } from "react";
import { userAPI } from "../api/api";
import { UserContext } from "../context/UserContext";
import "./componentsCSS/winnergrid.css";

const WinnerGrid = ({ selectedNumbers = [], gameId, onGameEnd }) => {
  const { user, setUser } = useContext(UserContext);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [visibleNumbers, setVisibleNumbers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [missedNumbers, setMissedNumbers] = useState([]);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);

  // generate 20 unique numbers 1..50 (keeps existing behaviour)
  const generateSystemNumbers = () => {
    const s = new Set();
    while (s.size < 20) s.add(Math.floor(Math.random() * 50) + 1);
    return Array.from(s);
  };

  useEffect(() => {
    if (!user || !Array.isArray(selectedNumbers) || selectedNumbers.length === 0) return;
    let cancelled = false;

    const run = async () => {
      setError("");
      // Always verify latest balance from backend (DB is source of truth)
      try {
        const balRes = await userAPI.getBalance(user.telegramId);
        const latest = Number(balRes?.data?.balance ?? user.balance ?? 0);
        if (latest < 10) {
          if (!cancelled) setError("❌ Insufficient balance to play this game (10 ETB required)");
          return;
        }
      } catch (err) {
        // If balance check fails, still allow optimistic play but warn
        console.warn("Could not verify balance before play, proceeding optimistically", err);
      }

      if (cancelled) return;
      setFinished(false);
      setMatches([]);
      setMissedNumbers([]);
      setVisibleNumbers([]);

      const draw = generateSystemNumbers();
      setDrawnNumbers(draw);

      let idx = 0;
      const currentMatches = [];
      const interval = setInterval(() => {
        if (cancelled) {
          clearInterval(interval);
          return;
        }

        const num = draw[idx];
        // reveal next
        if (num === undefined) {
          clearInterval(interval);
          // finalize
          const matched = [...currentMatches];
          const missed = selectedNumbers.filter((n) => !matched.includes(n));
          if (!cancelled) {
            setMatches(matched);
            setMissedNumbers(missed);
            setFinished(true);
          }

          const matchCount = matched.length;
          const winAmount = matchCount >= 10 ? 10 * matchCount : -10; // keep your winning rule

          // persist result and refresh balance from DB
          userAPI
            .playGame({ userId: user.telegramId, win: winAmount, gameId })
            .then(async () => {
              try {
                const balRes2 = await userAPI.getBalance(user.telegramId);
                const newBal = Number(balRes2?.data?.balance ?? (user.balance + winAmount));
                if (!cancelled) {
                  if (setUser) setUser((prev) => ({ ...(prev ?? {}), balance: newBal }));
                  onGameEnd && onGameEnd(winAmount, matched, newBal);
                }
              } catch (e) {
                // fallback optimistic update
                if (!cancelled) {
                  if (setUser) setUser((prev) => ({ ...(prev ?? {}), balance: (prev?.balance ?? 0) + winAmount }));
                  onGameEnd && onGameEnd(winAmount, matched, (user.balance + winAmount));
                }
              }
            })
            .catch(async () => {
              // try to fetch balance anyway; otherwise optimistic update
              try {
                const balRes3 = await userAPI.getBalance(user.telegramId);
                const newBal = Number(balRes3?.data?.balance ?? (user.balance + winAmount));
                if (!cancelled) {
                  if (setUser) setUser((prev) => ({ ...(prev ?? {}), balance: newBal }));
                  onGameEnd && onGameEnd(winAmount, matched, newBal);
                }
              } catch (err) {
                if (!cancelled) {
                  if (setUser) setUser((prev) => ({ ...(prev ?? {}), balance: (prev?.balance ?? 0) + winAmount }));
                  onGameEnd && onGameEnd(winAmount, matched, (user.balance + winAmount));
                }
              }
            });

          return;
        }

        // reveal animation step
        setVisibleNumbers((prev) => [...prev, num]);

        if (selectedNumbers.includes(num)) {
          currentMatches.push(num);
          // update matches for instant green highlight on match
          setMatches([...currentMatches]);
        }

        idx++;
      }, 400);

      // cleanup if component unmounts while interval running
      return () => clearInterval(interval);
    };

    const cleanupPromise = run();

    return () => {
      cancelled = true;
      // if run returned cleanup interval, ensure it's cleared (run may be async)
      if (cleanupPromise && typeof cleanupPromise === "function") cleanupPromise();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNumbers, user, gameId]);

  return (
    <div className="winner-container">
      <h2>🏆 Winning Numbers</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="winner-grid" role="list">
        {visibleNumbers.map((num, i) => {
          const isMatched = matches.includes(num);
          const isSelected = selectedNumbers.includes(num);
          // missed only after finished: user picked but not matched
          const isMissed = finished && isSelected && !isMatched;
          const cls = isMatched ? "matched" : isMissed ? "missed" : isSelected ? "selected" : "";
          return (
            <button key={`${num}-${i}`} className={`winner-btn ${cls}`} type="button">
              {num}
            </button>
          );
        })}
      </div>

      <div className="match-summary">
        <h3>
          🎯 You matched <span style={{ color: "#32CD32" }}>{matches.length}</span> number
          {matches.length !== 1 ? "s" : ""}!
        </h3>

        <div className="match-details">
          <div>
            <strong style={{ marginRight: 8 }}>Matched:</strong>
            {matches.length ? matches.map((n, i) => (
              <button key={`m-${n}-${i}`} className="match-btn" type="button">{n}</button>
            )) : <span>—</span>}
          </div>

          <div style={{ marginTop: 8 }}>
            <strong style={{ marginRight: 8 }}>Missed (your picks that didn't match):</strong>
            {missedNumbers.length ? missedNumbers.map((n, i) => (
              <button key={`miss-${n}-${i}`} className="missed-btn" type="button">{n}</button>
            )) : <span>—</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerGrid;
