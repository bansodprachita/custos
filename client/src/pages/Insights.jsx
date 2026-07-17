import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client.js";
import Icon from "../components/Icon.jsx";

const SEVERITY_STYLES = {
  positive: {
    bg: "var(--primary-container)",
    fg: "var(--on-primary-container)",
    icon: "trending_up",
  },
  warning: {
    bg: "var(--error-container)",
    fg: "var(--on-error-container)",
    icon: "priority_high",
  },
  notice: {
    bg: "var(--secondary-container)",
    fg: "var(--on-secondary-container)",
    icon: "info",
  },
  info: {
    bg: "var(--tertiary-container)",
    fg: "var(--on-tertiary-container)",
    icon: "auto_awesome",
  },
};

function styleFor(severity) {
  return SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;
}

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.getInsights();
      setInsights(list);
      setError(null);
    } catch (err) {
      setError(err.message || "Could not load insights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isEmpty = insights.length === 1 && insights[0].id === "empty";

  return (
    <div className="space-y-widget-gap max-w-2xl">
      <div>
        <h1 className="text-headline-md text-[var(--on-surface)]">ai insights</h1>
        <p className="text-body-main text-[var(--on-surface-variant)] mt-1">
          Patterns in your spending, updated as you go.
        </p>
      </div>

      {error && (
        <div className="bg-[var(--error-container)] text-[var(--on-error-container)] rounded-md px-5 py-4 text-sm font-medium">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <div className="bg-[var(--surface-container)] rounded-lg h-24 animate-pulse-soft" />
          <div className="bg-[var(--surface-container)] rounded-lg h-24 animate-pulse-soft" />
          <div className="bg-[var(--surface-container)] rounded-lg h-24 animate-pulse-soft" />
        </div>
      )}

      {!loading && !error && isEmpty && (
        <div className="bg-[var(--surface-lowest)] rounded-lg card-soft p-12 flex flex-col items-center text-center animate-in">
          <Icon name="auto_awesome" className="text-4xl text-[var(--tertiary)] mb-4" />
          <h2 className="font-serif italic text-2xl mb-2">Not enough data yet</h2>
          <p className="text-body-main text-[var(--on-surface-variant)] max-w-sm">
            Keep logging transactions and Custos will start surfacing patterns and nudges here.
          </p>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <div className="space-y-4">
          {insights.map((insight, i) => {
            const s = styleFor(insight.severity);
            return (
              <div
                key={insight.id}
                className="rounded-lg p-7 card-soft card-hover animate-in flex flex-col sm:flex-row gap-5"
                style={{
                  backgroundColor: s.bg,
                  color: s.fg,
                  animationDelay: `${0.05 + i * 0.05}s`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-current/10"
                >
                  <Icon name={s.icon} className="text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif italic text-xl sm:text-2xl leading-snug mb-2">
                    {insight.title}
                  </h3>
                  <p className="text-body-main opacity-90">{insight.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
