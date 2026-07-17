import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useSettings } from "../context/SettingsContext.jsx";
import { formatMoney } from "../utils/currency.js";
import { relativeTime } from "../utils/relativeTime.js";
import { categoryIcon } from "../utils/categoryIcon.js";
import Icon from "../components/Icon.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const TYPE_ICON = { checking: "account_balance_wallet", savings: "savings", credit: "credit_card" };
const CARD_COLOR_PRESETS = [
  "#6B7A4A",
  "#2E6E85",
  "#B9812E",
  "#6E2A35",
  "#37432A",
  "#8A5A3E",
  "#2B2B29",
  "#7C8F63",
];
const EMPTY_FORM = { name: "", type: "checking", last4: "", startingBalance: "", color: CARD_COLOR_PRESETS[0] };

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Wallet() {
  const { currency } = useSettings();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  const [formMode, setFormMode] = useState(null); // null | "add" | "edit"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadAccounts();
      setLoading(false);
    })();
  }, [loadAccounts]);

  useEffect(() => {
    if (!loading && accounts.length > 0 && selectedId === null) {
      setSelectedId(accounts[0].id);
    }
  }, [loading, accounts, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setTransactions([]);
      return;
    }
    let cancelled = false;
    setTxLoading(true);
    api
      .getAccountTransactions(selectedId)
      .then((data) => {
        if (!cancelled) setTransactions(data);
      })
      .catch(() => {
        if (!cancelled) setTransactions([]);
      })
      .finally(() => {
        if (!cancelled) setTxLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selectedAccount = accounts.find((a) => a.id === selectedId) || null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError(null);
    setFormMode("add");
  }

  function openEdit(account) {
    setForm({
      name: account.name,
      type: account.type,
      last4: account.last4 || "",
      startingBalance: String(account.startingBalance ?? 0),
      color: account.color || CARD_COLOR_PRESETS[0],
    });
    setEditingId(account.id);
    setFormError(null);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setEditingId(null);
    setFormError(null);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError("Enter an account name.");
      return;
    }
    if (form.last4 && !/^\d{4}$/.test(form.last4)) {
      setFormError("Last 4 digits must be exactly 4 numbers.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        last4: form.last4 || undefined,
        startingBalance: form.startingBalance === "" ? 0 : Number(form.startingBalance),
        color: form.color,
      };
      if (formMode === "edit" && editingId) {
        await api.updateAccount(editingId, payload);
      } else {
        const created = await api.createAccount(payload);
        setSelectedId(created.id);
      }
      await loadAccounts();
      closeForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteAccount(deleteId);
      if (selectedId === deleteId) setSelectedId(null);
      setDeleteId(null);
      await loadAccounts();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const deleteTarget = accounts.find((a) => a.id === deleteId) || null;

  return (
    <div className="space-y-widget-gap">
      <div>
        <h1 className="text-headline-md">wallet</h1>
        <p className="text-body-main text-[var(--on-surface-variant)] mt-1">Your accounts, at a glance.</p>
      </div>

      {error && (
        <div className="bg-[var(--error-container)] text-[var(--on-error-container)] rounded-md px-5 py-4 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="shrink-0 w-[220px] h-[130px] rounded-2xl bg-[var(--surface-container)] animate-pulse-soft"
            />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-[var(--surface-lowest)] rounded-lg card-soft p-12 flex flex-col items-center justify-center text-center gap-4 animate-in">
          <div className="w-14 h-14 rounded-full bg-[var(--primary-container)] flex items-center justify-center">
            <Icon name="account_balance_wallet" className="text-2xl text-[var(--on-primary-container)]" />
          </div>
          <div>
            <h2 className="font-serif italic text-lg">No accounts yet</h2>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1 max-w-sm">
              Add a checking, savings, or credit account to start tracking balances here.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="bg-[var(--primary)] text-[var(--on-primary)] rounded-full px-6 py-3 text-[13px] font-bold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition flex items-center gap-2"
          >
            <Icon name="add" className="text-lg" />
            Add your first account
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {accounts.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className={`relative shrink-0 w-[220px] h-[130px] rounded-2xl p-5 flex flex-col justify-between text-left card-soft card-hover animate-in transition-shadow ${
                  selectedId === a.id ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg)]" : ""
                }`}
                style={{ backgroundColor: a.color || "var(--primary)", animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{a.type}</span>
                  <Icon name={TYPE_ICON[a.type] || "account_balance_wallet"} className="text-white/80 text-lg" />
                </div>
                <div>
                  <p className="text-white font-serif italic text-base truncate">{a.name}</p>
                  <p className="text-white/70 text-xs tracking-widest mt-0.5 h-4">
                    {a.last4 ? `•••• ${a.last4}` : ""}
                  </p>
                  <p className="text-white text-lg font-bold mt-1">{formatMoney(a.balance, currency)}</p>
                </div>
              </button>
            ))}

            <button
              onClick={openAdd}
              className="shrink-0 w-[220px] h-[130px] rounded-2xl border-2 border-dashed border-[var(--outline)]/40 flex flex-col items-center justify-center gap-2 text-[var(--on-surface-variant)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors animate-in"
              style={{ animationDelay: `${accounts.length * 0.04}s` }}
            >
              <Icon name="add" className="text-2xl" />
              <span className="text-xs font-bold uppercase tracking-wide">Add account</span>
            </button>
          </div>

          {selectedAccount && (
            <div className="bg-[var(--surface-lowest)] rounded-lg card-soft p-8 animate-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif italic text-lg">{selectedAccount.name}</h2>
                  <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--on-surface-variant)] mt-0.5">
                    {cap(selectedAccount.type)}
                    {selectedAccount.last4 ? ` · •••• ${selectedAccount.last4}` : ""}
                    {" · "}
                    {formatMoney(selectedAccount.balance, currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(selectedAccount)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--surface-container)] hover:bg-[var(--surface-high)] transition-colors"
                    aria-label="Edit account"
                  >
                    <Icon name="edit" className="text-base text-[var(--on-surface-variant)]" />
                  </button>
                  <button
                    onClick={() => setDeleteId(selectedAccount.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--error-container)] hover:brightness-95 transition"
                    aria-label="Delete account"
                  >
                    <Icon name="delete" className="text-base text-[var(--on-error-container)]" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--outline)]/15">
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] mt-5 mb-4">
                  Recent transactions
                </h3>
                {txLoading ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-12 rounded-lg bg-[var(--surface-container)] animate-pulse-soft" />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-sm text-[var(--on-surface-variant)]">No transactions on this account yet.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {transactions.map((t) => (
                      <div key={t.id} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)] shrink-0">
                          <Icon name={categoryIcon(t.category?.name)} className="text-base" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{t.description || t.category?.name || "Transaction"}</p>
                          <p className="text-[10px] text-[var(--outline)] uppercase">
                            {t.category?.name} · {relativeTime(t.date)}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-bold shrink-0 ${
                            t.type === "expense" ? "text-[var(--tertiary)]" : "text-[var(--secondary)]"
                          }`}
                        >
                          {t.type === "expense" ? "-" : "+"}
                          {formatMoney(t.amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {formMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--on-surface)]/30 backdrop-blur-sm px-4"
          onClick={closeForm}
        >
          <form
            onSubmit={handleFormSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--surface-lowest)] rounded-lg card-soft p-7 space-y-4 max-w-sm w-full animate-in max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif italic text-xl">{formMode === "edit" ? "edit account" : "new account"}</h2>
              <button
                type="button"
                onClick={closeForm}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--surface-container)] transition-colors"
                aria-label="Close"
              >
                <Icon name="close" className="text-base text-[var(--on-surface-variant)]" />
              </button>
            </div>

            <div className="flex gap-2 bg-[var(--surface-container)] p-1 rounded-full">
              {["checking", "savings", "credit"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("type", t)}
                  className={`flex-1 py-2 rounded-full text-[13px] font-bold capitalize transition-colors ${
                    form.type === t
                      ? "bg-[var(--primary)] text-[var(--on-primary)]"
                      : "text-[var(--on-surface-variant)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-full px-4 py-2.5 font-normal normal-case tracking-normal bg-[var(--surface-container)] text-[var(--on-surface)] focus:outline-none"
                placeholder="Everyday checking"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
                Last 4 (optional)
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.last4}
                  onChange={(e) => update("last4", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full rounded-full px-4 py-2.5 font-normal normal-case tracking-normal bg-[var(--surface-container)] text-[var(--on-surface)] focus:outline-none"
                  placeholder="4821"
                />
              </label>

              <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
                Starting balance
                <input
                  type="number"
                  step="0.01"
                  value={form.startingBalance}
                  onChange={(e) => update("startingBalance", e.target.value)}
                  className="w-full rounded-full px-4 py-2.5 font-normal normal-case tracking-normal bg-[var(--surface-container)] text-[var(--on-surface)] focus:outline-none"
                  placeholder="0"
                />
              </label>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)]">
                Card color
              </span>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {CARD_COLOR_PRESETS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => update("color", c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      form.color === c
                        ? "ring-2 ring-offset-2 ring-[var(--primary)] ring-offset-[var(--surface-lowest)] scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Choose color ${c}`}
                  />
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => update("color", e.target.value)}
                  className="w-7 h-7 rounded-full overflow-hidden border-0 bg-transparent cursor-pointer"
                  aria-label="Custom color"
                />
              </div>
            </div>

            {formError && <p className="text-sm text-[var(--error)] font-medium">{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--primary)] text-[var(--on-primary)] rounded-full py-3 text-[13px] font-bold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                "Saving…"
              ) : (
                <>
                  <Icon name={formMode === "edit" ? "check" : "add"} className="text-lg" />
                  {formMode === "edit" ? "Save changes" : "Add account"}
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete this account?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. Its transactions stay in your history but will no longer be linked to an account.`
            : undefined
        }
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
