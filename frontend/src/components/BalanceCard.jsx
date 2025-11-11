// src/components/BalanceCard.js
import React, { useEffect, useState } from "react";
import { userAPI } from "../api/api"; // we’ll define it in api.js
import "./componentsCSS/wallet.css";
import { UserContext } from "../context/UserContext";

const BalanceCard = ({ userId }) => {
  const user = UserContext();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      const res = await userAPI.getBalance(user.telegramId);
      setBalance(res.data.balance);
    } catch (err) {
      console.error("❌ Error fetching balance:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [userId]);

  return (
    <div className="wallet-card">
      <h3>💰 Your Balance</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <h2 className="balance-amount">{balance} ETB</h2>
      )}
      <button onClick={fetchBalance} className="refresh-btn">🔄 Refresh</button>
    </div>
  );
};

export default BalanceCard;
