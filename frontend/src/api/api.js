import axios from "axios";

// 🌐 Base URL for your Spring Boot backend
const api = axios.create({
  baseURL: "http://localhost:8080/api", // ⚙️ change this when deployed
  headers: { "Content-Type": "application/json" },
});

// 🧩 Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/* -------------------------------------------------------------------------- */
/* 🧍 AUTH API                                                                 */
/* -------------------------------------------------------------------------- */
export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login: (credentials) => api.post("/auth/login", credentials),
  checkUser: (userId) => api.get(`/auth/check/${userId}`),
  agentLogin: (credentials) => api.post("/auth/agent-login", credentials),
  adminLogin: (credentials) => api.post("/auth/admin-login", credentials),
};

/* -------------------------------------------------------------------------- */
/* 👑 ADMIN API                                                               */
/* -------------------------------------------------------------------------- */
export const adminAPI = {
  createAgent: (adminUsername, agentData) =>
    api.post(`/admin/agents?adminUsername=${adminUsername}`, agentData),

  createMoneyCard: (adminUsername, value, assignedTo) =>
    api.post(
      `/admin/cards?adminUsername=${adminUsername}&value=${value}` +
        (assignedTo ? `&assignedTo=${assignedTo}` : "")
    ),

  getAllMoneyCards: () => api.get("/admin/moneycard/all"),
  getAllAgents: () => api.get("/admin/agent/all"),
  deleteAgent: (agentId) => api.delete(`/admin/agent/${agentId}`),
  deleteMoneyCard: (cardId) => api.delete(`/admin/moneycard/${cardId}`),
};

/* -------------------------------------------------------------------------- */
/* 🧑‍💼 AGENT API                                                              */
/* -------------------------------------------------------------------------- */
export const agentAPI = {
  // Use agentUsername instead of agentId
  searchUser: (username) => api.get(`/agent/search?username=${username}`),

  approveWithdrawal: (agentUsername, txId) =>
    api.post(`/agent/approve-withdraw?agentUsername=${agentUsername}&txId=${txId}`),

  pendingWithdrawals: (agentUsername) =>
    api.get(`/agent/pending-withdrawals?agentUsername=${agentUsername}`),

  depositViaCard: (agentUsername, userId, cardId) =>
    api.post(
      `/agent/deposit-card?agentUsername=${agentUsername}&userId=${userId}&cardId=${cardId}`
    ),

  getAgentTransactions: (agentUsername) =>
    api.get(`/agent/transactions?agentUsername=${agentUsername}`),

  // New: Get all cards for this agent
  getMyCards: (agentUsername) =>
    api.get(`/agent/cards?agentUsername=${agentUsername}`),

  // New: Give a card to a user
  giveCardToUser: ({ agentUsername, userTelegramId, cardId }) =>
    api.post(`/agent/give-card?agentUsername=${agentUsername}&userTelegramId=${userTelegramId}&cardId=${cardId}`),
};

/* -------------------------------------------------------------------------- */
/* 🎮 USER / PLAYER API                                                        */
/* -------------------------------------------------------------------------- */
export const userAPI = {
  getBalance: (userId) => api.get(`/users/balance/${userId}`),
  deposit: (data) => api.post("/users/deposit", data),
  withdraw: (data) => api.post("/users/withdraw", data),
  playGame: (data) => api.post("/users/play", data), // expects { userId, win }
  getHistory: (userId) => api.get(`/users/history/${userId}`),
  updateProfile: (userId, data) => api.put(`/users/update/${userId}`, data),
};


/* -------------------------------------------------------------------------- */
/* 💰 GAME SYSTEM API                                                          */
/* -------------------------------------------------------------------------- */
export const gameAPI = {
  startGame: (data) => api.post("/game/start", data),
  getCurrentRound: () => api.get("/game/current-round"),
  getGameResults: (gameId) => api.get(`/game/results/${gameId}`),
  getAllGames: () => api.get("/game/all"),
};

/* -------------------------------------------------------------------------- */
/* 🧾 DEFAULT EXPORT                                                           */
/* -------------------------------------------------------------------------- */
export default api;
