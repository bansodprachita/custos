export const CURRENCY_OPTIONS = [
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
];

export function currencySymbol(code) {
  return CURRENCY_OPTIONS.find((c) => c.code === code)?.symbol ?? "₹";
}

export function formatMoney(amount, currency = "INR") {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return (amount ?? 0).toLocaleString(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}
