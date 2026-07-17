import { useState } from "react";
import Icon from "./Icon.jsx";
import { api } from "../api/client.js";
import { currencySymbol } from "../utils/currency.js";

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm({ categories, onCreated, currency }) {
  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    categoryId: categories[0]?.id ?? "",
    date: today(),
    description: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!form.categoryId) {
      setError("Choose a category.");
      return;
    }

    setSubmitting(true);
    try {
      await api.createTransaction({
        amount,
        type: form.type,
        categoryId: Number(form.categoryId),
        date: form.date,
        description: form.description || undefined,
      });
      setForm((f) => ({ ...f, amount: "", description: "" }));
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-lowest)] rounded-lg card-soft p-7 space-y-4"
    >
      <h2 className="font-serif italic text-xl">new entry</h2>

      <div className="flex gap-2 bg-[var(--surface-container)] p-1 rounded-full">
        {[
          { key: "expense", label: "Expense", icon: "arrow_circle_down" },
          { key: "income", label: "Income", icon: "arrow_circle_up" },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => update("type", key)}
            className={`flex-1 py-2 rounded-full text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
              form.type === key
                ? key === "expense"
                  ? "bg-[var(--tertiary)] text-[var(--on-tertiary)]"
                  : "bg-[var(--secondary)] text-[var(--on-secondary)]"
                : "text-[var(--on-surface-variant)]"
            }`}
          >
            <Icon name={icon} className="text-base" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
          Amount
          <div className="flex items-center rounded-full px-4 bg-[var(--surface-container)]">
            <span className="text-[var(--outline)] font-medium text-sm">{currencySymbol(currency)}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              className="w-full bg-transparent px-2 py-2.5 font-normal normal-case tracking-normal text-[var(--on-surface)] focus:outline-none"
              placeholder="0"
            />
          </div>
        </label>

        <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
          Date
          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className="w-full rounded-full px-4 py-2.5 font-normal normal-case tracking-normal bg-[var(--surface-container)] text-[var(--on-surface)]"
          />
        </label>
      </div>

      <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
        Category
        <select
          value={form.categoryId}
          onChange={(e) => update("categoryId", e.target.value)}
          className="w-full rounded-full px-4 py-2.5 font-normal normal-case tracking-normal bg-[var(--surface-container)] text-[var(--on-surface)]"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
        Note (optional)
        <input
          type="text"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-full px-4 py-2.5 font-normal normal-case tracking-normal bg-[var(--surface-container)] text-[var(--on-surface)]"
          placeholder="Coffee with Sam"
        />
      </label>

      {error && <p className="text-sm text-[var(--error)] font-medium">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[var(--primary)] text-[var(--on-primary)] rounded-full py-3 text-[13px] font-bold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? (
          "Saving…"
        ) : (
          <>
            <Icon name="add" className="text-lg" />
            Save transaction
          </>
        )}
      </button>
    </form>
  );
}
