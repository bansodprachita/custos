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
      <Pin className="p-6 flex flex-col justify-between h-56" style={{ background: "var(--primary)", animationDelay: "0s" }}>
        <Icon name="format_quote" className="text-3xl text-[var(--on-primary)] opacity-40" />
        <p className="font-serif italic text-xl leading-snug text-[var(--on-primary)]">
          money, kept with intention.
        </p>
      </Pin>

      <Pin className="p-5 h-40 -rotate-1" style={{ background: "var(--surface-lowest)", animationDelay: "0.05s" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--tertiary-container)] flex items-center justify-center">
            <Icon name="trending_up" className="text-base text-[var(--on-tertiary-container)]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
            This quarter
          </span>
        </div>
        <p className="font-serif text-2xl leading-none">+18%</p>
        <p className="text-[11px] text-[var(--outline)] mt-1">saved vs. last quarter</p>
      </Pin>

      <Pin className="p-5 h-44 rotate-1" style={{ background: "var(--secondary-container)", animationDelay: "0.1s" }}>
        <Icon name="flag" className="text-2xl text-[var(--on-secondary-container)]" />
        <p className="font-serif italic text-lg mt-4 text-[var(--on-secondary-container)] leading-snug">
          Tokyo trip
          <br />
          64% funded
        </p>
      </Pin>

      <Pin className="p-6 h-52" style={{ background: "var(--tertiary)", animationDelay: "0.15s" }}>
        <div className="flex items-center gap-2 flex-wrap">
          {["--primary", "--secondary", "--tertiary", "--on-tertiary"].map((v, i) => (
            <span
              key={v}
              className="w-6 h-6 rounded-full border-2 border-[var(--on-tertiary)]/20"
              style={{ backgroundColor: `var(${v})`, opacity: i === 3 ? 0.5 : 1 }}
            />
          ))}
        </div>
        <p className="font-serif italic text-lg mt-6 text-[var(--on-tertiary)] leading-snug">
          a palette for every mood.
        </p>
      </Pin>

      <Pin className="p-5 h-36 -rotate-1" style={{ background: "var(--surface-high)", animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
            Budget
          </span>
          <Icon name="check_circle" className="text-base text-[var(--primary)]" filled />
        </div>
        <p className="text-sm font-bold mt-3">On track this month</p>
      </Pin>

      <Pin className="p-6 h-48" style={{ background: "var(--primary-container)", animationDelay: "0.25s" }}>
        <p className="font-serif italic text-xl leading-snug text-[var(--on-primary-container)]">
          quiet money
          <br />
          moves further.
        </p>
      </Pin>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
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
    <div className="min-h-screen flex bg-[var(--bg)]">
      <div className="hidden lg:flex lg:w-[56%] items-center justify-center bg-[var(--surface-low)] p-12 relative overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[var(--primary)]/10 blur-[100px] animate-drift"
          aria-hidden="true"
        />
        <MoodCollage />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div
          className="lg:hidden absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--secondary)]/10 blur-[90px]"
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
              hello again. what's the vibe today?
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[var(--border)] rounded-full px-4 py-2.5 bg-[var(--surface-container)] font-normal normal-case tracking-normal text-[var(--on-surface)]"
              />
            </label>

            {error && <p className="text-sm text-[var(--error)]">{error}</p>}

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
        </div>
      </div>
    </div>
  );
}
