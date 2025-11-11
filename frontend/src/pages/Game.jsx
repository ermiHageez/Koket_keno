import { useEffect, useMemo, useRef, useState } from "react";
import "./Game.css"; // <-- new: lightweight fallback stylesheet
import { io } from "socket.io-client";
import { getBoard, loadBoards } from "../boards";
import {
  checkBingo as _checkBingo,
  canBingo as _canBingo,
  hasBingoIncludingLastCalled as _hasBingoIncludingLastCalled,
  numberToLetter as _numberToLetter,
} from "../GameLogic";
import WelcomePage from "../components/WelcomePage";
import InstructionsPage from "../components/InstructionsPage";
import DepositSelectPage from "../components/DepositSelectPage";
import DepositConfirmPage from "../components/DepositConfirmPage";
import LobbyPage from "../components/LobbyPage";
import GamePage from "../components/GamePage";
// api modules
import { userAPI, authAPI } from "../api/api";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [playerId, setPlayerId] = useState("");
  const [stake, setStake] = useState(10);
  const [phase, setPhase] = useState("lobby");
  const [seconds, setSeconds] = useState(60);
  const [prize, setPrize] = useState(0);
  const [players, setPlayers] = useState(0);
  const [balance, setBalance] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [called, setCalled] = useState([]);
  const [picks, setPicks] = useState([]);
  const [boardHtmlProvided, setBoardHtmlProvided] = useState(false);
  const [currentPage, setCurrentPage] = useState("welcome");
  const [isReady, setIsReady] = useState(false);
  const [markedNumbers, setMarkedNumbers] = useState(new Set());
  const [callCountdown, setCallCountdown] = useState(0);
  const [lastCalled, setLastCalled] = useState(null);
  const [autoMark, setAutoMark] = useState(false);
  const [autoAlgoMark, setAutoAlgoMark] = useState(false);
  const [audioPack, setAudioPack] = useState("amharic");
  const [audioOn, setAudioOn] = useState(true);
  const callTimerRef = useRef(null);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositSms, setDepositSms] = useState("");
  const [depositImage, setDepositImage] = useState(null);
  const [depositMessage, setDepositMessage] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [depositTimerSec, setDepositTimerSec] = useState(0);
  const [depositWindowStart, setDepositWindowStart] = useState(null);
  const [depositWindowEnd, setDepositWindowEnd] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const providers = [
    { id: "telebirr", name: "Telebirr", logo: "🌀" },
    { id: "ebirr", name: "Ebirr", logo: "🟢" },
    { id: "cbe", name: "CBE", logo: "🏦" },
    { id: "awash", name: "Awash", logo: "🏦" },
    { id: "dashen", name: "Dashen", logo: "🏦" },
    { id: "boa", name: "Bank of Abyssinia", logo: "🏦" },
  ];

  const providerToAccount = {
    telebirr: { account: "0966 000 0000", name: "Company Telebirr" },
    ebirr: { account: "0911 000 000", name: "Company Ebirr" },
    cbe: { account: "1000533912889", name: "Eyoel Michael" },
    awash: { account: "0111 2222 3333", name: "Company Awash" },
    dashen: { account: "0123 4567 8901", name: "Company Dashen" },
    boa: { account: "0222 3333 4444", name: "Company BoA" },
  };

  useEffect(() => {
    async function checkRegistration() {
      try {
        const stored = localStorage.getItem("userInfo");
        if (stored) {
          setUserInfo(JSON.parse(stored));
          return;
        }
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setShowRegisterModal(true);
          return;
        }
        const res = await authAPI.checkUser(userId);
        if (res?.data?.exists) {
          localStorage.setItem("userInfo", JSON.stringify(res.data));
          setUserInfo(res.data);
        } else {
          setShowRegisterModal(true);
        }
      } catch (e) {
        console.error("Registration check failed", e);
        setShowRegisterModal(true);
      }
    }
    checkRegistration();

    const s = io(
      process.env.NODE_ENV === "production" ? window.location.origin : "http://localhost:3001",
      { transports: ["websocket"] }
    );
    setSocket(s);

    s.on("init", (d) => {
      if (!d) return;
      setPhase(d.phase || "lobby");
      setSeconds(d.seconds ?? 60);
      setStake(d.stake ?? 10);
      setPrize(d.prize ?? 0);
      setCalled(Array.isArray(d.called) ? d.called : []);
      setPlayerId(d.playerId || "");
      if (d.phase === "calling") setCurrentPage("game");
    });

    s.on("tick", (d) => {
      if (!d) return;
      setSeconds(d.seconds ?? seconds);
      setPlayers(d.players ?? players);
      setPrize(d.prize ?? prize);
      setStake(d.stake ?? stake);
    });

    s.on("phase", (d) => {
      if (!d) return;
      setPhase(d.phase);
      if (d.phase === "calling" && currentPage === "lobby") setCurrentPage("game");
    });

    s.on("players", (d) => setPlayers(d.count ?? 0));

    s.on("call", (d) => {
      if (!d) return;
      setCalled(Array.isArray(d.called) ? d.called : (called) => called.concat(d.number));
      setLastCalled(d.number);
      setCallCountdown(3);
      if (autoMark || autoAlgoMark) {
        setMarkedNumbers((prev) => {
          const next = new Set(prev);
          next.add(d.number);
          return next;
        });
      }
      if (audioOn) {
        playCallSound(d.number);
      }
    });

    s.on("winner", (d) => {
      alert(`Winner: ${d.playerId}\nPrize: ${d.prize}`);
      setPicks([]);
      setMarkedNumbers(new Set());
      setCurrentPage("lobby");
      setIsReady(false);
    });

    s.on("game_start", () => setCurrentPage("game"));
    s.on("start_game_confirm", () => setCurrentPage("game"));

    return () => {
      try {
        s.disconnect();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recheckRegistration = async () => {
    setShowRegisterModal(false);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setShowRegisterModal(true);
        return;
      }
      const res = await authAPI.checkUser(userId);
      if (res?.data?.exists) {
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        setUserInfo(res.data);
        setShowRegisterModal(false);
        alert("Registration found — welcome!");
      } else {
        setShowRegisterModal(true);
        alert("Still not registered. Please complete registration with the Telegram bot.");
      }
    } catch (e) {
      console.error(e);
      setShowRegisterModal(true);
      alert("Could not verify registration. Try again later.");
    }
  };

  const openTelegramBot = () => window.open("https://t.me/kenowabot", "_blank");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("picks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setPicks(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("picks", JSON.stringify(picks));
    } catch {}
  }, [picks]);

  useEffect(() => {
    fetch("/boards.html")
      .then((r) => r.text())
      .then((html) => {
        loadBoards(html);
        setBoardHtmlProvided(true);
      })
      .catch(() => setBoardHtmlProvided(false));
  }, []);

  useEffect(() => {
    if (socket && picks.length > 0) socket.emit("select_numbers", picks);
  }, [socket, picks]);

  useEffect(() => {
    void userInfo;
  }, [userInfo]);

  useEffect(() => {
    if (depositTimerSec <= 0) return;
    const id = window.setInterval(() => setDepositTimerSec((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [depositTimerSec]);

  useEffect(() => {
    if (phase !== "calling") {
      setCallCountdown(0);
      return;
    }
    if (callCountdown <= 0) return;
    const id = window.setInterval(() => setCallCountdown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [phase, callCountdown]);

  const board = useMemo(() => Array.from({ length: 100 }, (_, i) => i + 1), []);

  const togglePick = (n) => {
    if (phase !== "lobby" && phase !== "countdown") return;
    setPicks((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= 2) return prev;
      return [...prev, n];
    });
  };

  const handleStartGame = () => {
    if (picks.length === 0) {
      alert("Please select at least one board before starting!");
      return;
    }
    setIsReady(true);
    socket?.emit("start_game");
    setCurrentPage("game");
  };

  const toggleMark = (number) => {
    if (phase !== "calling") return;
    if (autoAlgoMark) return;
    setMarkedNumbers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(number)) newSet.delete(number);
      else newSet.add(number);
      return newSet;
    });
  };

  // use called numbers as marks when autoMark is enabled
  const canBingo = _canBingo(picks, getBoard, autoMark ? new Set(called) : markedNumbers);

  const hasBingoIncludingLastCalled = () =>
    _hasBingoIncludingLastCalled(picks, getBoard, lastCalled, markedNumbers, called, autoAlgoMark, autoMark);

  const onPressBingo = () => {
    if (!hasBingoIncludingLastCalled()) {
      alert("No valid BINGO found that includes the last called number. Keep marking!");
      return;
    }
    socket?.emit("bingo");
  };

  const renderCallerGrid = () => {
    const columns = [
      Array.from({ length: 15 }, (_, i) => i + 1),
      Array.from({ length: 15 }, (_, i) => i + 16),
      Array.from({ length: 15 }, (_, i) => i + 31),
      Array.from({ length: 15 }, (_, i) => i + 46),
      Array.from({ length: 15 }, (_, i) => i + 61),
    ];
    const headers = ["B", "I", "N", "G", "O"];
    return (
      <div>
        <div className="grid grid-cols-5 gap-1 mb-2">
          {headers.map((h) => (
            <div key={h} className="text-center font-bold text-slate-300">
              {h}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1">
          {columns.map((col, cIdx) => (
            <div key={cIdx} className="grid grid-rows-15 gap-1">
              {col.map((n) => {
                const isCalled = called.includes(n);
                return (
                  <div
                    key={n}
                    className={[
                      "h-7 w-full rounded text-xs md:text-sm flex items-center justify-center border",
                      isCalled ? "bg-emerald-500 border-emerald-400 text-black" : "bg-slate-700 border-slate-600 text-slate-300",
                    ].join(" ")}
                  >
                    {n}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const numberToLetter = _numberToLetter;

  const parseSmsTimestamp = (sms, windowStart) => {
    const s = (sms || "").trim();
    let m = s.match(/(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!m) m = s.match(/(\d{1,2})[-\/](\d{1,2})[-\/](20\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (m) {
      const parts = m.map((x) => (x || "").toString());
      let y, mo, d, h, mi, se;
      if (m[1].length === 4) {
        y = Number(parts[1]);
        mo = Number(parts[2]) - 1;
        d = Number(parts[3]);
        h = Number(parts[4]);
        mi = Number(parts[5]);
        se = Number(parts[6] || "0");
      } else {
        d = Number(parts[1]);
        mo = Number(parts[2]) - 1;
        y = Number(parts[3]);
        h = Number(parts[4]);
        mi = Number(parts[5]);
        se = Number(parts[6] || "0");
      }
      const ampm = (parts[7] || "").toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      const dt = new Date(y, mo, d, h, mi, se);
      return dt.getTime();
    }
    const t = s.match(/\b(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?\b/i);
    if (t) {
      const parts = t.map((x) => (x || "").toString());
      let h = Number(parts[1]);
      const mi = Number(parts[2]);
      const se = Number(parts[3] || "0");
      const ampm = (parts[4] || "").toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      const base = windowStart ? new Date(windowStart) : new Date();
      const dt = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, mi, se);
      return dt.getTime();
    }
    return null;
  };

  const validateDepositSms = (sms, expectedName, expectedAccount, windowStart, windowEnd) => {
    if (!windowStart || !windowEnd) return { valid: false, reason: "Start the 3-minute timer first" };
    const lower = (sms || "").toLowerCase();
    if (!lower.includes((expectedName || "").toLowerCase())) return { valid: false, reason: "Recipient name mismatch" };
    if (!sms.replace(/\s+/g, "").includes((expectedAccount || "").replace(/\s+/g, "")))
      return { valid: false, reason: "Account number not found in SMS" };
    const ts = parseSmsTimestamp(sms, windowStart);
    if (!ts) return { valid: false, reason: "Could not read time from SMS" };
    const slack = 60_000;
    if (ts < windowStart - slack || ts > windowEnd + slack) return { valid: false, reason: "SMS time outside the 3-minute window" };
    return { valid: true };
  };

  const loadTesseract = async () => {
    if (window.Tesseract) return window.Tesseract;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/tesseract.js@4.1.1/dist/tesseract.min.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load OCR"));
      document.head.appendChild(s);
    });
    return window.Tesseract;
  };

  const ocrImageToText = async (file) => {
    const Tesseract = await loadTesseract();
    const { data } = await Tesseract.recognize(file, "eng");
    return data?.text || "";
  };

  const parseTransactionId = (text) => {
    const tag = text.match(/(?:txn|trans|ref|reference)[:\s-]*([A-Z0-9]{6,})/i);
    if (tag) return tag[1].trim();
    const tokens = text.match(/[A-Z0-9]{8,20}/g);
    return tokens ? tokens.sort((a, b) => b.length - a.length)[0] : null;
  };

  const hasSeenTxn = (id) => {
    try {
      const raw = localStorage.getItem("seenTxnIds");
      const set = raw ? new Set(JSON.parse(raw)) : new Set();
      return set.has(id);
    } catch {
      return false;
    }
  };
  const rememberTxn = (id) => {
    try {
      const raw = localStorage.getItem("seenTxnIds");
      const arr = raw ? JSON.parse(raw) : [];
      if (!arr.includes(id)) arr.push(id);
      localStorage.setItem("seenTxnIds", JSON.stringify(arr.slice(-200)));
    } catch {}
  };

  const playCallSound = async (n) => {
    const letter = numberToLetter(n);
    const base = `${process.env.NODE_ENV === "production" ? window.location.origin : "http://localhost:3001"}/audio/${audioPack}`;
    const candidates = [`${base}/${letter}-${n}.mp3`, `${base}/${letter}_${n}.mp3`, `${base}/${letter}/${n}.mp3`, `${base}/${n}.mp3`, `${base}/${letter}${n}.mp3`];
    for (const src of candidates) {
      try {
        await new Promise((resolve, reject) => {
          const audio = new Audio(src);
          audio.oncanplaythrough = () => {
            audio.play().then(resolve).catch(reject);
          };
          audio.onerror = reject;
        });
        break;
      } catch (_) {
        continue;
      }
    }
  };

  const renderCard = (boardId, isGamePage = false) => {
    if (!boardId) return null;
    const grid = getBoard(boardId);
    if (!grid) return <div className="text-slate-400">Board {boardId} not found</div>;
    return (
      <div className="grid grid-cols-5 gap-1">
        {grid.map((val, idx) => {
          const isFree = val === -1;
          const isMarked = isFree || markedNumbers.has(val);
          const isCalled = called.includes(val);
          const shouldHighlight = isGamePage ? (autoAlgoMark ? isFree || isCalled : isMarked) : isCalled;
          return (
            <div
              key={idx}
              onClick={() => isGamePage && !isFree && isCalled && toggleMark(val)}
              className={[
                "h-7 w-full rounded text-xs flex items-center justify-center border cursor-pointer",
                shouldHighlight ? "bg-emerald-500 border-emerald-400 text-black" : "bg-slate-700 border-slate-600",
                isGamePage && !isFree && isCalled ? "hover:brightness-110" : "",
              ].join(" ")}
            >
              {isFree ? "FREE" : val}
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    const _ = [prize, setBonus, boardHtmlProvided, callTimerRef, depositSms, setDepositSms, depositImage, setDepositImage, depositWindowStart, depositWindowEnd, validateDepositSms, ocrImageToText, parseTransactionId, hasSeenTxn, rememberTxn];
    void _;
  }, []);

  if (currentPage === "welcome")
    return (
      <>
        <WelcomePage balance={balance} bonus={bonus} playerId={playerId} setStake={setStake} setCurrentPage={setCurrentPage} socket={socket} />
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold">Register with Telegram</h3>
              <p className="text-sm text-slate-600 mt-2">We couldn't find your account. Please register using our Telegram bot. After registering, click "I registered" to re-check.</p>
              <div className="mt-4 flex gap-2">
                <button onClick={openTelegramBot} className="flex-1 px-4 py-2 rounded bg-sky-500 text-white">
                  Open Telegram Bot
                </button>
                <button onClick={recheckRegistration} className="px-4 py-2 rounded bg-emerald-600 text-white">
                  I registered
                </button>
              </div>
              <div className="mt-3 text-right">
                <button onClick={() => setShowRegisterModal(false)} className="text-sm text-slate-500">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  if (currentPage === "instructions") return <InstructionsPage setCurrentPage={setCurrentPage} />;
  if (currentPage === "depositSelect") return <DepositSelectPage providers={providers} setSelectedProvider={setSelectedProvider} setCurrentPage={setCurrentPage} />;
  if (currentPage === "depositConfirm")
    return (
      <DepositConfirmPage
        info={providerToAccount[selectedProvider] || { account: "—", name: "—" }}
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
        depositMessage={depositMessage}
        setDepositMessage={setDepositMessage}
        depositTimerSec={depositTimerSec}
        startTimer={() => {
          setDepositTimerSec(180);
          const start = Date.now();
          setDepositWindowStart(start);
          setDepositWindowEnd(start + 180000);
        }}
        onSubmit={async () => {
          const amountNum = Number(depositAmount);
          if (!Number.isFinite(amountNum) || amountNum <= 0) {
            alert("Enter a valid amount");
            return;
          }
          if (!depositMessage || depositMessage.trim().length < 5) {
            alert("Paste the confirmation message");
            return;
          }
          setOcrLoading(true);
          try {
            const payload = { userId: playerId, amount: amountNum, provider: selectedProvider, message: depositMessage };
            const res = await userAPI.deposit(payload);
            const data = res?.data;
            if (data && typeof data.balance === "number") setBalance(data.balance);
            else setBalance((prev) => prev + amountNum);
            setDepositAmount("");
            setDepositMessage("");
            setDepositTimerSec(0);
            setDepositWindowStart(null);
            setDepositWindowEnd(null);
            setCurrentPage("welcome");
            alert("Deposit submitted. It may take a moment to reflect in your balance.");
          } catch (e) {
            alert(e?.response?.data?.message || e?.message || "Deposit submission failed");
          } finally {
            setOcrLoading(false);
          }
        }}
        ocrLoading={ocrLoading}
        setCurrentPage={setCurrentPage}
      />
    );
  if (currentPage === "lobby")
    return (
      <LobbyPage
        playerId={playerId}
        stake={stake}
        players={players}
        seconds={seconds}
        audioPack={audioPack}
        audioOn={audioOn}
        setAudioPack={setAudioPack}
        setAudioOn={setAudioOn}
        autoMark={autoMark}
        setAutoMark={setAutoMark}
        autoAlgoMark={autoAlgoMark}
        setAutoAlgoMark={setAutoAlgoMark}
        board={board}
        picks={picks}
        togglePick={togglePick}
        isReady={isReady}
        handleStartGame={handleStartGame}
        renderCard={renderCard}
      />
    );
  return (
    <GamePage
      playerId={playerId}
      stake={stake}
      players={players}
      seconds={seconds}
      phase={phase}
      callCountdown={callCountdown}
      lastCalled={lastCalled}
      audioPack={audioPack}
      audioOn={audioOn}
      playCallSound={playCallSound}
      called={called}
      renderCallerGrid={renderCallerGrid}
      picks={picks}
      renderCard={renderCard}
      autoAlgoMark={autoAlgoMark}
      canBingo={canBingo}
      onPressBingo={onPressBingo}
    />
  );
}