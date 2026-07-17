import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client.js";
import { useSettings } from "../context/SettingsContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import TransactionForm from "../components/TransactionForm.jsx";
import Filters from "../components/Filters.jsx";
import TransactionList from "../components/TransactionList.jsx";
import Pagination from "../components/Pagination.jsx";
import CategoryManager from "../components/CategoryManager.jsx";

const emptyFilters = { search: "", categoryId: "", type: "", from: "", to: "" };
const PAGE_SIZE = 10;

export default function Transactions() {
  const { currency } = useSettings();
  const { name, email } = useAuth();
  const displayName = name || (email || "there").split("@")[0];

  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (currentFilters = filters, currentPage = 1) => {
    try {
      const [cats, res] = await Promise.all([
        api.getCategories(),
        api.getTransactions({ ...currentFilters, page: currentPage, pageSize: PAGE_SIZE }),
      ]);
      setCategories(cats);
      setTransactions(res.data);
      setTotal(res.total);
      setPage(currentPage);
      setError(null);
    } catch (err) {
      setError("Could not reach the Custos API. Is the server running on port 4000?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(emptyFilters, 1);
  }, []);

  async function handleFiltersChange(newFilters) {
    setFilters(newFilters);
    await load(newFilters, 1);
  }

  async function goToPage(newPage) {
    await load(filters, newPage);
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (error) {
    return (
      <div className="bg-[var(--error-container)] text-[var(--on-error-container)] rounded-md px-5 py-4 text-sm font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-widget-gap">
      <div>
        <span className="text-caption-bold text-[var(--primary)]">All Transactions</span>
        <h1 className="text-display-lg text-[var(--on-surface)] mt-1">hello, {displayName}</h1>
        <p className="text-body-main text-[var(--on-surface-variant)] mt-2 max-w-lg">
          Log a new entry, then search, filter, or export the rest.
        </p>
      </div>

      <TransactionForm categories={categories} onCreated={() => load(filters, page)} currency={currency} />

      <CategoryManager onCategoriesChanged={setCategories} />

      <Filters categories={categories} onChange={handleFiltersChange} />

      {loading ? (
        <div className="bg-[var(--surface-container)] rounded-lg h-64 animate-pulse-soft" />
      ) : (
        <>
          <TransactionList
            transactions={transactions}
            onChanged={() => load(filters, page)}
            currency={currency}
            hasActiveFilters={hasActiveFilters}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={goToPage}
          />
        </>
      )}
    </div>
  );
}
