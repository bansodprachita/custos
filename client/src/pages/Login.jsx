import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import GoogleButton from "../components/GoogleButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, waking } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[var(--bg)] relative overflow-hidden">
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--secondary)]/10 blur-[90px]"
        aria-hidden="true"
      />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8 animate-in">
          <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span className="font-serif italic text-2xl text-[var(--on-primary)]">C</span>
          </div>
          <h1 className="font-serif italic text-4xl text-[var(--on-surface)] leading-none">Custos</h1>
          <p className="font-serif italic text-[13px] text-[var(--on-surface-variant)] mt-3 tracking-wide">
            by praaachita
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--surface-lowest)] rounded-lg card-soft p-8 space-y-5 animate-in"
          style={{ animationDelay: "0.1s" }}
        >
          <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[var(--border)] rounded-full px-4 py-2.5 bg-[var(--surface-container)] font-normal normal-case tracking-normal text-[var(--on-surface)]"
            />
          </label>

          <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[var(--border)] rounded-full px-4 py-2.5 bg-[var(--surface-container)] font-normal normal-case tracking-normal text-[var(--on-surface)]"
            />
          </label>

          {error && <p className="text-sm text-[var(--error)]">{error}</p>}

          {submitting && waking && (
            <p className="text-[12px] text-center text-[var(--on-surface-variant)]">
              Waking up the server — this free-tier instance naps when idle, so the
              first request can take up to a minute.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--primary)] text-[var(--on-primary)] rounded-full py-3 text-[13px] font-bold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? "Logging in…" : "Log in"}
            {!submitting && <Icon name="arrow_forward" className="text-base" />}
          </button>

          <p className="text-[13px] text-center text-[var(--on-surface-variant)]">
            No account?{" "}
            <Link to="/register" className="text-[var(--primary)] font-bold">
              Create one
            </Link>
          </p>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[11px] uppercase tracking-wide text-[var(--on-surface-variant)]">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <GoogleButton />
      </div>
    </div>
  );
}
