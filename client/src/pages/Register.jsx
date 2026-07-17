import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Pin({ className = "", style, children }) {
  return (
    <div
      className={`break-inside-avoid mb-4 rounded-lg card-soft card-hover overflow-hidden animate-in ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

function MoodCollage() {
  return (
    <div className="columns-2 gap-4 w-full max-w-md">
      <Pin className="p-5 h-40 rotate-1" style={{ background: "var(--surface-lowest)", animationDelay: "0s" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--primary-container)] flex items-center justify-center">
            <Icon name="auto_awesome" className="text-base text-[var(--on-primary-container)]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
            AI Insight
          </span>
        </div>
        <p className="text-sm font-bold leading-snug">Dining is down 12% this month.</p>
      </Pin>

      <Pin className="p-6 h-52" style={{ background: "var(--tertiary)", animationDelay: "0.05s" }}>
        <Icon name="format_quote" className="text-3xl text-[var(--on-tertiary)] opacity-40" />
        <p className="font-serif italic text-xl leading-snug mt-4 text-[var(--on-tertiary)]">
          small steps, every day.
        </p>
      </Pin>

      <Pin className="p-6 h-48" style={{ background: "var(--secondary)", animationDelay: "0.1s" }}>
        <p className="font-serif italic text-xl leading-snug text-[var(--on-secondary)]">
          begin your
          <br />
          finance journal.
        </p>
      </Pin>

      <Pin className="p-5 h-36 -rotate-1" style={{ background: "var(--surface-high)", animationDelay: "0.15s" }}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
            Wallet
          </span>
          <Icon name="account_balance_wallet" className="text-base text-[var(--primary)]" />
        </div>
        <p className="text-sm font-bold mt-3">3 accounts, one view</p>
      </Pin>

      <Pin className="p-5 h-44 rotate-1" style={{ background: "var(--primary-container)", animationDelay: "0.2s" }}>
        <Icon name="autorenew" className="text-2xl text-[var(--on-primary-container)]" />
        <p className="font-serif italic text-lg mt-4 text-[var(--on-primary-container)] leading-snug">
          every subscription,
          <br />
          tracked.
        </p>
      </Pin>

      <Pin className="p-6 h-56" style={{ background: "var(--primary)", animationDelay: "0.25s" }}>
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {["--secondary", "--tertiary", "--on-primary"].map((v) => (
            <span
              key={v}
              className="w-6 h-6 rounded-full border-2 border-[var(--on-primary)]/20"
              style={{ backgroundColor: `var(${v})` }}
            />
          ))}
        </div>
        <p className="font-serif italic text-lg leading-snug text-[var(--on-primary)]">
          five moods.
          <br />
          one you.
        </p>
      </Pin>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
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
      await register(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      <div className="hidden lg:flex lg:w-[56%] items-center justify-center bg-[var(--surface-low)] p-12 relative overflow-hidden">
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[var(--tertiary)]/10 blur-[100px] animate-drift"
          aria-hidden="true"
        />
        <MoodCollage />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div
          className="lg:hidden absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[var(--primary)]/10 blur-[90px]"
          aria-hidden="true"
        />

        <div className="w-full max-w-sm relative">
          <div className="text-center mb-8 animate-in">
            <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center mx-auto mb-5 shadow-lg">
              <span className="font-serif italic text-2xl text-[var(--on-primary)]">C</span>
            </div>
            <h1 className="font-serif italic text-4xl text-[var(--on-surface)] leading-none">Custos</h1>
            <p className="text-[13px] text-[var(--on-surface-variant)] mt-3 tracking-wide">
              an intentional finance journal
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-[var(--surface-lowest)] rounded-lg card-soft p-8 space-y-5 animate-in"
            style={{ animationDelay: "0.1s" }}
          >
            <p className="font-serif italic text-lg text-center text-[var(--on-surface)]">
              begin your intentional finance journal
            </p>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[var(--border)] rounded-full px-4 py-2.5 bg-[var(--surface-container)] font-normal normal-case tracking-normal text-[var(--on-surface)]"
              />
              <span className="text-[10px] font-normal normal-case tracking-normal text-[var(--outline)]">
                At least 6 characters
              </span>
            </label>

            {error && <p className="text-sm text-[var(--error)]">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--primary)] text-[var(--on-primary)] rounded-full py-3 text-[13px] font-bold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? "Creating account…" : "Create account"}
              {!submitting && <Icon name="arrow_forward" className="text-base" />}
            </button>

            <p className="text-[13px] text-center text-[var(--on-surface-variant)]">
              Already have one?{" "}
              <Link to="/login" className="text-[var(--primary)] font-bold">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
