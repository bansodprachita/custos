import { createContext, useContext, useState } from "react";
import { api, setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("custos-token"));
  const [email, setEmail] = useState(() => localStorage.getItem("custos-email"));
  const [name, setName] = useState(() => localStorage.getItem("custos-name") || "");

  function applySession(result) {
    setAuthToken(result.token);
    localStorage.setItem("custos-email", result.email);
    localStorage.setItem("custos-name", result.name || "");
    setToken(result.token);
    setEmail(result.email);
    setName(result.name || "");
  }

  async function login(emailInput, password) {
    applySession(await api.login(emailInput, password));
  }

  async function register(emailInput, password) {
    applySession(await api.register(emailInput, password));
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
      value={{ token, email, name, login, register, logout, updateName, isAuthenticated: Boolean(token) }}
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
