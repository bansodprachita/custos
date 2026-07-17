import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatMoney } from "../../utils/currency.js";

export default function MonthlyBarChart({ data, currency }) {
  if (data.length === 0) {
    return <p className="text-sm text-[var(--on-surface-variant)] text-center py-12">No transactions yet to chart.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "var(--font-body)" }} stroke="var(--outline)" />
        <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-body)" }} stroke="var(--outline)" />
        <Tooltip formatter={(value) => formatMoney(value, currency)} />
        <Legend wrapperStyle={{ fontFamily: "var(--font-body)", fontSize: 12 }} />
        <Bar dataKey="income" fill="var(--secondary)" radius={[8, 8, 0, 0]} />
        <Bar dataKey="expense" fill="var(--tertiary)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
