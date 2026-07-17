import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Splash from "./components/Splash.jsx";
import Transactions from "./pages/Transactions.jsx";
import Wallet from "./pages/Wallet.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Budget from "./pages/Budget.jsx";
import SavingsGoals from "./pages/SavingsGoals.jsx";
import Analytics from "./pages/Analytics.jsx";
import Insights from "./pages/Insights.jsx";
import CalendarPage from "./pages/Calendar.jsx";
import Settings from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function page(element) {
  return (
    <ProtectedRoute>
      <>{element}</>
    </ProtectedRoute>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !localStorage.getItem("custos-token"));

  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <BrowserRouter>
            {showSplash && <Splash onFinish={() => setShowSplash(false)} />}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Transactions is home now that Dashboard is gone */}
              <Route path="/" element={page(<Transactions />)} />
              <Route path="/transactions" element={<Navigate to="/" replace />} />
              <Route path="/wallet" element={page(<Wallet />)} />
              <Route path="/subscriptions" element={page(<Subscriptions />)} />
              <Route path="/budget" element={page(<Budget />)} />
              <Route path="/goals" element={page(<SavingsGoals />)} />
              <Route path="/analytics" element={page(<Analytics />)} />
              <Route path="/insights" element={page(<Insights />)} />
              <Route path="/calendar" element={page(<CalendarPage />)} />
              <Route path="/settings" element={page(<Settings />)} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
