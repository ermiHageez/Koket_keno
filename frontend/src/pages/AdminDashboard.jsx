import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Typography,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { adminAPI } from "../api/api";
import { useSearchParams, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [tab, setTab] = useState(0);
  const [openAgent, setOpenAgent] = useState(false);
  const [openCard, setOpenCard] = useState(false);
  const [agents, setAgents] = useState([]);
  const [cards, setCards] = useState([]);
  const [formAgent, setFormAgent] = useState({ username: "", phone: "", password: "" });
  const [formCard, setFormCard] = useState({ value: "", assignedTo: "" });
  const [adminUsername, setAdminUsername] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Grab username from URL and verify
  useEffect(() => {
    const username = searchParams.get("username");
    if (!username) {
      alert("❌ No admin username provided. Redirecting to home.");
      navigate("/");
      return;
    }
    setAdminUsername(username);

    // Optionally, fetch existing agents/cards for this admin
    fetchAgents();
    fetchCards();
  }, [searchParams, navigate]);

  const fetchAgents = async () => {
    try {
      const res = await adminAPI.getAllAgents();
      setAgents(res.data);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    }
  };

  const fetchCards = async () => {
    try {
      const res = await adminAPI.getAllMoneyCards();
      setCards(res.data);
    } catch (err) {
      console.error("Failed to fetch money cards:", err);
    }
  };

  // Create Agent
  const handleCreateAgent = async () => {
    try {
      const res = await adminAPI.createAgent(adminUsername, formAgent);
      setAgents((prev) => [...prev, res.data]);
      setOpenAgent(false);
      setFormAgent({ username: "", phone: "", password: "" });
    } catch (err) {
      alert("❌ Error creating agent: " + (err.response?.data || err.message));
    }
  };

  // Create Money Card
  const handleCreateCard = async () => {
    try {
      const res = await adminAPI.createMoneyCard(adminUsername, formCard.value, formCard.assignedTo || null);
      setCards((prev) => [...prev, res.data]);
      setOpenCard(false);
      setFormCard({ value: "", assignedTo: "" });
    } catch (err) {
      alert("❌ Error creating money card: " + (err.response?.data || err.message));
    }
  };

  const agentColumns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "username", headerName: "Username", width: 150 },
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "role", headerName: "Role", width: 120 },
  ];

  const cardColumns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "value", headerName: "Value (ETB)", width: 150 },
    { field: "assignedTo", headerName: "Assigned To", width: 150 },
    { field: "status", headerName: "Status", width: 120 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
        🎮 Admin Dashboard ({adminUsername})
      </Typography>

      <Tabs value={tab} onChange={(e, val) => setTab(val)} centered>
        <Tab label="Agents" />
        <Tab label="Money Cards" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {tab === 0 && (
          <>
            <Button variant="contained" onClick={() => setOpenAgent(true)}>
              ➕ Create Agent
            </Button>
            <Box sx={{ height: 400, mt: 2 }}>
              <DataGrid
                rows={agents}
                columns={agentColumns}
                getRowId={(r) => r.id || Math.random()}
              />
            </Box>
          </>
        )}

        {tab === 1 && (
          <>
            <Button variant="contained" onClick={() => setOpenCard(true)}>
              💳 Create Money Card
            </Button>
            <Box sx={{ height: 400, mt: 2 }}>
              <DataGrid
                rows={cards}
                columns={cardColumns}
                getRowId={(r) => r.id || Math.random()}
              />
            </Box>
          </>
        )}
      </Box>

      {/* Create Agent Dialog */}
      <Dialog open={openAgent} onClose={() => setOpenAgent(false)}>
        <DialogTitle>Create Agent</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={formAgent.username}
                onChange={(e) => setFormAgent({ ...formAgent, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formAgent.phone}
                onChange={(e) => setFormAgent({ ...formAgent, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={formAgent.password}
                onChange={(e) => setFormAgent({ ...formAgent, password: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAgent(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAgent}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Card Dialog */}
      <Dialog open={openCard} onClose={() => setOpenCard(false)}>
        <DialogTitle>Create Money Card</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Value (ETB)"
            type="number"
            value={formCard.value}
            onChange={(e) => setFormCard({ ...formCard, value: e.target.value })}
            sx={{ my: 1 }}
          />
          <TextField
            fullWidth
            label="Assigned To (Agent ID optional)"
            type="number"
            value={formCard.assignedTo}
            onChange={(e) => setFormCard({ ...formCard, assignedTo: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCard(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCard}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
