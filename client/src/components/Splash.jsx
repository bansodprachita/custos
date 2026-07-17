import { useEffect, useState } from "react";

export default function Splash({ onFinish }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1200);
    const doneTimer = setTimeout(() => onFinish(), 1700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg)] transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4" style={{ perspective: "600px" }}>
        <div className="w-20 h-20 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-2xl animate-coin">
          <span className="font-serif italic text-3xl text-[var(--on-primary)]">C</span>
        </div>
        <p className="font-serif italic text-[var(--on-surface-variant)] text-sm tracking-wide">custos</p>
      </div>
    </div>
  );
}
