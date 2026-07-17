import { useState } from "react";
import Icon from "../components/Icon.jsx";
import { useSettings, COLOR_THEMES } from "../context/SettingsContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { CURRENCY_OPTIONS } from "../utils/currency.js";
import { api } from "../api/client.js";

export default function Settings() {
  const { theme, toggleTheme, colorTheme, setColorTheme, currency, setCurrency } = useSettings();
  const { email, name, updateName } = useAuth();
  const [error, setError] = useState(null);

  const [nameInput, setNameInput] = useState(name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: "", next: "" });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleSaveName(e) {
    e.preventDefault();
    setSavingName(true);
    setNameSaved(false);
    try {
      await updateName(nameInput);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);
    setSavingPassword(true);
    try {
      await api.updatePassword(passwordForm.current, passwordForm.next);
      setPasswordForm({ current: "", next: "" });
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  const sectionClass = "animate-in card-hover bg-[var(--surface-lowest)] rounded-lg card-soft p-8 space-y-5";
  const inputClass =
    "border-none rounded-full px-4 py-2 text-sm bg-[var(--surface-container)] text-[var(--on-surface)]";

  return (
    <div className="space-y-widget-gap max-w-3xl">
      <div>
        <h1 className="text-headline-md text-[var(--on-surface)]">settings</h1>
        <p className="text-body-main text-[var(--on-surface-variant)] mt-1">Tune Custos to how you track money.</p>
      </div>

      <section className={sectionClass}>
        <h2 className="font-serif italic text-lg flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center shrink-0">
            <Icon name="person" className="text-lg" />
          </span>
          Profile
        </h2>

        <form onSubmit={handleSaveName} className="flex items-end gap-3 flex-wrap">
          <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
            Display name
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              className={`block font-normal normal-case tracking-normal ${inputClass}`}
            />
          </label>
          <button
            type="submit"
            disabled={savingName}
            className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-[13px] font-bold disabled:opacity-50"
          >
            {savingName ? "Saving…" : nameSaved ? "Saved ✓" : "Save name"}
          </button>
        </form>

        <p className="text-xs text-[var(--on-surface-variant)]">
          Signed in as <span className="font-bold">{email}</span>
        </p>

        <form
          onSubmit={handleChangePassword}
          className="flex items-end gap-3 flex-wrap pt-4 border-t border-[var(--border)]"
        >
          <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
            Current password
            <input
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
              className={`block font-normal normal-case tracking-normal ${inputClass}`}
            />
          </label>
          <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
            New password
            <input
              type="password"
              minLength={6}
              value={passwordForm.next}
              onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))}
              className={`block font-normal normal-case tracking-normal ${inputClass}`}
            />
          </label>
          <button
            type="submit"
            disabled={savingPassword || !passwordForm.current || !passwordForm.next}
            className="px-5 py-2.5 rounded-full bg-[var(--surface-high)] text-[var(--on-surface)] text-[13px] font-bold disabled:opacity-50"
          >
            {savingPassword ? "Updating…" : passwordSaved ? "Updated ✓" : "Change password"}
          </button>
        </form>
        {passwordError && <p className="text-sm text-[var(--error)]">{passwordError}</p>}
      </section>

      <section className={sectionClass}>
        <h2 className="font-serif italic text-lg flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center shrink-0">
            <Icon name="palette" className="text-lg" />
          </span>
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Theme</p>
            <p className="text-xs text-[var(--on-surface-variant)]">Light or dark, your call.</p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-full bg-[var(--surface-container)] text-[13px] font-bold flex items-center gap-2"
          >
            <Icon name={theme === "light" ? "dark_mode" : "light_mode"} className="text-base" />
            {theme === "light" ? "Switch to dark" : "Switch to light"}
          </button>
        </div>

        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-sm font-bold mb-1">Color palette</p>
          <p className="text-xs text-[var(--on-surface-variant)] mb-4">
            Each palette has its own light and dark version.
          </p>
          <div className="flex gap-3 flex-wrap">
            {COLOR_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setColorTheme(t.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-full border-2 transition-all ${
                  colorTheme === t.id
                    ? "border-[var(--primary)] bg-[var(--surface-container)]"
                    : "border-transparent bg-[var(--surface-container)]/50 hover:bg-[var(--surface-container)]"
                }`}
              >
                <span className="flex -space-x-1.5">
                  {t.swatches.map((hex, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border-2 border-[var(--surface-lowest)]"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </span>
                <span className="text-[13px] font-bold">{t.label}</span>
                {colorTheme === t.id && <Icon name="check" className="text-[var(--primary)] text-base" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="font-serif italic text-lg flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center shrink-0">
            <Icon name="payments" className="text-lg" />
          </span>
          Currency
        </h2>
        <div className="flex gap-2 flex-wrap">
          {CURRENCY_OPTIONS.map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold transition-colors ${
                currency === c.code
                  ? "bg-[var(--primary)] text-[var(--on-primary)]"
                  : "bg-[var(--surface-container)] text-[var(--on-surface-variant)]"
              }`}
            >
              {c.symbol} {c.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
