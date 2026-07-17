import Icon from "./Icon.jsx";
import { formatMoney } from "../utils/currency.js";

function barColor(percent) {
  if (percent >= 100) return "bg-[var(--error)]";
  if (percent >= 75) return "bg-[var(--tertiary)]";
  return "bg-[var(--primary)]";
}

export default function BudgetProgress({ budgets, currency }) {
  if (budgets.length === 0) {
    return (
      <p className="text-sm text-[var(--on-surface-variant)]">
        No budgets set yet. Add one in Settings to see progress here.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {budgets.map((b) => (
        <div key={b.categoryId}>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-bold flex items-center gap-2">
              <Icon
                name={b.percent >= 100 ? "radio_button_unchecked" : "check_circle"}
                className={`text-base ${b.percent >= 100 ? "text-[var(--outline)]" : "text-[var(--secondary)]"}`}
                filled={b.percent < 100}
              />
              {b.name}
            </span>
            <span className="text-xs text-[var(--on-surface-variant)] font-medium">
              {formatMoney(b.spent, currency)} / {formatMoney(b.budgetAmount, currency)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--surface-highest)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor(b.percent)}`}
              style={{ width: `${Math.min(b.percent, 100)}%` }}
            />
          </div>
          {b.percent >= 100 && (
            <p className="text-xs text-[var(--error)] mt-1.5 font-medium flex items-center gap-1">
              <Icon name="warning" className="text-sm" />
              Over budget by {formatMoney(b.spent - b.budgetAmount, currency)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
