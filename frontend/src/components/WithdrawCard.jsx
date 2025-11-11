import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, TextField, Button, Typography } from "@mui/material";
import { userAPI } from "../api/api";

const WithdrawCard = ({ open, handleClose, userId, currentBalance, onWithdrawSuccess }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) return setError("Enter a valid amount");
    if (withdrawAmount > currentBalance) return setError("❌ Not enough balance");

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await userAPI.withdraw({ userId, amount: withdrawAmount });
      setSuccessMsg(`✅ Withdrawal requested: ${withdrawAmount} ETB`);
      onWithdrawSuccess(withdrawAmount); // Update balance in parent
      setAmount("");
    } catch (err) {
      setError(err.response?.data || "❌ Withdrawal failed");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>💸 Request Withdrawal</DialogTitle>
      <DialogContent style={{ minWidth: 300, textAlign: "center" }}>
        <Typography sx={{ mb: 1 }}>Current Balance: {currentBalance} ETB</Typography>

        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          margin="dense"
        />

        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        {successMsg && <Typography color="primary" sx={{ mt: 1 }}>{successMsg}</Typography>}

        <Button
          variant="contained"
          color="secondary"
          onClick={handleWithdraw}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Processing..." : "Request Withdraw"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawCard;
