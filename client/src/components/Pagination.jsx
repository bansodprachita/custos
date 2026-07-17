import Icon from "./Icon.jsx";

export default function Pagination({ page, totalPages, total, pageSize, onPageChange }) {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-xs text-[var(--on-surface-variant)] font-medium">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 rounded-full bg-[var(--surface-lowest)] flex items-center justify-center disabled:opacity-30 hover:bg-[var(--surface-container)] transition-colors"
          aria-label="Previous page"
        >
          <Icon name="chevron_left" className="text-lg" />
        </button>
        <span className="text-xs font-bold text-[var(--on-surface-variant)] px-1">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-8 h-8 rounded-full bg-[var(--surface-lowest)] flex items-center justify-center disabled:opacity-30 hover:bg-[var(--surface-container)] transition-colors"
          aria-label="Next page"
        >
          <Icon name="chevron_right" className="text-lg" />
        </button>
      </div>
    </div>
  );
}
