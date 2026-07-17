import { createContext, useCallback, useContext, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";

const ToastContext = createContext(null);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback(
    (message, { type = "success" } = {}) => {
      const id = nextId++;
      setToasts((t) => [...t, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), 3000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2 rounded-full pl-4 pr-5 py-2.5 card-soft animate-in text-[13px] font-bold ${
              toast.type === "error"
                ? "bg-[var(--error-container)] text-[var(--on-error-container)]"
                : "bg-[var(--primary)] text-[var(--on-primary)]"
            }`}
          >
            <Icon
              name={toast.type === "error" ? "error" : "check_circle"}
              className="text-lg"
              filled
            />
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
