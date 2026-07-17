import { useState } from "react";
import Icon from "./Icon.jsx";
import { api } from "../api/client.js";
import { formatMoney } from "../utils/currency.js";
import { categoryIcon } from "../utils/categoryIcon.js";
import { readableOn } from "../utils/contrast.js";
import ConfirmDialog from "./ConfirmDialog.jsx";

const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function TransactionList({ transactions, onChanged, currency, hasActiveFilters }) {
  const [pendingDelete, setPendingDelete] = useState(null);

  async function confirmDelete() {
    if (!pendingDelete) return;
    await api.deleteTransaction(pendingDelete.id);
    setPendingDelete(null);
    onChanged();
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-[var(--surface-lowest)] rounded-lg card-soft p-10 text-center text-[var(--on-surface-variant)] font-medium text-sm">
        {hasActiveFilters
          ? "No transactions match your filters."
          : "No transactions yet. Add your first one to see it here."}
      </div>
    );
  }

  return (
    <>
      <div className="bg-[var(--surface-lowest)] rounded-lg card-soft divide-y divide-[var(--border)] overflow-hidden">
        {transactions.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--surface-container)]"
          >
            <div className="flex items-center gap-4">
              <span
                className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
                style={{
                  backgroundColor: t.category?.color ?? "#8B7CF6",
                  color: readableOn(t.category?.color ?? "#8B7CF6"),
                }}
              >
                <Icon name={categoryIcon(t.category?.name)} className="text-base" />
              </span>
              <div>
                <p className="text-sm font-bold">{t.description || t.category?.name}</p>
                <p className="text-[11px] text-[var(--outline)] uppercase font-medium">
                  {t.category?.name} · {formatDate(t.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`font-bold text-sm px-3 py-1.5 rounded-full ${
                  t.type === "expense"
                    ? "bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)]"
                    : "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]"
                }`}
              >
                {t.type === "expense" ? "-" : "+"}
                {formatMoney(t.amount, currency)}
              </span>
              <button
                onClick={() => setPendingDelete(t)}
                className="w-8 h-8 rounded-full bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-error)] hover:bg-[var(--error)] transition-colors flex items-center justify-center"
                aria-label="Delete transaction"
              >
                <Icon name="delete" className="text-base" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this transaction?"
        description={
          pendingDelete
            ? `${pendingDelete.description || pendingDelete.category?.name} — ${formatMoney(
                pendingDelete.amount,
                currency
              )}. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
