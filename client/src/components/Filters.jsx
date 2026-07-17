import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import { api } from "../api/client.js";

export default function Filters({ categories, onChange }) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ search, categoryId, type, from, to });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryId, type, from, to]);

  const hasActiveFilters = search || categoryId || type || from || to;

  function clearAll() {
    setSearch("");
    setCategoryId("");
    setType("");
    setFrom("");
    setTo("");
  }

  async function handleExport() {
    setExporting(true);
    try {
      await api.exportTransactionsCSV({ search, categoryId, type, from, to });
    } catch (err) {
      alert(err.message);
    } finally {
      setExporting(false);
    }
  }

  const inputClass =
    "border-none rounded-full px-4 py-2 text-[13px] bg-[var(--surface-container)] text-[var(--on-surface)]";

  return (
    <div className="bg-[var(--surface-lowest)] rounded-md card-soft p-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[180px]">
        <Icon
          name="search"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--outline)] text-lg"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes or category…"
          className={`w-full pl-11 ${inputClass}`}
        />
      </div>

      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
        <option value="">All types</option>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
      <span className="text-[var(--outline)] text-sm">to</span>
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />

      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-full bg-[var(--surface-high)] hover:bg-[var(--surface-highest)] transition-colors disabled:opacity-50"
      >
        <Icon name="download" className="text-base" />
        {exporting ? "Exporting…" : "Export"}
      </button>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-[13px] font-bold text-[var(--primary)] hover:opacity-80 transition"
        >
          <Icon name="close" className="text-base" />
          Clear
        </button>
      )}
    </div>
  );
}
