import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../api/client.js";
import { useSettings } from "../context/SettingsContext.jsx";
import { formatMoney } from "../utils/currency.js";
import Icon from "../components/Icon.jsx";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function currentMonthString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shiftMonth(monthString, delta) {
  const [year, month] = monthString.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildGrid(monthString) {
  const [year, month] = monthString.split("-").map(Number);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarPage() {
  const { currency } = useSettings();
  const [monthString, setMonthString] = useState(currentMonthString());
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const refetch = useCallback(async (month) => {
    setLoading(true);
    try {
      const data = await api.getCalendar(month);
      setDays(data.days || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Could not load the calendar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(monthString);
    setSelectedDate(null);
  }, [monthString, refetch]);

  const dayMap = useMemo(() => {
    const map = new Map();
    for (const d of days) map.set(d.date, d);
    return map;
  }, [days]);

  const maxExpense = useMemo(() => {
    return days.reduce((max, d) => Math.max(max, d.expense || 0), 0);
  }, [days]);

  const cells = useMemo(() => buildGrid(monthString), [monthString]);

  const [year, month] = monthString.split("-").map(Number);
  const monthLabel = `${MONTH_LABELS[month - 1]} ${year}`;
  const today = todayDateString();
  const selectedEntry = selectedDate ? dayMap.get(selectedDate) : null;

  return (
    <div className="space-y-widget-gap">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-md">calendar</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMonthString((m) => shiftMonth(m, -1))}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--surface-container)] hover:bg-[var(--surface-high)] transition-colors"
            aria-label="Previous month"
          >
            <Icon name="chevron_left" />
          </button>
          <span className="font-serif italic text-xl min-w-[9rem] text-center">{monthLabel}</span>
          <button
            type="button"
            onClick={() => setMonthString((m) => shiftMonth(m, 1))}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--surface-container)] hover:bg-[var(--surface-high)] transition-colors"
            aria-label="Next month"
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[var(--error-container)] text-[var(--on-error-container)] rounded-md px-5 py-4 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="bg-[var(--surface-container)] rounded-lg aspect-square animate-pulse-soft"
              style={{ animationDelay: `${(i % 7) * 0.03}s` }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--surface-lowest)] rounded-lg card-soft p-6">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="text-center text-[10px] font-bold uppercase tracking-widest text-[var(--outline)] py-2"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((date, i) => {
              if (!date) return <div key={i} className="aspect-square" />;

              const entry = dayMap.get(date);
              const dayNumber = Number(date.slice(-2));
              const isToday = date === today;
              const isSelected = date === selectedDate;
              const hasBills = entry?.bills && entry.bills.length > 0;
              const heatOpacity =
                entry && entry.expense && maxExpense > 0
                  ? Math.max(0.12, Math.min(1, entry.expense / maxExpense))
                  : 0;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-colors bg-[var(--surface-container)] hover:bg-[var(--surface-high)] ${
                    isToday ? "ring-2 ring-[var(--primary)]" : ""
                  } ${isSelected ? "outline outline-2 outline-[var(--secondary)]" : ""}`}
                >
                  {heatOpacity > 0 && (
                    <span
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{ backgroundColor: "var(--tertiary)", opacity: heatOpacity * 0.5 }}
                    />
                  )}
                  <span className="relative text-xs font-bold">{dayNumber}</span>
                  <span className="relative flex items-center gap-1 h-2">
                    {entry?.expense > 0 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "var(--primary)", opacity: Math.max(0.3, heatOpacity) }}
                      />
                    )}
                    {hasBills && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--secondary)" }} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!loading && (
        <div className="bg-[var(--surface-lowest)] rounded-lg card-soft p-8">
          {!selectedDate ? (
            <p className="text-sm text-[var(--on-surface-variant)]">Select a day to see its details.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif italic text-lg">
                  {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h4>
                {selectedDate === today && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">Today</span>
                )}
              </div>

              {!selectedEntry ? (
                <p className="text-sm text-[var(--on-surface-variant)]">No activity on this day.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--surface-container)] rounded-lg p-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--outline)] mb-1">
                        Income
                      </p>
                      <p className="font-serif text-xl text-[var(--secondary)]">
                        {formatMoney(selectedEntry.income || 0, currency)}
                      </p>
                    </div>
                    <div className="bg-[var(--surface-container)] rounded-lg p-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--outline)] mb-1">
                        Expense
                      </p>
                      <p className="font-serif text-xl text-[var(--tertiary)]">
                        {formatMoney(selectedEntry.expense || 0, currency)}
                      </p>
                    </div>
                  </div>

                  {selectedEntry.categories && selectedEntry.categories.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--outline)] mb-2">
                        Categories
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.categories.map((c, i) => (
                          <span
                            key={i}
                            className="text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEntry.bills && selectedEntry.bills.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--outline)] mb-2">
                        Bills due
                      </p>
                      <div className="flex flex-col gap-2">
                        {selectedEntry.bills.map((b, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-[var(--secondary-container)] text-[var(--on-secondary-container)] rounded-lg px-4 py-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <Icon name="autorenew" className="text-base" />
                              <span className="text-sm font-bold">{b.name}</span>
                            </div>
                            <span className="text-sm font-bold">{formatMoney(b.amount, currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
