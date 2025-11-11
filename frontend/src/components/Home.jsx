import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loginType, setLoginType] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);

  const checkAndNavigate = async (userId) => {
    if (!userId) return { exists: false };
    try {
      const res = await authAPI.checkUser(userId);
      return res?.data || { exists: false };
    } catch (e) {
      console.error("checkUser error", e);
      return { exists: false };
    }
  };

  const handleTelegramLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const stored = localStorage.getItem("userInfo");
      if (stored) {
        const parsed = JSON.parse(stored);
        navigate(`/home?username=${encodeURIComponent(parsed.username || parsed.telegramId || "user")}`);
        setLoading(false);
        return;
      }
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setShowModal(true);
        setMessage("You are not registered locally. Please register via the Telegram bot.");
        setLoading(false);
        return;
      }
      const data = await checkAndNavigate(userId);
      if (data.exists) {
        localStorage.setItem("userInfo", JSON.stringify(data));
        navigate(`/home?username=${encodeURIComponent(data.username || userId)}`);
      } else {
        setShowModal(true);
        setMessage("Not found on server — please sign up via the Telegram bot.");
      }
    } finally {
      setLoading(false);
    }
  };

  const recheckRegistration = async () => {
    setLoading(true);
    setMessage("Re-checking registration...");
    const userId = localStorage.getItem("userId");
    const data = await checkAndNavigate(userId);
    if (data.exists) {
      localStorage.setItem("userInfo", JSON.stringify(data));
      setShowModal(false);
      navigate(`/home?username=${encodeURIComponent(data.username || userId || "")}`);
    } else {
      setMessage("Still not registered. Please complete registration with the Telegram bot.");
    }
    setLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-2">🎯 Welcome to Keno Game</h2>
        <p className="text-sm text-slate-600 mb-4">Select your numbers and test your luck!</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <button onClick={handleTelegramLogin} disabled={loading} className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold shadow">
            {loading ? "Checking..." : "Log In With Telegram"}
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm">Login as</label>
            <select value={loginType} onChange={(e) => setLoginType(e.target.value)} className="ml-auto px-2 py-2 border rounded w-48">
              <option value="">Select...</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
            </select>
          </div>
        </div>

        {loginType && (
          <form onSubmit={handleAdminAgentLogin} className="flex gap-2 items-center">
            <input className="flex-1 px-3 py-2 border rounded" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="flex-1 px-3 py-2 border rounded" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-800 text-white rounded">{loading ? "Logging..." : `Login as ${loginType}`}</button>
          </form>
        )}

        {message && (
          <div className="mt-4 p-3 rounded bg-amber-50 text-amber-800">
            <div>{message}</div>
            {(message.includes("Telegram bot") || message.includes("register")) && (
              <div className="mt-2">
                <a href="https://t.me/kenowabot" target="_blank" rel="noreferrer" className="underline text-sky-600">👉 Open Telegram Bot</a>
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-2">Register with Telegram</h3>
              <p className="text-sm text-slate-600">We couldn't find your account. Please register using our Telegram bot. After registering, come back and tap "I registered" to continue.</p>
              <div className="mt-4 flex gap-2">
                <a href="https://t.me/kenowabot" target="_blank" rel="noreferrer" className="flex-1 px-4 py-2 rounded bg-sky-500 text-white text-center">Open Telegram Bot</a>
                <button onClick={recheckRegistration} className="px-4 py-2 rounded bg-emerald-600 text-white">I registered</button>
              </div>
              <div className="mt-3 text-right">
                <button onClick={() => setShowModal(false)} className="text-sm text-slate-500">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
