import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, TextField, Button, Typography } from "@mui/material";
import { agentAPI } from "../api/api"; // updated to agentAPI

const DepositCard = ({ open, handleClose, agentId, userId, onDepositSuccess }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleDeposit = async () => {
    if (!cardNumber) return setError("Enter a money card number");

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await agentAPI.depositViaCard(agentId, userId, cardNumber);
      setSuccessMsg(`✅ Deposit successful: +${response.data.amount} ETB`);
      onDepositSuccess(response.data.amount); // Update user balance in parent
      setCardNumber("");
    } catch (err) {
      setError(err.response?.data || "❌ Deposit failed");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>💳 Redeem Money Card</DialogTitle>
      <DialogContent style={{ minWidth: 300, textAlign: "center" }}>
        <TextField
          label="Enter Money Card"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          fullWidth
          margin="dense"
        />

        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        {successMsg && <Typography color="primary" sx={{ mt: 1 }}>{successMsg}</Typography>}

        <Button
          variant="contained"
          color="primary"
          onClick={handleDeposit}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Processing..." : "Redeem"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DepositCard;
