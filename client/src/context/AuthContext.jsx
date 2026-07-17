import { createContext, useContext, useState } from "react";
import { api, setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("custos-token"));
  const [email, setEmail] = useState(() => localStorage.getItem("custos-email"));
  const [name, setName] = useState(() => localStorage.getItem("custos-name") || "");
  const [waking, setWaking] = useState(false);

  // The free hosting tier spins the backend down after inactivity, so a
  // cold visitor's first request can take 30-60s. Surface that after a
  // few seconds rather than leaving the button looking frozen.
  async function withWakeHint(fn) {
    const timer = setTimeout(() => setWaking(true), 4000);
    try {
      return await fn();
    } finally {
      clearTimeout(timer);
      setWaking(false);
    }
  }

  function applySession(result) {
    setAuthToken(result.token);
    localStorage.setItem("custos-email", result.email);
    localStorage.setItem("custos-name", result.name || "");
    setToken(result.token);
    setEmail(result.email);
    setName(result.name || "");
  }

  async function login(emailInput, password) {
    applySession(await withWakeHint(() => api.login(emailInput, password)));
  }

  async function register(emailInput, password) {
    applySession(await withWakeHint(() => api.register(emailInput, password)));
  }

  function logout() {
    setAuthToken(null);
    localStorage.removeItem("custos-email");
    localStorage.removeItem("custos-name");
    setToken(null);
    setEmail(null);
    setName("");
  }

  async function updateName(newName) {
    const result = await api.updateProfile(newName);
    localStorage.setItem("custos-name", result.name || "");
    setName(result.name || "");
  }

  return (
    <AuthContext.Provider
      value={{ token, email, name, login, register, logout, updateName, waking, isAuthenticated: Boolean(token) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
