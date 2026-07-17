import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import { api } from "../api/client.js";
import ConfirmDialog from "./ConfirmDialog.jsx";

export default function CategoryManager({ onCategoriesChanged }) {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: "", color: "#5F7A45" });
  const [error, setError] = useState(null);

  const [categoryEdits, setCategoryEdits] = useState({});
  const [savingCategoryId, setSavingCategoryId] = useState(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  async function loadCategories() {
    const data = await api.getCategories();
    setCategories(data);
    onCategoriesChanged?.(data);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleAddCategory(e) {
    e.preventDefault();
    setError(null);
    if (!newCat.name.trim()) {
      setError("Give the category a name.");
      return;
    }
    try {
      await api.createCategory(newCat);
      setNewCat({ name: "", color: "#5F7A45" });
      loadCategories();
    } catch (err) {
      setError(err.message);
    }
  }

  function categoryValue(cat, field) {
    return categoryEdits[cat.id]?.[field] ?? cat[field];
  }

  function updateCategoryEdit(id, field, value) {
    setCategoryEdits((e) => ({ ...e, [id]: { ...e[id], [field]: value } }));
  }

  function hasChanges(cat) {
    const edit = categoryEdits[cat.id];
    if (!edit) return false;
    return (
      (edit.name !== undefined && edit.name !== cat.name) ||
      (edit.color !== undefined && edit.color !== cat.color)
    );
  }

  async function handleSaveCategory(cat) {
    setSavingCategoryId(cat.id);
    setError(null);
    try {
      await api.updateCategory(cat.id, {
        name: categoryValue(cat, "name"),
        color: categoryValue(cat, "color"),
      });
      setCategoryEdits((e) => {
        const next = { ...e };
        delete next[cat.id];
        return next;
      });
      await loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCategoryId(null);
    }
  }

  async function confirmDeleteCategory() {
    if (!pendingDeleteCategory) return;
    setDeleteError(null);
    try {
      await api.deleteCategory(pendingDeleteCategory.id);
      setPendingDeleteCategory(null);
      await loadCategories();
    } catch (err) {
      setDeleteError(err.message);
      setPendingDeleteCategory(null);
    }
  }

  const inputClass =
    "border-none rounded-full px-4 py-2 text-sm bg-[var(--surface-container)] text-[var(--on-surface)]";

  return (
    <section className="animate-in card-hover bg-[var(--surface-lowest)] rounded-lg card-soft p-8 space-y-5">
      <h2 className="font-serif italic text-lg flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center shrink-0">
          <Icon name="sell" className="text-lg" />
        </span>
        Categories
      </h2>

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3">
            <input
              type="color"
              value={categoryValue(c, "color")}
              onChange={(e) => updateCategoryEdit(c.id, "color", e.target.value)}
              className="w-9 h-9 rounded-xl bg-transparent shrink-0 cursor-pointer"
            />
            <input
              type="text"
              value={categoryValue(c, "name")}
              onChange={(e) => updateCategoryEdit(c.id, "name", e.target.value)}
              className={`flex-1 ${inputClass}`}
            />
            {hasChanges(c) && (
              <button
                onClick={() => handleSaveCategory(c)}
                disabled={savingCategoryId === c.id}
                className="text-xs font-bold text-[var(--primary)] disabled:opacity-50 shrink-0"
              >
                {savingCategoryId === c.id ? "Saving…" : "Save"}
              </button>
            )}
            <button
              onClick={() => setPendingDeleteCategory(c)}
              className="w-8 h-8 rounded-full bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-error)] hover:bg-[var(--error)] transition-colors flex items-center justify-center shrink-0"
              aria-label={`Delete ${c.name}`}
            >
              <Icon name="delete" className="text-base" />
            </button>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleAddCategory}
        className="flex items-end gap-3 pt-4 flex-wrap border-t border-[var(--border)] mt-2"
      >
        <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 pt-4 block">
          New category
          <input
            type="text"
            value={newCat.name}
            onChange={(e) => setNewCat((c) => ({ ...c, name: e.target.value }))}
            className={`block font-normal normal-case tracking-normal ${inputClass}`}
            placeholder="Subscriptions"
          />
        </label>
        <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)] space-y-1 block">
          Color
          <input
            type="color"
            value={newCat.color}
            onChange={(e) => setNewCat((c) => ({ ...c, color: e.target.value }))}
            className="block w-10 h-10 rounded-full bg-transparent cursor-pointer"
          />
        </label>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-[13px] font-bold"
        >
          Add category
        </button>
      </form>
      {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      {deleteError && <p className="text-sm text-[var(--error)]">{deleteError}</p>}

      <ConfirmDialog
        open={pendingDeleteCategory !== null}
        title={`Delete "${pendingDeleteCategory?.name}"?`}
        description="Categories with existing transactions can't be deleted until those transactions are reassigned or removed."
        confirmLabel="Delete"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setPendingDeleteCategory(null)}
      />
    </section>
  );
}
