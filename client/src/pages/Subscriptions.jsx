import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "../api/client.js";
import { useSettings } from "../context/SettingsContext.jsx";
import { formatMoney, currencySymbol } from "../utils/currency.js";
import Icon from "../components/Icon.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const today = () => new Date().toISOString().slice(0, 10);

const RING_RADIUS = 20;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_WINDOW_DAYS = 30;

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function ringDashoffset(days) {
  const percent = Math.max(0, Math.min(100, (days / RING_WINDOW_DAYS) * 100));
  return RING_CIRCUMFERENCE * (1 - percent / 100);
}

const emptyForm = {
  name: "",
  amount: "",
  billingCycle: "monthly",
  nextRenewal: today(),
  categoryId: "",
  active: true,
};

export default function Subscriptions() {
  const { currency } = useSettings();
  const [subscriptions, setSubscriptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [subs, cats] = await Promise.all([api.getSubscriptions(), api.getCategories()]);
      setSubscriptions(subs);
      setCategories(cats);
      setError(null);
    } catch (err) {
      setError(err.message || "Could not reach the Custos API. Is the server running on port 4000?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const active = subscriptions.filter((s) => s.active);
    const monthlyCost = active.reduce(
      (sum, s) => sum + (s.billingCycle === "yearly" ? s.amount / 12 : s.amount),
      0
    );
    return {
      activeCount: active.length,
      monthlyCost,
      annualCost: monthlyCost * 12,
    };
  }, [subscriptions]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(sub) {
    setEditingId(sub.id);
    setForm({
      name: sub.name,
      amount: String(sub.amount),
      billingCycle: sub.billingCycle,
      nextRenewal: sub.nextRenewal.slice(0, 10),
      categoryId: sub.categoryId ? String(sub.categoryId) : "",
      active: sub.active,
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const amount = Number(form.amount);
    if (!form.name.trim()) {
      setFormError("Give the subscription a name.");
      return;
    }
    if (!amount || amount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }
    if (!form.nextRenewal) {
      setFormError("Choose the next renewal date.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      amount,
      billingCycle: form.billingCycle,
      nextRenewal: form.nextRenewal,
      active: form.active,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await api.updateSubscription(editingId, payload);
      } else {
        await api.createSubscription(payload);
      }
      closeForm();
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleteError(null);
    try {
      await api.deleteSubscription(pendingDelete.id);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setDeleteError(err.message);
      setPendingDelete(null);
    }
  }

  if (error) {
    return (
      <div className="bg-[var(--error-container)] text-[var(--on-error-container)] rounded-md px-5 py-4 text-sm font-medium">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-widget-gap">
        <h1 className="text-headline-md">subscriptions</h1>
        <div className="bg-[var(--surface-container)] rounded-lg h-32 animate-pulse-soft" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-widget-gap">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-[var(--surface-container)] rounded-lg h-48 animate-pulse-soft" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-widget-gap">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-headline-md">subscriptions</h1>
          <p className="text-body-main text-[var(--on-surface-variant)] mt-1">
            Keep an eye on every recurring payment, before it renews.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-[13px] font-bold flex items-center gap-2 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition"
        >
          <Icon name="add" className="text-lg" />
          Add subscription
        </button>
      </div>

      {/* Summary */}
      <div className="bg-[var(--primary-container)] text-[var(--on-primary-container)] rounded-lg p-8 card-soft card-hover animate-in flex flex-wrap items-center gap-8">
        <div className="w-14 h-14 rounded-full bg-[var(--on-primary-container)]/10 flex items-center justify-center shrink-0">
          <Icon name="autorenew" className="text-2xl" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Active subscriptions</span>
          <h3 className="text-[32px] font-serif mt-1 leading-none">{summary.activeCount}</h3>
        </div>
        <div className="w-px h-12 bg-current opacity-10 hidden sm:block" />
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Monthly cost</span>
          <h3 className="text-[32px] font-serif mt-1 leading-none">{formatMoney(summary.monthlyCost, currency)}</h3>
        </div>
        <div className="w-px h-12 bg-current opacity-10 hidden sm:block" />
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Annualized</span>
          <p className="text-lg font-serif mt-1 leading-none opacity-80">
            {formatMoney(summary.annualCost, currency)}
          </p>
        </div>
      </div>

      {/* Grid */}
      {subscriptions.length === 0 ? (
        <div className="bg-[var(--surface-lowest)] rounded-lg card-soft p-12 flex flex-col items-center text-center gap-4 animate-in">
          <div className="w-14 h-14 rounded-full bg-[var(--surface-container)] flex items-center justify-center">
            <Icon name="event_repeat" className="text-2xl text-[var(--on-surface-variant)]" />
          </div>
          <div>
            <h2 className="font-serif italic text-lg">No subscriptions yet</h2>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">
              Track the things that renew, so nothing sneaks up on you.
            </p>
          </div>
          <button
            onClick={openAddForm}
            className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-[13px] font-bold flex items-center gap-2"
          >
            <Icon name="add" className="text-lg" />
            Add your first subscription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-widget-gap">
          {subscriptions.map((sub, i) => {
            const days = daysUntil(sub.nextRenewal);
            const offset = ringDashoffset(days);
            const ringColor = days <= 3 ? "var(--error)" : "var(--primary)";
            return (
              <div
                key={sub.id}
                className={`bg-[var(--surface-lowest)] rounded-lg p-6 card-soft card-hover animate-in flex flex-col gap-4 ${
                  sub.active ? "" : "opacity-50"
                }`}
                style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {sub.category?.color && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: sub.category.color }}
                        />
                      )}
                      <h2 className="font-serif italic text-lg truncate">{sub.name}</h2>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-[var(--outline)] mt-1">
                      {sub.category?.name || "Uncategorized"}
                    </p>
                  </div>
                  <div className="relative w-12 h-12 shrink-0">
                    <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
                      <circle cx="24" cy="24" r={RING_RADIUS} fill="none" stroke="var(--surface-highest)" strokeWidth="4" />
                      <circle
                        cx="24"
                        cy="24"
                        r={RING_RADIUS}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 0.6s var(--ease)" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[11px] font-bold">{days < 0 ? 0 : days}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="block text-xl font-serif">{formatMoney(sub.amount, currency)}</span>
                    <span className="text-[10px] uppercase font-bold text-[var(--on-surface-variant)]">
                      / {sub.billingCycle === "yearly" ? "yr" : "mo"}
                    </span>
                  </div>
                  {!sub.active && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[var(--surface-container)] text-[var(--on-surface-variant)]">
                      Paused
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[var(--on-surface-variant)]">
                  Renews{" "}
                  {new Date(sub.nextRenewal).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                <div className="flex gap-2 pt-2 border-t border-[var(--border)] mt-auto">
                  <button
                    onClick={() => openEditForm(sub)}
                    className="flex-1 py-2 rounded-full text-[12px] font-bold bg-[var(--surface-container)] text-[var(--on-surface)] hover:bg-[var(--surface-high)] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Icon name="edit" className="text-sm" />
                    Edit
                  </button>
                  <button
                    onClick={() => setPendingDelete(sub)}
                    className="w-9 h-9 rounded-full bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-error)] hover:bg-[var(--error)] transition-colors flex items-center justify-center shrink-0"
                    aria-label={`Delete ${sub.name}`}
                  >
                    <Icon name="delete" className="text-sm" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--on-surface)]/30 backdrop-blur-sm px-4"
          onClick={closeForm}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--surface-lowest)] rounded-lg card-soft p-7 space-y-4 max-w-md w-full max-h-[90vh] overflow-y-auto animate-in"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif italic text-xl">{editingId ? "edit subscription" : "new subscription"}</h2>
              <button
                type="button"
                onClick={closeForm}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-colors"
                aria-label="Close"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>

            <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-full px-4 py-2.5 font-normal normal-case tracking-normal bg-[var(--surface-container)] text-[var(--on-surface)] focus:outline-none"
                placeholder="Netflix"
              />
            </label>

            <div className="flex gap-2 bg-[var(--surface-container)] p-1 rounded-full">
              {[
                { key: "monthly", label: "Monthly", icon: "event_repeat" },
                { key: "yearly", label: "Yearly", icon: "calendar_month" },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update("billingCycle", key)}
                  className={`flex-1 py-2 rounded-full text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    form.billingCycle === key
                      ? "bg-[var(--primary)] text-[var(--on-primary)]"
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
                Next renewal
                <input
                  type="date"
                  value={form.nextRenewal}
                  onChange={(e) => update("nextRenewal", e.target.value)}
                  className="w-full rounded-full px-4 py-2.5 font-normal normal-case tracking-normal bg-[var(--surface-container)] text-[var(--on-surface)]"
                />
              </label>
            </div>

            <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
              Category (optional)
              <select
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
                className="w-full rounded-full px-4 py-2.5 font-normal normal-case tracking-normal bg-[var(--surface-container)] text-[var(--on-surface)]"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)]">
              Active
              <button
                type="button"
                role="switch"
                aria-checked={form.active}
                onClick={() => update("active", !form.active)}
                className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                  form.active ? "bg-[var(--primary)] justify-end" : "bg-[var(--surface-container)] justify-start"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-[var(--surface-lowest)] shadow block" />
              </button>
            </label>

            {formError && <p className="text-sm text-[var(--error)] font-medium">{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--primary)] text-[var(--on-primary)] rounded-full py-3 text-[13px] font-bold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? "Saving…" : editingId ? "Save changes" : "Add subscription"}
            </button>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This subscription will be removed and won't appear in future renewal reminders."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      {deleteError && <p className="text-sm text-[var(--error)] font-medium">{deleteError}</p>}
    </div>
  );
}
