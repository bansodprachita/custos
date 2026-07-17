import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../api/client.js";
import { useSettings } from "../context/SettingsContext.jsx";
import { formatMoney } from "../utils/currency.js";
import Icon from "../components/Icon.jsx";
import CategoryPieChart from "../components/charts/CategoryPieChart.jsx";
import MonthlyBarChart from "../components/charts/MonthlyBarChart.jsx";
import { themedColor } from "../utils/chartPalette.js";

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-widget-gap">
      <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-32 bg-[var(--surface-container)] rounded-lg animate-pulse-soft" />
      <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-32 bg-[var(--surface-container)] rounded-lg animate-pulse-soft" />
      <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-32 bg-[var(--surface-container)] rounded-lg animate-pulse-soft" />
      <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-32 bg-[var(--surface-container)] rounded-lg animate-pulse-soft" />
      <div className="col-span-12 lg:col-span-7 h-80 bg-[var(--surface-container)] rounded-lg animate-pulse-soft" />
      <div className="col-span-12 lg:col-span-5 h-80 bg-[var(--surface-container)] rounded-lg animate-pulse-soft" />
      <div className="col-span-12 lg:col-span-5 h-72 bg-[var(--surface-container)] rounded-lg animate-pulse-soft" />
      <div className="col-span-12 lg:col-span-7 h-72 bg-[var(--surface-container)] rounded-lg animate-pulse-soft" />
    </div>
  );
}

function StatTile({ icon, label, value, sub, delay }) {
  return (
    <div
      className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[var(--surface-lowest)] rounded-lg p-6 flex flex-col justify-between card-soft card-hover animate-in"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
          {label}
        </span>
        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)] shrink-0">
          <Icon name={icon} className="text-base" />
        </div>
      </div>
      <div className="mt-5">
        <p className="font-serif text-2xl leading-none truncate">{value}</p>
        {sub && <p className="text-[11px] text-[var(--outline)] mt-2 truncate">{sub}</p>}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { currency } = useSettings();

  const [allTransactions, setAllTransactions] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetchAll = useCallback(async () => {
    try {
      const [all, cat, month] = await Promise.all([
        api.getTransactions(),
        api.getSummaryByCategory(),
        api.getSummaryByMonth(),
      ]);
      // getTransactions() with no filters returns a bare array, but guard in
      // case the API ever wraps it in a { data, total } shape.
      setAllTransactions(Array.isArray(all) ? all : all?.data || []);
      setByCategory(cat);
      setByMonth(month);
      setError(null);
    } catch (err) {
      setError("Could not reach the Custos API. Is the server running on port 4000?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisKey = monthKey(now);
    const monthTx = allTransactions.filter((t) => monthKey(new Date(t.date)) === thisKey);

    const monthExpense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const monthIncome = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

    const daysElapsed = Math.max(1, now.getDate());
    const avgDaily = monthExpense / daysElapsed;

    const topCategory = byCategory.length > 0 ? byCategory[0] : null;

    const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : null;

    const monthExpenseTx = monthTx.filter((t) => t.type === "expense");
    const largest =
      monthExpenseTx.length > 0 ? monthExpenseTx.reduce((m, t) => (t.amount > m.amount ? t : m)) : null;

    return { avgDaily, topCategory, savingsRate, largest };
  }, [allTransactions, byCategory]);

  const topCategories = byCategory.slice(0, 5);
  const maxCategoryTotal = topCategories.length > 0 ? topCategories[0].total : 0;

  const comparison = useMemo(() => {
    if (byMonth.length === 0) return null;
    const current = byMonth[byMonth.length - 1];
    const previous = byMonth.length >= 2 ? byMonth[byMonth.length - 2] : null;
    return { current, previous };
  }, [byMonth]);

  if (error) {
    return (
      <div className="space-y-widget-gap">
        <h1 className="text-headline-md">analytics</h1>
        <div className="bg-[var(--error-container)] text-[var(--on-error-container)] rounded-md px-5 py-4 text-sm font-medium">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-widget-gap">
        <h1 className="text-headline-md">analytics</h1>
        <AnalyticsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-widget-gap">
      <h1 className="text-headline-md">analytics</h1>

      <div className="grid grid-cols-12 gap-widget-gap">
        <StatTile
          icon="payments"
          label="Avg Daily Spend"
          value={formatMoney(stats.avgDaily, currency)}
          sub="This month so far"
          delay="0s"
        />
        <StatTile
          icon="category"
          label="Top Category"
          value={stats.topCategory ? stats.topCategory.name : "—"}
          sub={stats.topCategory ? `${formatMoney(stats.topCategory.total, currency)} spent` : "No expenses yet"}
          delay="0.05s"
        />
        <StatTile
          icon="savings"
          label="Savings Rate"
          value={stats.savingsRate === null ? "—" : `${Math.round(stats.savingsRate)}%`}
          sub="This month"
          delay="0.1s"
        />
        <StatTile
          icon="receipt_long"
          label="Largest Expense"
          value={stats.largest ? formatMoney(stats.largest.amount, currency) : "—"}
          sub={stats.largest ? stats.largest.description || stats.largest.category?.name || "This month" : "No expenses yet"}
          delay="0.15s"
        />

        {/* Cash flow */}
        <div
          className="col-span-12 lg:col-span-7 bg-[var(--surface-container)] rounded-lg p-8 card-soft card-hover animate-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif italic text-lg">Cash Flow Over Time</h2>
            <Icon name="monitoring" className="text-xl text-[var(--primary)]" />
          </div>
          <MonthlyBarChart data={byMonth} currency={currency} />
        </div>

        {/* Top categories breakdown */}
        <div
          className="col-span-12 lg:col-span-5 bg-[var(--surface-lowest)] rounded-lg p-8 card-soft card-hover animate-in"
          style={{ animationDelay: "0.25s" }}
        >
          <h2 className="font-serif italic text-lg mb-6">Top Categories</h2>
          {topCategories.length === 0 ? (
            <p className="text-sm text-[var(--on-surface-variant)]">No expenses yet to break down.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {topCategories.map((c) => (
                <div key={c.categoryId}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold truncate">{c.name}</span>
                    <span className="text-xs text-[var(--on-surface-variant)] shrink-0 ml-2">
                      {formatMoney(c.total, currency)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface-highest)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-slow"
                      style={{
                        width: `${maxCategoryTotal > 0 ? (c.total / maxCategoryTotal) * 100 : 0}%`,
                        backgroundColor: themedColor(c.categoryId),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spending split */}
        <div
          className="col-span-12 lg:col-span-5 bg-[var(--surface-container)] rounded-lg p-8 card-soft card-hover animate-in"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif italic text-lg">Spending Split</h2>
            <Icon name="donut_large" className="text-xl text-[var(--tertiary)]" />
          </div>
          <CategoryPieChart data={byCategory} currency={currency} />
        </div>

        {/* Month comparison */}
        <div
          className="col-span-12 lg:col-span-7 bg-[var(--surface-lowest)] rounded-lg p-8 card-soft card-hover animate-in"
          style={{ animationDelay: "0.35s" }}
        >
          <h2 className="font-serif italic text-lg mb-6">This Month vs Last</h2>
          {!comparison ? (
            <p className="text-sm text-[var(--on-surface-variant)]">Not enough data yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--outline)]">
                  {comparison.previous ? comparison.previous.month : "Previous"}
                </span>
                <p className="font-serif text-xl mt-1">
                  {comparison.previous
                    ? formatMoney(comparison.previous.income - comparison.previous.expense, currency)
                    : "—"}
                </p>
                <p className="text-[11px] text-[var(--on-surface-variant)] mt-1">
                  {comparison.previous
                    ? `${formatMoney(comparison.previous.income, currency)} in / ${formatMoney(
                        comparison.previous.expense,
                        currency
                      )} out`
                    : "No prior data"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
                  {comparison.current.month}
                </span>
                <p className="font-serif text-xl mt-1">
                  {formatMoney(comparison.current.income - comparison.current.expense, currency)}
                </p>
                <p className="text-[11px] text-[var(--on-surface-variant)] mt-1">
                  {formatMoney(comparison.current.income, currency)} in / {formatMoney(comparison.current.expense, currency)} out
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
