import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";

const SEVERITY_ICON = { warning: "priority_high", notice: "info", info: "event", positive: "check_circle" };

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [seen, setSeen] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("custos-seen-notifications") || "[]"));
    } catch {
      return new Set();
    }
  });
  const ref = useRef(null);

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !seen.has(n.id)).length;

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && notifications.length > 0) {
      const nextSeen = new Set([...seen, ...notifications.map((n) => n.id)]);
      setSeen(nextSeen);
      localStorage.setItem("custos-seen-notifications", JSON.stringify([...nextSeen]));
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        aria-label="Notifications"
        className="relative w-10 h-10 flex items-center justify-center rounded-full text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] transition-colors"
      >
        <Icon name="notifications" className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--error)]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 max-w-[85vw] bg-[var(--surface-lowest)] rounded-lg card-soft animate-in border border-[var(--border)] overflow-hidden z-50">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-serif italic text-lg">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-[var(--on-surface-variant)] px-5 py-8 text-center">
                You're all caught up.
              </p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="px-5 py-3 border-b border-[var(--border)] last:border-b-0 flex gap-3">
                  <Icon
                    name={SEVERITY_ICON[n.severity] || "info"}
                    className={`text-base shrink-0 mt-0.5 ${
                      n.severity === "warning" ? "text-[var(--error)]" : "text-[var(--primary)]"
                    }`}
                  />
                  <p className="text-sm leading-snug">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Topbar({ onMenuClick }) {
  const { theme, toggleTheme } = useSettings();
  const { email } = useAuth();
  const initial = (email || "?").charAt(0).toUpperCase();

  return (
    <header className="w-full h-20 fixed top-0 left-0 z-40 bg-[var(--bg)]/70 backdrop-blur-xl border-b border-[var(--border)] flex justify-between items-center px-4 sm:px-container-padding lg:pl-72 gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] transition-colors"
        >
          <Icon name="menu" className="text-xl" />
        </button>

        <span className="lg:hidden font-serif italic text-lg text-[var(--primary)] shrink-0">Custos</span>

        <div className="hidden sm:flex items-center gap-3 bg-[var(--surface-high)] px-6 py-2.5 rounded-full w-full max-w-sm opacity-70">
          <Icon name="search" className="text-[var(--outline)] text-lg" />
          <span className="text-[13px] text-[var(--outline)] truncate">Search transactions…</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <NotificationsBell />

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] transition-colors"
        >
          <Icon name={theme === "light" ? "dark_mode" : "light_mode"} className="text-lg" />
        </button>

        <div className="flex items-center gap-3 bg-[var(--surface-container)] rounded-full pr-4 pl-1 py-1 border border-[var(--border)]">
          <div className="w-8 h-8 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center text-xs font-bold shrink-0">
            {initial}
          </div>
          <span className="hidden sm:block text-[13px] font-bold max-w-[120px] truncate">{email}</span>
        </div>
      </div>
    </header>
  );
}
