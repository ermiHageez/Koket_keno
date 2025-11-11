import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Footer from "../components/Footer";
import { authAPI } from "../api/api";

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loginType, setLoginType] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [wallet, setWallet] = useState({ balance: null, lastWin: null });
  const [userInfo, setUserInfo] = useState(null);

  // 1️⃣ Check if user is registered on mount
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("userInfo");
        const userId = localStorage.getItem("userId");

        if (stored) {
          const parsed = JSON.parse(stored);
          setUserInfo(parsed);
          setWallet({
            balance: parsed.balance ?? parsed.currentBalance ?? null,
            lastWin: parsed.lastWin ?? parsed.last_win ?? null,
          });
          setLoading(false);
          return;
        }

        if (!userId) {
          setLoading(false);
          return; // no userId yet, show login button
        }

        // verify with server
        const res = await authAPI.checkUser(userId);
        if (res?.data?.exists) {
          localStorage.setItem("userInfo", JSON.stringify(res.data));
          setUserInfo(res.data);
          setWallet({
            balance: res.data.balance ?? null,
            lastWin: res.data.lastWin ?? null,
          });
        }
      } catch (err) {
        console.error("User check error:", err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleTelegramLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setShowModal(true);
        setMessage("❌ You are not registered yet. Please sign up using our Telegram bot 👇");
        return;
      }

      const res = await authAPI.checkUser(userId);
      if (res?.data?.exists) {
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        setUserInfo(res.data);
        setWallet({
          balance: res.data.balance ?? wallet.balance,
          lastWin: res.data.lastWin ?? res.data.last_win ?? wallet.lastWin,
        });
      } else {
        setShowModal(true);
        setMessage("❌ You are not registered. Please sign up first via our Telegram bot 👇");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error connecting to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const recheckRegistration = async () => {
    setLoading(true);
    setMessage("Re-checking registration...");
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setMessage("No local userId found. Register first in Telegram.");
        setLoading(false);
        return;
      }
      const res = await authAPI.checkUser(userId);
      if (res?.data?.exists) {
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        setUserInfo(res.data);
        setWallet({
          balance: res.data.balance ?? wallet.balance,
          lastWin: res.data.lastWin ?? res.data.last_win ?? wallet.lastWin,
        });
        setShowModal(false);
      } else {
        setMessage("Still not registered. Please complete registration with the Telegram bot.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error connecting to server. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAgentLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage("⚠️ Please enter both username and password.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      let res;
      if (loginType === "admin") res = await authAPI.adminLogin({ username, password });
      else if (loginType === "agent") res = await authAPI.agentLogin({ username, password });
      else {
        setMessage("⚠️ Please select Admin or Agent first.");
        setLoading(false);
        return;
      }

      if (res?.status === 200) {
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        navigate(`${loginType}?username=${encodeURIComponent(res.data.username)}`);
      } else {
        setMessage("❌ Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Invalid username or password or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <header className="hero">
        <div className="hero-inner">
          <div className="amharic-title">ቢንጎ ኢትዮጵያ</div>
          <div className="english-title">
            {/* Bingo <span className="ethiopia">Ethiopia</span> */}
          </div>
          <p className="hero-sub">A joyful gathering in every game!</p>
        </div>
      </header>

      <main className="container">
        {/* Wallet Section */}
        <div className="wallet-card">
          <div className="wallet-title">የእኔ ገንዘብ / My Wallet</div>
          <div className="balance-label">Current Balance</div>
          <div className="balance-value">
            {wallet.balance != null ? (
              <>
                <span className="amount">{Number(wallet.balance).toLocaleString()}</span>
                <span className="currency"> ETB</span>
              </>
            ) : (
              <span className="amount">--</span>
            )}
          </div>
          <div className="last-win">
            Last Win:{" "}
            <span className="last-win-value">
              {wallet.lastWin != null ? `+${Number(wallet.lastWin).toLocaleString()} ETB` : "—"}
            </span>
          </div>
        </div>

        {/* Telegram / Login Section */}
        <section className="actions-top">
          {!userInfo ? (
            <button className="btn-telegram" onClick={handleTelegramLogin} disabled={loading}>
              {loading ? "Checking..." : "Log In With Telegram"}
            </button>
          ) : (
            <div className="welcome-user">
              👋 Welcome, <strong>@{userInfo.username || userInfo.telegram_username || "User"}</strong>
            </div>
          )}

          <div className="login-inline">
            <label className="login-as">Login as</label>
            <select
              value={loginType}
              onChange={(e) => setLoginType(e.target.value)}
              className="login-select"
            >
              <option value="">Select...</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          {loginType && (
            <form className="mini-form" onSubmit={handleAdminAgentLogin}>
              <input
                className="mini-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                className="mini-input"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="btn-login" type="submit" disabled={loading}>
                {loading ? "Logging..." : `Login as ${loginType}`}
              </button>
            </form>
          )}

          {message && (
            <div className="message-box">
              <div>{message}</div>
              {message.includes("Telegram bot") && (
                <a
                  className="telegram-link"
                  href="https://t.me/kenowabot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  👉 Open Telegram Bot
                </a>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Registration modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Register with Telegram</h3>
            <p>
              We couldn't find your account. Please register using our Telegram bot. After
              registering, click "I registered" to re-check.
            </p>
            <div className="modal-actions">
              <a
                className="btn-telegram small"
                href="https://t.me/kenowabot"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Telegram Bot
              </a>
              <button className="btn-confirm" onClick={recheckRegistration} disabled={loading}>
                {loading ? "Checking..." : "I registered"}
              </button>
            </div>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <Footer style="footer" />
    </div>
  );
};

export default Home;
