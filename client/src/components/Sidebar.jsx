import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Transactions", icon: "receipt_long" },
  { to: "/wallet", label: "Wallet", icon: "account_balance_wallet" },
  { to: "/subscriptions", label: "Subscriptions", icon: "autorenew" },
  { to: "/budget", label: "Budget Planner", icon: "savings" },
  { to: "/goals", label: "Savings Goals", icon: "flag" },
  { to: "/analytics", label: "Analytics", icon: "monitoring" },
  { to: "/insights", label: "AI Insights", icon: "auto_awesome" },
  { to: "/calendar", label: "Calendar", icon: "calendar_month" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    onClose?.();
    logout();
    navigate("/login");
  }

  return (
    <nav
      className={`w-64 h-full fixed left-0 top-0 flex flex-col p-container-padding bg-[var(--surface-lowest)] shadow-[4px_0_24px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-50 transform transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-serif text-2xl italic leading-none text-[var(--primary)]">Custos</h1>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)]"
        >
          <Icon name="close" className="text-lg" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto min-h-0">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-4 rounded-full px-6 py-3 transition-all duration-200 shrink-0 ${
                active
                  ? "bg-[var(--primary)] text-[var(--on-primary)]"
                  : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)]"
              }`}
            >
              <Icon name={item.icon} filled={active} />
              <span className="text-[13px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <Link
        to="/"
        onClick={onClose}
        className="mt-4 mb-4 shrink-0 bg-[var(--primary-container)] text-[var(--on-primary-container)] py-4 rounded-full text-[13px] font-bold text-center hover:scale-[1.02] active:scale-95 transition-all"
      >
        Add Entry
      </Link>

      <div className="pt-4 shrink-0 border-t border-[var(--border)]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-3 rounded-full text-[var(--on-surface-variant)] hover:text-[var(--error)] transition-colors text-left w-full"
        >
          <Icon name="logout" className="text-lg" />
          <span className="text-[11px] font-bold uppercase tracking-wide">Log out</span>
        </button>
      </div>
    </nav>
  );
}
