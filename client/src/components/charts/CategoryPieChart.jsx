import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatMoney } from "../../utils/currency.js";
import { themedColor } from "../../utils/chartPalette.js";

export default function CategoryPieChart({ data, currency }) {
  if (data.length === 0) {
    return <p className="text-sm text-[var(--on-surface-variant)] text-center py-12">No expenses yet to chart.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="name" innerRadius={56} outerRadius={92} paddingAngle={3} cornerRadius={6}>
          {data.map((entry) => (
            <Cell key={entry.categoryId} fill={themedColor(entry.categoryId)} stroke="none" />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatMoney(value, currency)} />
        <Legend wrapperStyle={{ fontFamily: "var(--font-body)", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
