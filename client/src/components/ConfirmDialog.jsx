import { useEffect } from "react";
import Icon from "./Icon.jsx";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--on-surface)]/30 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--surface-lowest)] rounded-lg shadow-2xl max-w-sm w-full p-7 animate-in"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="w-11 h-11 rounded-2xl bg-[var(--error-container)] flex items-center justify-center mb-4">
          <Icon name="warning" className="text-[var(--on-error-container)] text-xl" />
        </div>

        <h2 id="confirm-dialog-title" className="font-serif italic text-lg">
          {title}
        </h2>
        {description && <p className="text-sm text-[var(--on-surface-variant)] mt-2">{description}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full text-[13px] font-bold border border-[var(--outline)]/30 hover:bg-[var(--surface-container)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full text-[13px] font-bold bg-[var(--error)] text-[var(--on-error)] hover:brightness-95 active:scale-[0.98] transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
