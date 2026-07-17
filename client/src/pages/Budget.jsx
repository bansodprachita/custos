import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useSettings } from "../context/SettingsContext.jsx";
import { currencySymbol } from "../utils/currency.js";
import BudgetProgress from "../components/BudgetProgress.jsx";

export default function Budget() {
  const { currency } = useSettings();
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [status, setStatus] = useState([]);
  const [inputs, setInputs] = useState({});
  const [savingFor, setSavingFor] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [cats, rawBudgets, budgetStatus] = await Promise.all([
      api.getCategories(),
      api.getBudgets(),
      api.getBudgetsStatus(),
    ]);
    setCategories(cats);
    setBudgets(rawBudgets);
    setStatus(budgetStatus);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function inputValue(categoryId) {
    if (categoryId in inputs) return inputs[categoryId];
    const existing = budgets.find((b) => b.categoryId === categoryId);
    return existing ? String(existing.amount) : "";
  }

  async function handleSave(categoryId) {
    const amount = Number(inputValue(categoryId));
    if (!amount || amount <= 0) return;
    setSavingFor(categoryId);
    try {
      await api.upsertBudget({ categoryId, amount });
      await load();
    } finally {
      setSavingFor(null);
    }
  }

  if (loading) {
    return <div className="bg-[var(--surface-container)] rounded-lg h-64 animate-pulse-soft" />;
  }

  return (
    <div className="space-y-widget-gap max-w-3xl">
      <div>
        <h1 className="text-headline-md text-[var(--on-surface)]">budget</h1>
        <p className="text-body-main text-[var(--on-surface-variant)] mt-1">
          Set a monthly limit per category and watch it in real time.
        </p>
      </div>

      <div className="bg-[var(--surface-lowest)] rounded-lg card-soft p-8">
        <h2 className="font-serif italic text-lg mb-6">This month's progress</h2>
        <BudgetProgress budgets={status} currency={currency} />
      </div>

      <div className="bg-[var(--surface-lowest)] rounded-lg card-soft p-8 space-y-4">
        <h2 className="font-serif italic text-lg">Set limits</h2>
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="flex-1 text-sm font-bold">{c.name}</span>
              <div className="flex items-center rounded-full px-3 bg-[var(--surface-container)]">
                <span className="text-xs text-[var(--on-surface-variant)] font-medium">
                  {currencySymbol(currency)}
                </span>
                <input
                  type="number"
                  min="0"
                  value={inputValue(c.id)}
                  onChange={(e) => setInputs((v) => ({ ...v, [c.id]: e.target.value }))}
                  className="w-24 bg-transparent px-2 py-1.5 text-sm focus:outline-none"
                  placeholder="No limit"
                />
              </div>
              <button
                onClick={() => handleSave(c.id)}
                disabled={savingFor === c.id}
                className="text-xs font-bold text-[var(--primary)] disabled:opacity-50"
              >
                {savingFor === c.id ? "Saving…" : "Save"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
