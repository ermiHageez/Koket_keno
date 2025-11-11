import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { agentAPI } from "../api/api";
import { useSearchParams, useNavigate } from "react-router-dom";

const AgentDashboard = () => {
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [userTelegramId, setUserTelegramId] = useState("");
  const [cardId, setCardId] = useState("");
  const [agentUsername, setAgentUsername] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const username = searchParams.get("username");
    if (!username) {
      alert("❌ No agent username provided. Redirecting to home.");
      navigate("/");
      return;
    }
    setAgentUsername(username);
    fetchData(username);
  }, [searchParams, navigate]);

  const fetchData = async (username) => {
    try {
      const [cardsRes, txRes] = await Promise.all([
        agentAPI.getMyCards(username),        // make sure this exists in your agentAPI
        agentAPI.getAgentTransactions(username),
      ]);
      setCards(cardsRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      alert("❌ Error fetching data. Try again later.");
    }
  };

  const handleGiveCard = async () => {
    if (!userTelegramId || !cardId) return alert("⚠️ Fill both fields!");
    try {
      await agentAPI.giveCardToUser({
        agentUsername,
        userTelegramId,
        cardId,
      });
      alert("✅ Card given successfully!");
      setUserTelegramId("");
      setCardId("");
      fetchData(agentUsername);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to give card. Please try again.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧑‍💼 Agent Dashboard ({agentUsername})
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Give Card to User</Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <TextField
            label="User Telegram ID"
            value={userTelegramId}
            onChange={(e) => setUserTelegramId(e.target.value)}
          />
          <TextField
            label="Card ID"
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
          />
          <Button variant="contained" onClick={handleGiveCard}>
            Give Card
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">My Cards</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Card ID</TableCell>
              <TableCell>Value (ETB)</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cards.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.value}</TableCell>
                <TableCell>{c.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Transactions</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Txn ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.id}</TableCell>
                <TableCell>{t.userTelegramId}</TableCell>
                <TableCell>{t.amount}</TableCell>
                <TableCell>{new Date(t.date).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AgentDashboard;
