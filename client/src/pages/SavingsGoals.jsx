import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client.js";
import { useSettings } from "../context/SettingsContext.jsx";
import { formatMoney, currencySymbol } from "../utils/currency.js";
import Icon from "../components/Icon.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { themedColor } from "../utils/chartPalette.js";

const RING_RADIUS = 46;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatTargetDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function GoalRing({ percent, color, reached }) {
  const clamped = Math.max(0, Math.min(percent, 100));
  const offset = RING_CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={RING_RADIUS} fill="none" stroke="var(--surface-highest)" strokeWidth="10" />
        <circle
          cx="56"
          cy="56"
          r={RING_RADIUS}
          fill="none"
          stroke={reached ? "var(--primary)" : color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s var(--ease)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {reached ? (
          <Icon name="check_circle" className="text-2xl text-[var(--primary)]" filled />
        ) : (
          <span className="block font-serif text-xl">{Math.round(clamped)}%</span>
        )}
      </div>
    </div>
  );
}

function emptyForm(goal) {
  return {
    name: goal?.name ?? "",
    targetAmount: goal ? String(goal.targetAmount) : "",
    currentAmount: goal ? String(goal.currentAmount) : "",
    targetDate: goal?.targetDate ? goal.targetDate.slice(0, 10) : "",
  };
}

function GoalFormModal({ open, goal, onClose, onSaved, currency }) {
  const isEdit = Boolean(goal);
  const [form, setForm] = useState(() => emptyForm(goal));
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(emptyForm(goal));
      setError(null);
    }
  }, [open, goal]);

  if (!open) return null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const targetAmount = Number(form.targetAmount);
    if (!form.name.trim()) {
      setError("Give your goal a name.");
      return;
    }
    if (!targetAmount || targetAmount <= 0) {
      setError("Enter a target amount greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        targetAmount,
        currentAmount: form.currentAmount ? Number(form.currentAmount) : 0,
        targetDate: form.targetDate || null,
      };
      if (isEdit) {
        await api.updateGoal(goal.id, payload);
      } else {
        await api.createGoal(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--on-surface)]/30 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--surface-lowest)] rounded-lg shadow-2xl max-w-sm w-full p-7 space-y-4 animate-in"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif italic text-lg">{isEdit ? "Edit Goal" : "New Goal"}</h2>
          <button
            type="button"
            onClick={onClose}
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
            placeholder="New laptop"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
            Target Amount
            <div className="flex items-center rounded-full px-4 bg-[var(--surface-container)]">
              <span className="text-[var(--outline)] font-medium text-sm">{currencySymbol(currency)}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.targetAmount}
                onChange={(e) => update("targetAmount", e.target.value)}
                className="w-full bg-transparent px-2 py-2.5 font-normal normal-case tracking-normal text-[var(--on-surface)] focus:outline-none"
                placeholder="0"
              />
            </div>
          </label>

          <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
            Starting Amount
            <div className="flex items-center rounded-full px-4 bg-[var(--surface-container)]">
              <span className="text-[var(--outline)] font-medium text-sm">{currencySymbol(currency)}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.currentAmount}
                onChange={(e) => update("currentAmount", e.target.value)}
                className="w-full bg-transparent px-2 py-2.5 font-normal normal-case tracking-normal text-[var(--on-surface)] focus:outline-none"
                placeholder="0"
              />
            </div>
          </label>
        </div>

        <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
          Target Date
          <input
            type="date"
            value={form.targetDate}
            onChange={(e) => update("targetDate", e.target.value)}
            className="w-full rounded-full px-4 py-2.5 font-normal normal-case tracking-normal bg-[var(--surface-container)] text-[var(--on-surface)]"
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
              <Icon name={isEdit ? "check" : "add"} className="text-lg" />
              {isEdit ? "Save changes" : "Create goal"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function SavingsGoals() {
  const { currency } = useSettings();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);

  const [contributeAmounts, setContributeAmounts] = useState({});
  const [contributingId, setContributingId] = useState(null);
  const [flashId, setFlashId] = useState(null);

  const refetch = useCallback(async () => {
    try {
      const list = await api.getGoals();
      setGoals(list);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  function openCreate() {
    setEditingGoal(null);
    setFormOpen(true);
  }

  function openEdit(goal) {
    setEditingGoal(goal);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingGoal(null);
  }

  async function handleSaved() {
    closeForm();
    await refetch();
  }

  async function handleDelete() {
    if (!deletingGoal) return;
    try {
      await api.deleteGoal(deletingGoal.id);
      setDeletingGoal(null);
      await refetch();
    } catch (err) {
      setError(err.message);
      setDeletingGoal(null);
    }
  }

  async function handleContribute(goal) {
    const amount = Number(contributeAmounts[goal.id]);
    if (!amount || amount <= 0) return;
    setContributingId(goal.id);
    try {
      await api.contributeToGoal(goal.id, amount);
      setContributeAmounts((v) => ({ ...v, [goal.id]: "" }));
      await refetch();
      setFlashId(goal.id);
      setTimeout(() => setFlashId((id) => (id === goal.id ? null : id)), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setContributingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-widget-gap">
        <h1 className="text-headline-md">savings goals</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-widget-gap">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-[var(--surface-container)] rounded-lg h-72 animate-pulse-soft" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-widget-gap">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-headline-md">savings goals</h1>
          <p className="text-body-main text-[var(--on-surface-variant)] mt-1">
            Set targets, track progress, and top them up as you go.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[var(--primary)] text-[var(--on-primary)] rounded-full px-5 py-2.5 text-[13px] font-bold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition flex items-center gap-2 shrink-0"
        >
          <Icon name="add" className="text-lg" />
          New goal
        </button>
      </div>

      {error && (
        <div className="bg-[var(--error-container)] text-[var(--on-error-container)] rounded-md px-5 py-4 text-sm font-medium">
          {error}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="bg-[var(--surface-lowest)] rounded-lg card-soft p-12 flex flex-col items-center text-center gap-3 animate-in">
          <div className="w-14 h-14 rounded-full bg-[var(--secondary-container)] flex items-center justify-center">
            <Icon name="savings" className="text-2xl text-[var(--on-secondary-container)]" />
          </div>
          <h2 className="font-serif italic text-lg">No savings goals yet</h2>
          <p className="text-sm text-[var(--on-surface-variant)] max-w-sm">
            Whether it's a trip, an emergency fund, or something fun — give it a name and a number to work
            towards.
          </p>
          <button
            onClick={openCreate}
            className="mt-2 bg-[var(--primary)] text-[var(--on-primary)] rounded-full px-5 py-2.5 text-[13px] font-bold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition flex items-center gap-2"
          >
            <Icon name="add" className="text-lg" />
            Set your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-widget-gap">
          {goals.map((goal, i) => {
            const reached = goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount;
            const percent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const dateLabel = formatTargetDate(goal.targetDate);

            return (
              <div
                key={goal.id}
                className={`rounded-lg p-7 card-soft card-hover animate-in flex flex-col ${
                  reached ? "bg-[var(--primary-container)]" : "bg-[var(--surface-lowest)]"
                }`}
                style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2
                    className={`font-serif italic text-lg leading-tight ${
                      reached ? "text-[var(--on-primary-container)]" : ""
                    }`}
                  >
                    {goal.name}
                  </h2>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(goal)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        reached
                          ? "text-[var(--on-primary-container)] hover:bg-[var(--on-primary-container)]/10"
                          : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]"
                      }`}
                      aria-label="Edit goal"
                    >
                      <Icon name="edit" className="text-base" />
                    </button>
                    <button
                      onClick={() => setDeletingGoal(goal)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        reached
                          ? "text-[var(--on-primary-container)] hover:bg-[var(--on-primary-container)]/10"
                          : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]"
                      }`}
                      aria-label="Delete goal"
                    >
                      <Icon name="delete" className="text-base" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <GoalRing percent={percent} color={themedColor(goal.id)} reached={reached} />
                </div>

                <div className="text-center mt-4">
                  <p className={`text-sm font-bold ${reached ? "text-[var(--on-primary-container)]" : ""}`}>
                    {formatMoney(goal.currentAmount, currency)}{" "}
                    <span
                      className={`font-normal ${
                        reached ? "text-[var(--on-primary-container)]/60" : "text-[var(--on-surface-variant)]"
                      }`}
                    >
                      of {formatMoney(goal.targetAmount, currency)}
                    </span>
                  </p>
                  {dateLabel && (
                    <p
                      className={`text-[11px] uppercase font-bold tracking-wide mt-1 ${
                        reached ? "text-[var(--on-primary-container)]/60" : "text-[var(--outline)]"
                      }`}
                    >
                      By {dateLabel}
                    </p>
                  )}
                  {reached && (
                    <p className="text-[11px] uppercase font-bold tracking-wide mt-2 text-[var(--primary)] flex items-center justify-center gap-1">
                      <Icon name="check_circle" className="text-sm" filled />
                      Goal reached
                    </p>
                  )}
                </div>

                <div
                  className={`mt-5 pt-5 border-t flex items-center gap-2 ${
                    reached ? "border-[var(--on-primary-container)]/15" : "border-[var(--outline)]/20"
                  }`}
                >
                  <div
                    className={`flex-1 flex items-center rounded-full px-3 ${
                      reached ? "bg-[var(--on-primary-container)]/10" : "bg-[var(--surface-container)]"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium ${
                        reached ? "text-[var(--on-primary-container)]/70" : "text-[var(--outline)]"
                      }`}
                    >
                      {currencySymbol(currency)}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={contributeAmounts[goal.id] ?? ""}
                      onChange={(e) => setContributeAmounts((v) => ({ ...v, [goal.id]: e.target.value }))}
                      placeholder="Amount"
                      className={`w-full bg-transparent px-2 py-2 text-sm focus:outline-none ${
                        reached ? "text-[var(--on-primary-container)]" : "text-[var(--on-surface)]"
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => handleContribute(goal)}
                    disabled={contributingId === goal.id}
                    className={`px-4 py-2 rounded-full text-[12px] font-bold shrink-0 flex items-center gap-1.5 transition disabled:opacity-50 ${
                      reached
                        ? "bg-[var(--on-primary-container)]/15 text-[var(--on-primary-container)]"
                        : "bg-[var(--secondary)] text-[var(--on-secondary)]"
                    }`}
                  >
                    {flashId === goal.id ? (
                      <Icon name="check" className="text-base" />
                    ) : contributingId === goal.id ? (
                      "…"
                    ) : (
                      <>
                        <Icon name="add" className="text-base" />
                        Add funds
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GoalFormModal open={formOpen} goal={editingGoal} onClose={closeForm} onSaved={handleSaved} currency={currency} />

      <ConfirmDialog
        open={Boolean(deletingGoal)}
        title="Delete this goal?"
        description={deletingGoal ? `"${deletingGoal.name}" and its progress will be permanently removed.` : ""}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingGoal(null)}
      />
    </div>
  );
}
