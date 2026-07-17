// In production this points at wherever the backend is deployed (set via
// VITE_API_URL at build time); locally it falls back to the dev server.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let authToken = localStorage.getItem("custos-token") || null;

// The rest of the app never touches localStorage directly for auth — it
// all funnels through here, so token state and storage never drift apart.
export function setAuthToken(token) {
  authToken = token;
  if (token) localStorage.setItem("custos-token", token);
  else localStorage.removeItem("custos-token");
}

export function getAuthToken() {
  return authToken;
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options });

  if (res.status === 401) {
    // Session expired or token is invalid — clear it and bounce to login
    // rather than let every screen show a confusing "could not reach API" error.
    setAuthToken(null);
    if (!path.startsWith("/auth")) window.location.href = "/login";
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (email, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getTransactions: (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.search) query.set("search", filters.search);
    if (filters.categoryId) query.set("categoryId", filters.categoryId);
    if (filters.type) query.set("type", filters.type);
    if (filters.from) query.set("from", filters.from);
    if (filters.to) query.set("to", filters.to);
    if (filters.page) query.set("page", filters.page);
    if (filters.pageSize) query.set("pageSize", filters.pageSize);
    const qs = query.toString();
    return request(`/transactions${qs ? `?${qs}` : ""}`);
  },
  createTransaction: (data) =>
    request("/transactions", { method: "POST", body: JSON.stringify(data) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: "DELETE" }),

  getCategories: () => request("/categories"),
  createCategory: (data) =>
    request("/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),

  getSummaryByCategory: () => request("/summary/by-category"),
  getSummaryByMonth: () => request("/summary/by-month"),

  // Triggers a real file download rather than returning JSON, so this
  // bypasses the shared request() helper and builds the fetch/blob dance itself.
  exportTransactionsCSV: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.search) query.set("search", filters.search);
    if (filters.categoryId) query.set("categoryId", filters.categoryId);
    if (filters.type) query.set("type", filters.type);
    if (filters.from) query.set("from", filters.from);
    if (filters.to) query.set("to", filters.to);
    const qs = query.toString();

    const res = await fetch(`${BASE_URL}/transactions/export${qs ? `?${qs}` : ""}`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    if (!res.ok) throw new Error("Could not export transactions");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "custos-transactions.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getBudgets: () => request("/budgets"),
  getBudgetsStatus: () => request("/budgets/status"),
  upsertBudget: (data) => request("/budgets", { method: "POST", body: JSON.stringify(data) }),
  deleteBudget: (id) => request(`/budgets/${id}`, { method: "DELETE" }),

  getProfile: () => request("/profile"),
  updateProfile: (name) => request("/profile", { method: "PUT", body: JSON.stringify({ name }) }),
  updatePassword: (currentPassword, newPassword) =>
    request("/profile/password", { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) }),

  getAccounts: () => request("/accounts"),
  getAccountTransactions: (id) => request(`/accounts/${id}/transactions`),
  createAccount: (data) => request("/accounts", { method: "POST", body: JSON.stringify(data) }),
  updateAccount: (id, data) => request(`/accounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAccount: (id) => request(`/accounts/${id}`, { method: "DELETE" }),

  getSubscriptions: () => request("/subscriptions"),
  createSubscription: (data) => request("/subscriptions", { method: "POST", body: JSON.stringify(data) }),
  updateSubscription: (id, data) => request(`/subscriptions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSubscription: (id) => request(`/subscriptions/${id}`, { method: "DELETE" }),

  getGoals: () => request("/goals"),
  createGoal: (data) => request("/goals", { method: "POST", body: JSON.stringify(data) }),
  updateGoal: (id, data) => request(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  contributeToGoal: (id, amount) =>
    request(`/goals/${id}/contribute`, { method: "POST", body: JSON.stringify({ amount }) }),
  deleteGoal: (id) => request(`/goals/${id}`, { method: "DELETE" }),

  getInsights: () => request("/insights"),

  getCalendar: (month) => request(`/calendar${month ? `?month=${month}` : ""}`),

  getNotifications: () => request("/notifications"),
};
